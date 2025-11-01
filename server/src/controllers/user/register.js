import mongoose from 'mongoose';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../../validator/registerValid.js';
import { requestOtpService } from '../../utils/otp.js';
import { AppError } from '../../utils/apiError.js';
import { AuthUser } from '../../models/authModel.js';
import { cookieOptions } from '../../services/cookieOptions.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../services/jwt.js';

export const registerEmployer = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const payload = registerEmployerSchema.safeParse(req.body);
    if (!payload.success) {
      throw new AppError(payload.error.issues[0].message, { status: 400 });
    }

    const { email, password, fullName, address, role, location } = payload.data;

    let data;
    let id;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip;

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
      const userAddress = address?.trim();
      const [user] = await EmployerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
            ...(userAddress ? { address: userAddress } : {}),
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
        address,
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
      .json({ data, accessToken, message: 'User Registered successfully' });
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
      const first = payload.error?.issues[0];
      return res
        .status(400)
        .json({ message: `${first?.message} in ${first?.path}` });
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
      const userAddress = address?.trim();

      let geoLocation;
      if (location) {
        if (location.type !== 'Point' || !Array.isArray(location.coordinates)) {
          throw Object.assign(
            new Error(
              'Invalid location: must be GeoJSON Point with coordinates [lng, lat]'
            ),
            { status: 400 }
          );
        }

        let [lng, lat] = location.coordinates.map(Number);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          throw Object.assign(
            new Error('Invalid location: lng/lat must be numbers'),
            { status: 400 }
          );
        }

        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          throw Object.assign(
            new Error('Invalid location: lng in [-180,180], lat in [-90,90]'),
            { status: 400 }
          );
        }

        geoLocation = { type: 'Point', coordinates: [lng, lat] };
      }

      const [user] = await WorkerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
            category,
            ...(skills !== undefined ? { skills } : {}),
            ...(userAddress ? { address: userAddress } : {}),
            ...(experienceYears !== undefined ? { experienceYears } : {}),
            ...(geoLocation ? { location: geoLocation } : {}),
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
        category,
        skills,
        address: userAddress ?? null,
        location: geoLocation ?? null,
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
      .json({ data, accessToken, message: 'User Registered successfully' });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
