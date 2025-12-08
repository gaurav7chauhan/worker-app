import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { WorkerProfile } from '../../models/workerModel.js';

export const getWorker = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    if (!workerId) {
      throw new AppError('workerId param is required', { status: 400 });
    }
    if (!mongoose.isValidObjectId(workerId)) {
      throw new AppError('Invalid workerId', { status: 400 });
    }

    const doc = await WorkerProfile.findById(workerId)
      .select('-location')
      .lean();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Worker Profile not found',
        doc,
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Worker fetched successfully',
      worker: doc,
    });
  } catch (e) {
    if (e?.name === 'CastError') {
      return next(new AppError('Invalid workerId', { status: 400 }));
    }
    return next(e);
  }
};
