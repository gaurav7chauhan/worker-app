import mongoose from 'mongoose';
import { EmployerProfile, WorkerProfile } from '../models/userModel.js';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../validator/validate.js';
import { requestOtpService } from '../utils/otp.js';
import { AppError } from '../utils/apiError.js';
import { AuthUser } from '../models/authModel.js';
import { cookieOptions } from '../services/cookieOptions.js';
import { generateAccessToken, generateRefreshToken } from '../services/jwt.js';

export const registerEmployer = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const payload = registerEmployerSchema.safeParse(req.body);
    if (!payload.success) {
      throw new AppError(payload.error.issues[0].message, { status: 400 });
    }

    const { email, password, fullName, area, role } = payload.data;

    let data;
    let id;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')?.trim();

    // session started
    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw new AppError('User already exists. Please login', {
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

      id = data.auth_id;
    });

    // Important: send OTP after the transaction is committed
    // const response = await requestOtpService(String(id), email, 'register');

    // return res.status(201).json({
    //   message: response.resent
    //     ? 'Registered; OTP resent. Please verify.'
    //     : 'Registered; OTP sent. Please verify.',
    // });
    const accessToken = generateAccessToken(id);
    const refreshToken = await generateRefreshToken(id, 'User', ip, userAgent);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res
      .status(201)
      .json({ data, accessToken, message: 'Registered successfully' });
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
    let id;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip;

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

      id = data.auth_id;
    });

    // const response = await requestOtpService(String(id), email, 'register');

    // return res.status(201).json({
    //   message: response.resent
    //     ? 'Registered; OTP resent. Please verify.'
    //     : 'Registered; OTP sent. Please verify.',
    // });
    const accessToken = generateAccessToken(id);
    const refreshToken = await generateRefreshToken(id, 'User', ip, userAgent);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res
      .status(201)
      .json({ data, accessToken, message: 'Registered successfully' });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
