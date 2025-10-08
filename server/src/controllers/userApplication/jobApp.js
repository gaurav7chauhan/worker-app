import { Application } from '../../models/applicationModel';
import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';

export const jobApplications = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const auth = await AuthUser.findById(req.auth._id)
      .select('role isBlocked _id')
      .lean();
    if (auth.role !== 'Employer') {
      throw new AppError('Only employers can get application', { status: 403 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const employer = await EmployerProfile.findOne({ userId: auth._id })
      .select('_id')
      .lean();
    if (!employer) {
      throw new AppError('Employer profile not found', { status: 404 });
    }

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

    const jobIds = jobs.map((j) => j._id);
    const filter = { jobId: { $in: jobIds } };

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
  } catch (e) {
    return next(e);
  }
};
