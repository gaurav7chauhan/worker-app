import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { JobPost } from '../../models/postModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';

export const listUserRatings = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const auth = await AuthUser.findById(req.auth._id)
      .select('_id isBlocked role')
      .lean();
    if (!auth) {
      throw new AppError('User not found', { status: 404 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const {
      targetId: qTargetId,
      role,
      minScore,
      maxScore,
      withComment,
      page = 1,
      limit = 20,
      sort = 'recent',
    } = req.query;

    const filter = {
      targetUser: auth._id,
      isDeleted: { $ne: true },
    };

    const { setterId, jobId } = req.query;
    if (setterId && !mongoose.Types.ObjectId.isValid(setterId)) {
      throw new AppError('Invalid setterId', { status: 400 });
    }
    if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('Invalid jobId', { status: 400 });
    }
    if (setterId) {
      const tUser = await AuthUser.findById(setterId).select('_id').lean();
      if (!tUser) throw new AppError('Target user not found', { status: 404 });
      filter.setBy = tUser._id;
    }
    if (jobId) {
      const job = await JobPost.findOne({
        _id: jobId,
        status: 'Completed',
      })
        .select('category skills status')
        .lean();
      if (!job) throw new AppError('Job not found', { status: 404 });
      filter.jobId = job._id;
    }

    const single = req.query.single === 'true' || (setterId && jobId);

    if (single) {
      const ratings = await Ratings.findOne(filter)
        .select('setBy jobId score tags comment')
        .populate({ path: 'setBy', select: 'role', options: { lean: true } });
      if (!ratings) {
        throw new AppError('No ratings found', { status: 404 });
      }
      const user =
        ratings.setBy.role === 'Employer' ? EmployerProfile : WorkerProfile;
      const [setter, jobDeta] = await Promise.all([
        user
          .findOne({ userId: ratings.setBy })
          .select('fullName avatarUrl location')
          .lean(),
        JobPost.findById(rating.jobId).select('category skills status').lean(),
      ]);
    }

    const targetId = qTargetId || String(auth._id);

    const targetUser = await AuthUser.findById(targetId)
      .select('_id isBlocked role')
      .lean();
    if (!targetUser) {
      throw new AppError('Target user not found', { status: 404 });
    }
    if (targetUser.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    // OPTIONAL fields....

    if (jobId) {
      const job = await JobPost.findOne({
        _id: jobId,
        status: 'Completed',
      }).lean();
      if (!job) throw new AppError('Job not found', { status: 404 });
      filter.jobId = job._id;
    }

    if (role === 'Employer' || role === 'Worker') {
      filter.targetRole = role;
    }

    let min = minScore != null ? Number(minScore) : null;
    let max = maxScore != null ? Number(maxScore) : null;

    if (Number.isNaN(min)) min = null;
    if (Number.isNaN(max)) max = null;

    if (min != null && max != null && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    if (min != null) {
      filter.score = { ...(filter.score || {}), $gte: min };
    }
    if (max != null) {
      filter.score = { ...(filter.score || {}), $lte: max };
    }
    if (withComment === 'true') {
      filter.comment = { $exists: true, $ne: '' };
    }

    // Sorting
    const sortMap = {
      recent: { createdAt: -1 },
      score_desc: { score: -1, createdAt: -1 },
      score_asc: { score: 1, createdAt: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.recent;

    const pg = Math.max(1, Number(page));
    const lim = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pg - 1) * lim;

    const [items, total] = await Promise.all([
      Ratings.find(filter)
        .select('setBy jobId score tags comment targetRole createdAt')
        .sort(sortSpec)
        .skip(skip)
        .limit(lim)
        .lean(),
      Ratings.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: 'Ratings fetched successfully',
      data: {
        targetId: String(targetUser._id),
        items,
        pagination: {
          page: pg,
          limit: lim,
          total,
          hasMore: skip + items.length < total,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
