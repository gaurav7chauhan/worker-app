import mongoose from 'mongoose';
import { EmployerProfile, WorkerProfile } from '../models/user';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../validator/validate';
import { AuthUser } from '../models/AuthUser';
import { requestOtpService, verifyOtpService } from '../utils/otp';

export const registerEmployer = async (req, res) => {
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
        throw Object.assign(new Error('User already exists'), { status: 409 });
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
      await EmployerProfile.create(
        { userId, fullName, ...(area.trim() ? { area } : {}) },
        { session }
      );
    });

    // Important: send OTP after the transaction is committed
    await requestOtpService({
      userId: String(userId),
      email,
      purpose: 'register',
    });

    return res.status(201).json({ message: 'Registered; OTP sent. Please verify.' });
  } catch (error) {
    const code = error?.status || 400;
    return res
      .status(code)
      .json({ message: error.message || 'Invalid request payload' });
  } finally {
    await session.endSession();
  }
};

export const registerWorker = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const payload = registerWorkerSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ message: payload.error.issues[0].message });
    }

    const { email, password, fullName, area, skills, experienceYears } =
      payload.data.body;

    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw Object.assign(new Error('User already exists'), { status: 409 });
      }

      const user = await AuthUser.create(
        {
          email,
          password,
          role: 'Worker',
        },
        { session }
      );

      const userId = user._id;

      // Create WorkerProfile
      await WorkerProfile.create(
        {
          userId,
          fullName,
          skills,
          ...(area.trim() ? { area: area.trim() } : {}),
          ...(experienceYears !== undefined ? { experienceYears } : {}),
        },
        { session }
      );
    });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    const status = error.status || 400;
    return res
      .status(status)
      .json({ message: error.message || 'Invalid request payload' });
  } finally {
    await session.endSession();
  }
};
