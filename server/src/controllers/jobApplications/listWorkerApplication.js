import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { Application } from '../../models/applicationModel.js';
import { AuthUser } from '../../models/authModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const listWorkerApplication = asyncHandler(async (req, res) => {
  // auth & pagination
  const authUser = req.authUser;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const status = req.query.status;

  // worker lookup
  const worker = await WorkerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();

  if (!worker) {
    throw new AppError('Worker profile not found', { status: 404 });
  }

  // application filter
  const filter = { workerId: worker._id };
  if (status) filter.status = status;

  // db fetch
  const [items, total] = await Promise.all([
    Application.find(filter)
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

  // response
  return res.status(200).json({
    page,
    limit,
    total,
    items,
    message: 'Applications fetched successfully',
  });
});
