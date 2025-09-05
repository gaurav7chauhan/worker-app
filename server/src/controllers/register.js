import mongoose from 'mongoose';
import { EmployerProfile, WorkerProfile } from '../models/user';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../validator/validate';
import { AuthUser } from '../models/AuthUser';
import { requestOtpService } from '../utils/otp';
import { AppError } from '../utils/apiError';

export const registerEmployer = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const payload = registerEmployerSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ message: payload.error.issues[0].message });
    }

    const { email, password, fullName, area } = payload.data.body;

    let userId;

    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw new AppError('User already exists', {
          status: 409,
          code: 'USER_EXISTS',
        });
      }

      // Create AuthUser
      const setExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const created = await AuthUser.create(
        {
          email,
          password,
          role: 'Employer',
          emailVerified: false,
          verificationExpires: setExpiration,
        },
        { session }
      );

      userId = created._id;

      // Create EmployerProfile
      const areaClean = area?.trim();
      await EmployerProfile.create(
        { userId, fullName, ...(areaClean ? { area: areaClean } : {}) },
        { session }
      );
    });

    // Important: send OTP after the transaction is committed
    const response = await requestOtpService(String(userId), email, 'register');

    return res.status(201).json({
      message: response.resent
        ? 'Registered; OTP resent. Please verify.'
        : 'Registered; OTP sent. Please verify.',
    });
  } catch (error) {
    return next(error);
    // const code = error?.status || 500;
    // return res
    //   .status(code)
    //   .json({ message: error.message || 'Invalid request payload' });
  } finally {
    await session.endSession();
  }
};

export const registerWorker = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const payload = registerWorkerSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ message: payload.error.issues[0].message });
    }

    const { email, password, fullName, area, skills, experienceYears } =
      payload.data.body;

    let userId;

    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw Object.assign(new Error('User already exists'), { status: 409 });
      }

      const setExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const created = await AuthUser.create(
        {
          email,
          password,
          role: 'Worker',
          emailVerified: false,
          verificationExpires: setExpiration,
        },
        { session }
      );

      userId = created._id;

      // Create WorkerProfile
      const areaClean = area?.trim();
      await WorkerProfile.create(
        {
          userId,
          fullName,
          skills,
          ...(areaClean ? { area: areaClean } : {}),
          ...(experienceYears !== undefined ? { experienceYears } : {}),
        },
        { session }
      );
    });

    const response = await requestOtpService(String(userId), email, 'register');

    return res.status(201).json({
      message: response.resent
        ? 'Registered; OTP resent. Please verify.'
        : 'Registered; OTP sent. Please verify.',
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
