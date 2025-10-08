import { Application } from '../../models/applicationModel.js';
import { AuthUser } from '../../models/authModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const listMyApplications = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const auth = await AuthUser.findById(req.auth._id)
      .select('_id role isBlocked')
      .lean();
    if (auth.role !== 'Worker') {
      throw new AppError('Only workers can get applications', { status: 403 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const worker = await WorkerProfile.findOne({ userId: auth._id })
      .select('_id')
      .lean();

    if (!worker) {
      throw new AppError('Worker profile not found', { status: 404 });
    }

    const filter = { workerId: worker._id };
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      (await Application.find(filter))
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Application.countDocuments(filter),
    ]);

    if (items.length === 0) {
      return res
        .status(200)
        .json({ page, limit, total, items: [], message: 'No applications' });
    }

    return res.status(200).json({
      page,
      limit,
      total,
      items,
      message: 'Applications fetched successfully',
    });
  } catch (error) {
    return next(error);
  }
};
