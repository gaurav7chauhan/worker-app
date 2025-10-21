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
      targetId,
      raterId,
      jobId,
      role,
      minScore,
      maxScore,
      withComment,
      page = 1,
      limit = 20,
      sort = 'recent',
    } = req.query;

    if (targetId && !mongoose.Types.ObjectId.isValid(targetId)) {
      throw new AppError('Invalid targetId', { status: 400 });
    }
    if (raterId && !mongoose.Types.ObjectId.isValid(raterId)) {
      throw new AppError('Invalid raterId', { status: 400 });
    }
    if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('Invalid jobId', { status: 400 });
    }

    let tUserId = auth._id;

    if (targetId) {
      const targetAuth = await AuthUser.findById(targetId)
        .select('_id isBlocked role')
        .lean();
      if (!targetAuth) {
        throw new AppError('Target user not found', { status: 404 });
      }
      if (targetAuth.isBlocked) {
        throw new AppError('Account is blocked by admin', { status: 403 });
      }
      tUserId = targetAuth._id;
    }

    const filter = {
      targetUser: tUserId,
      isDeleted: { $ne: true },
    };

    if (raterId) {
      const raterUser = await AuthUser.findById(raterId).select('_id').lean();
      if (!raterUser)
        throw new AppError('Target user not found', { status: 404 });
      filter.setBy = raterUser._id;
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

    const single = req.query.single === 'true' || (raterId && jobId);

    if (single) {
      const ratings = await Ratings.findOne(filter)
        .select('setBy jobId score tags comment createdAt')
        .populate({ path: 'setBy', select: 'role', options: { lean: true } });
      if (!ratings) {
        throw new AppError('No ratings found', { status: 404 });
      }
      const user =
        ratings.setBy.role === 'Employer' ? EmployerProfile : WorkerProfile;
      const [rater, jobData] = await Promise.all([
        user
          .findOne({ userId: ratings.setBy })
          .select('userId fullName avatarUrl location')
          .populate({ path: 'userId', select: 'role' })
          .lean(),
        JobPost.findById(ratings.jobId).select('category skills status').lean(),
      ]);

      const singleUserData = {
        raterInfo: {
          _id: rater.userId,
          name: rater.fullName || '',
          role: rater.userId?.role || '',
          avatar: rater.avatarUrl || '',
        },
        jobInfo: {
          jobId: ratings.jobId,
          category: jobData.category || '',
          skills: jobData.skills || [],
          status: jobData.status || 'Completed',
        },
        rating: {
          score: ratings.score || '',
          tags: ratings.tags || [],
          comment: ratings.comment || '',
          createdAt: ratings.createdAt,
        },
      };

      return res.status(200).json({
        message: 'Ratings fetched successfully',
        data: {
          targetId: String(tUserId),
          items: [singleUserData],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            hasMore: false,
          },
        },
      });
    }

    // MORE THAN ONE R*
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
      const setterId = String(r.setBy);
      const setterRole = r.setBy?.role;
      const profile =
        setterRole === 'Employer'
          ? empMap.get(setterId)
          : workerMap.get(setterId);

      const jId = String(r.jobId);
      const job = jobMap.get(jId);

      return {
        setterUser: {
          _id: setterId,
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
        targetId: tUserId,
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
