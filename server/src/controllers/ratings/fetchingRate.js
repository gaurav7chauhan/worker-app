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

    const targetUser = await AuthUser.findById(qTargetId)
      .select('_id isBlocked role')
      .lean();
    if (!targetUser) {
      throw new AppError('Target user not found', { status: 404 });
    }
    if (targetUser.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const targetId = targetUser._id || String(auth._id);

    const filter = {
      targetUser: targetId,
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
        .select('setBy jobId score tags comment createdAt')
        .populate({ path: 'setBy', select: 'role', options: { lean: true } });
      if (!ratings) {
        throw new AppError('No ratings found', { status: 404 });
      }
      const user =
        ratings.setBy.role === 'Employer' ? EmployerProfile : WorkerProfile;
      const [setter, jobDeta] = await Promise.all([
        user
          .findOne({ userId: ratings.setBy })
          .select('userId fullName avatarUrl location')
          .populate({ path: 'userId', select: 'role' })
          .lean(),
        JobPost.findById(ratings.jobId).select('category skills status').lean(),
      ]);

      const data = {
        targetUser: {
          _id: setter.userId,
          name: setter.fullName || '',
          role: setter.userId?.role || '',
          avatar: setter.avatarUrl || '',
        },
        job: {
          jobId: ratings.jobId,
          category: jobDeta.category || '',
          skills: jobDeta.skills || [],
          status: jobDeta.status || 'Completed',
        },
        rating: {
          score: rating.score || '',
          tags: ratings.tags || [],
          comment: ratings.comment || '',
          createdAt: ratings.createdAt,
        },
      };

      return res
        .status(200)
        .json({ message: 'Ratings fetched successfully', data });
    }

    // OPTIONAL fields....

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
        .populate({ path: 'setBy', select: 'role' })
        .sort(sortSpec)
        .skip(skip)
        .limit(lim)
        .lean(),
      Ratings.countDocuments(filter),
    ]);

    if (items.length === 0) {
      return res.status(200).json({ message: 'No user ratings' });
    }

    const employerIds = items
      .filter((r) => r.setBy?.role === 'Employer')
      .map((r) => r.setBy);
    const workerIds = items
      .filter((r) => r.setBy?.role === 'Worker')
      .map((r) => r.setBy);
    const jobIds = [...new Set(items.map((r) => String(r.jobId)))];

    const [employer, worker, jobs] = await Promise.all([
      EmployerProfile.find({ userId: { $in: employerIds } })
        .select('userId fullName avatarUrl location')
        .lean(),
      WorkerProfile.find({ userId: { $in: workerIds } })
        .select('userId fullName avatarUrl location')
        .lean(),
      jobIds.length
        ? JobPost.find({ _id: { $in: jobIds } })
            .select('_id category skills status')
            .lean()
        : Promise.resolve([]),
    ]);

    const empMap = new Map(employer.map((v) => [String(v.userId), v]));
    const workerMap = new Map(worker.map((v) => [v.userId, v]));
    const jobMap = new Map(jobs.map((v) => [v._id, v]));

    const decorated = items.map((r) => {
      const uid = r.setBy;
      const setterRole = r.setBy?.role;
      const profile = setterRole === 'Employer' ? empMap : workerMap;

      const jId = String(r.jobId);
      const job = jobMap.get(jId);

      return {
        setterUser: {
          _id: uid,
          name: profile?.fullName || '',
          role: setterRole || '',
          avatar: profile?.avatarUrl || '',
        },
        job: {
          _id: jId,
          category: job?.category || '',
          skills: job?.skills || [],
          status: job?.status || 'Completed',
        },
        rating: {
          score: r.score,
          tags: r.tags || [],
          comment: r.comment || '',
          createdAt: r.createdAt,
        },
      };
    });

    return res.status(200).json({
      message: 'Ratings fetched successfully',
      data: {
        targetId: String(targetUser._id),
        items: decorated,
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
