import mongoose from 'mongoose';
import { EmployerProfile, WorkerProfile } from '../models/user.js';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../validator/validate.js';
import { requestOtpService } from '../utils/otp.js';
import { AppError } from '../utils/apiError.js';
import { AuthUser } from '../models/AuthUser.js';

export const registerEmployer = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const payload = registerEmployerSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ message: payload.error.issues[0].message });
    }

    const { email, password, fullName, area, role } = payload.data;

    let data;

    // session started
    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw new AppError('User already exists', {
          status: 409,
        });
      }

      // Create AuthUser
      const setExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const [authDoc] = await AuthUser.create(
        [
          {
            email,
            password,
            role,
            emailVerified: false,
            verificationExpires: setExpiration,
          },
        ],
        { session }
      );

      // Create EmployerProfile
      const areaClean = area?.trim();
      const [user] = await EmployerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
            ...(areaClean ? { area: areaClean } : {}),
          },
        ],
        { session }
      );

      data = {
        auth_id: authDoc._id,
        user_id: user._id,
        fullName,
        email,
        role,
        area,
      };
    });

    // Important: send OTP after the transaction is committed
    // const response = await requestOtpService(String(userId), email, 'register');

    // return res.status(201).json({
    //   message: response.resent
    //     ? 'Registered; OTP resent. Please verify.'
    //     : 'Registered; OTP sent. Please verify.',
    // });
    return res.status(201).json({ data, message: 'Registered successfully' });
  } catch (error) {
    return next(error);
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

    const { email, password, fullName, area, skills, experienceYears, role } =
      payload.data;

    let data;

    // session started
    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw Object.assign(new Error('User already exists'), { status: 409 });
      }

      const setExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const [authDoc] = await AuthUser.create(
        [
          {
            email,
            password,
            role,
            emailVerified: false,
            verificationExpires: setExpiration,
          },
        ],
        { session }
      );

      // Create WorkerProfile
      const areaClean = area?.trim();
      const [user] = await WorkerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
            skills,
            ...(areaClean ? { area: areaClean } : {}),
            ...(experienceYears !== undefined ? { experienceYears } : {}),
          },
        ],
        { session }
      );

      data = {
        auth_id: authDoc._id,
        user_id: user._id,
        fullName,
        email,
        role,
        skills,
        area,
        experienceYears,
      };
    });

    // const response = await requestOtpService(String(userId), email, 'register');

    // return res.status(201).json({
    //   message: response.resent
    //     ? 'Registered; OTP resent. Please verify.'
    //     : 'Registered; OTP sent. Please verify.',
    // });
    return res.status(201).json({ data, message: 'Registered successfully' });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
