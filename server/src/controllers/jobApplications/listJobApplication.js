import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { Application } from '../../models/applicationModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';

export const listJobApplications = asyncHandler(async (req, res) => {
  // auth & pagination
  const authUser = req.authUser;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const status = req.query.status;

  // employer lookup
  const employer = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();
  if (!employer) {
    throw new AppError('Employer profile not found', { status: 404 });
  }

  // employer jobs
  const jobs = await JobPost.find({ employerId: employer._id })
    .select('_id')
    .lean();
  if (jobs.length === 0) {
    return res.status(200).json({
      page,
      limit,
      total: 0,
      items: [],
      message: 'No Job post created',
    });
  }

  // application filter
  const jobIds = jobs.map((j) => j._id);
  const filter = { jobId: { $in: jobIds } };
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
