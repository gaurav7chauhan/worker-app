import mongoose from 'mongoose';
import { EmployerProfile, WorkerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import {
  registerEmployerSchema,
  registerWorkerSchema,
} from '../../validator/register_valid.js';
import { AppError } from '../../utils/apiError.js';
import { AuthUser } from '../../models/authModel.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

// EMPLOYER
export const registerEmployer = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const payload = registerEmployerSchema.safeParse(req.body);
    if (!payload.success) {
      const first = payload.error.issues[0];
      throw new AppError(first.message, { status: 400 });
    }

    const { email, password, role, fullName } = payload.data;
    let userId;

    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);
      if (exists) {
        throw new AppError('User already exists. Please login', {
          status: 409,
        });
      }

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

      await EmployerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
          },
        ],
        { session }
      );

      userId = authDoc._id;
    });

    return res.status(201).json({
      status: 'pending',
      message: `Welcome ${fullName}! Please verify your email.`,
      userId,
      email,
    });
  } finally {
    await session.endSession();
  }
});

// WORKER
export const registerWorker = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const payload = registerWorkerSchema.safeParse(req.body);
    if (!payload.success) {
      const first = payload.error.issues[0];
      throw new AppError(first.message, { status: 400 });
    }

    const { email, password, role, fullName } = payload.data;
    let userId;

    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);
      if (exists) {
        throw new AppError('User already exists. Please login', {
          status: 409,
        });
      }

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

      await WorkerProfile.create(
        [
          {
            userId: authDoc._id,
            fullName,
          },
        ],
        { session }
      );

      userId = authDoc._id;
    });

    return res.status(201).json({
      status: 'pending',
      message: `Welcome ${fullName}! Please verify your email.`,
      userId,
      email,
    });
  } finally {
    await session.endSession();
  }
});
