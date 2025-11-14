import mongoose from 'mongoose';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';
import { workerFilterSchema } from '../../validator/fetchValid.js';

export const filterWorkers = async (req, res, next) => {
  try {
    const parsed = workerFilterSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data.', {
        status: 422,
      });
    }

    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).filter((_, v) => v !== undefined)
    );

    const filters = {};
    if (cleaned.languages) filters.languages = { $in: cleaned.languages };
    if (cleaned.openForWork) filters.openForWork = cleaned.openForWork;
  } catch (e) {
    return next(e);
  }
};
