import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const fetchingWorkers = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    if (workerId) {
      const doc = await WorkerProfile.findById(workerId)
        .select('-location')
        .lean();

      if (!doc) {
        throw new AppError('Worker profile not found', { status: 404 });
      }

      return res
        .status(200)
        .json({ message: 'Worker fetched successfully', doc });
    }
  } catch (e) {
    return next(e);
  }
};
