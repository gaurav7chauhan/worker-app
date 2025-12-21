import mongoose from 'mongoose';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../../validator/register_valid.js';
import { requestOtpService } from '../../services/otp.js';
import { AppError } from '../../utils/apiError.js';
import { AuthUser } from '../../models/authModel.js';
import { cookieOptions } from '../../utils/cookieOptions.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import { parseLocation } from '../../common/mainLocation.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const registerEmployer = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // Validate request body
    const payload = registerEmployerSchema.safeParse(req.body);
    if (!payload.success) {
      const first = payload.error?.issues[0];
      throw new AppError(first.message, { status: 400 });
    }

    const { email, password, fullName, address, role, location } = payload.data;

    let userId;

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

    // Transaction start
    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);
      if (exists) {
        throw new AppError('User already exists. Please login', {
          status: 409,
        });
      }

      // Create auth user
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const [authDoc] = await AuthUser.create(
        [
          {
            email,
            password,
            role,
            emailVerified: false,
            verificationExpires,
          },
        ],
        { session }
      );

      // Prepare optional fields
      const userAddress = address?.trim() || null;

      let geoLocation = null;
      if (location) {
        const { lng, lat } = parseLocation(location);
        geoLocation = { type: 'Point', coordinates: [lng, lat] };
      }

      // Create employer profile
      const [profile] = await EmployerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
            ...(userAddress && { address: userAddress }),
            ...(geoLocation && { location: geoLocation }),
          },
        ],
        { session }
      );

      userId = authDoc._id;
    });

    // OTP flow (kept for future use)
    // Important: send OTP after the transaction is committed
    // const response = await requestOtpService(String(id), email, 'register');

    // return res.status(201).json({
    //   message: response.resent
    //     ? 'Registered; OTP resent. Please verify.'
    //     : 'Registered; OTP sent. Please verify.',
    // });

    const accessToken = generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(
      userId,
      'User',
      ip,
      userAgent
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(201).json({
      status: 'success',
      message: 'Employer registered successfully',
      token: accessToken,
      userId,
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
});

export const registerWorker = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // Validate request body
    const payload = registerWorkerSchema.safeParse(req.body);
    if (!payload.success) {
      const first = payload.error?.issues[0];
      throw new AppError(first.message, { status: 400 });
    }

    const {
      email,
      password,
      fullName,
      address,
      location,
      category,
      skills,
      experienceYears,
      role,
    } = payload.data;

    let userId;

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

    // Transaction start
    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);
      if (exists) {
        throw new AppError('User already exists. Please login', {
          status: 409,
        });
      }

      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Create auth user
      const [authDoc] = await AuthUser.create(
        [
          {
            email,
            password,
            role,
            emailVerified: false,
            verificationExpires,
          },
        ],
        { session }
      );

      const userAddress = address?.trim() || null;

      let geoLocation = null;
      if (location) {
        const { lng, lat } = parseLocation(location);
        geoLocation = { type: 'Point', coordinates: [lng, lat] };
      }

      // Create worker profile
      await WorkerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
            category,
            ...(skills !== undefined && { skills }),
            ...(experienceYears !== undefined && { experienceYears }),
            ...(userAddress && { address: userAddress }),
            ...(geoLocation && { location: geoLocation }),
          },
        ],
        { session }
      );

      userId = authDoc._id;
    });

    // OTP flow (kept for future use)
    // Important: send OTP after the transaction is committed
    // const response = await requestOtpService(String(id), email, 'register');

    // return res.status(201).json({
    //   message: response.resent
    //     ? 'Registered; OTP resent. Please verify.'
    //     : 'Registered; OTP sent. Please verify.',
    // });

    const accessToken = generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(
      userId,
      'User',
      ip,
      userAgent
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(201).json({
      status: 'success',
      message: 'Worker registered successfully',
      token: accessToken,
      userId,
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
});
