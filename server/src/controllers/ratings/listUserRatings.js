import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { JobPost } from '../../models/postModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const listUserRatings = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // 2) Extract query filters
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

  // 3) Validate optional IDs
  if (targetId && !mongoose.Types.ObjectId.isValid(targetId)) {
    throw new AppError('Invalid targetId', { status: 400 });
  }
  if (raterId && !mongoose.Types.ObjectId.isValid(raterId)) {
    throw new AppError('Invalid raterId', { status: 400 });
  }
  if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid jobId', { status: 400 });
  }

  // 4) Resolve target user (default = self)
  let tUserId = authUser._id;

  if (targetId) {
    const targetAuth = await AuthUser.findById(targetId)
      .select('_id isBlocked')
      .lean();

    if (!targetAuth) {
      throw new AppError('Target user not found', { status: 404 });
    }
    if (targetAuth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }
    tUserId = targetAuth._id;
  }

  // 5) Base ratings filter
  const filter = {
    targetUser: tUserId,
    isDeleted: { $ne: true },
  };

  // 6) Optional rater & job filters
  if (raterId) {
    const raterUser = await AuthUser.findById(raterId).select('_id').lean();
    if (!raterUser) {
      throw new AppError('Target user not found', { status: 404 });
    }
    filter.setBy = raterUser._id;
  }

  if (jobId) {
    const job = await JobPost.findOne({ _id: jobId, status: 'Completed' })
      .select('_id')
      .lean();
    if (!job) throw new AppError('Job not found', { status: 404 });
    filter.jobId = job._id;
  }

  // 7) Single rating mode
  const single = req.query.single === 'true' || (raterId && jobId);

  if (single) {
    const ratings = await Ratings.findOne(filter)
      .select('setBy jobId score tags comment createdAt')
      .populate({ path: 'setBy', select: 'role' })
      .lean();

    if (!ratings) {
      throw new AppError('No ratings found', { status: 404 });
    }

    const ProfileModel =
      ratings.setBy?.role === 'Employer' ? EmployerProfile : WorkerProfile;

    const [rater, jobData] = await Promise.all([
      ProfileModel.findOne({ userId: ratings.setBy })
        .select('userId fullName avatarUrl location')
        .populate({ path: 'userId', select: 'role' })
        .lean(),
      JobPost.findById(ratings.jobId).select('category skills status').lean(),
    ]);

    return res.status(200).json({
      message: 'Ratings fetched successfully',
      data: {
        targetId: String(tUserId),
        items: [
          {
            raterInfo: {
              _id: rater?.userId,
              name: rater?.fullName || '',
              role: rater?.userId?.role || '',
              avatar: rater?.avatarUrl || '',
            },
            jobInfo: {
              jobId: ratings.jobId,
              category: jobData?.category || '',
              skills: jobData?.skills || [],
              status: jobData?.status || 'Completed',
            },
            rating: {
              score: ratings.score,
              tags: ratings.tags || [],
              comment: ratings.comment || '',
              createdAt: ratings.createdAt,
            },
          },
        ],
        pagination: { page: 1, limit: 1, total: 1, hasMore: false },
      },
    });
  }

  // 8) Optional list filters
  if (role === 'Employer' || role === 'Worker') {
    filter.targetRole = role;
  }

  let min = minScore != null ? Number(minScore) : null;
  let max = maxScore != null ? Number(maxScore) : null;

  if (min != null) filter.score = { ...(filter.score || {}), $gte: min };
  if (max != null) filter.score = { ...(filter.score || {}), $lte: max };

  if (withComment === 'true') {
    filter.comment = { $exists: true, $ne: '' };
  }

  // 9) Sorting & pagination
  const sortMap = {
    recent: { createdAt: -1 },
    score_desc: { score: -1, createdAt: -1 },
    score_asc: { score: 1, createdAt: -1 },
  };

  const pg = Math.max(1, Number(page));
  const lim = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pg - 1) * lim;

  const [items, total] = await Promise.all([
    Ratings.find(filter)
      .select('setBy jobId score tags comment targetRole createdAt')
      .populate({ path: 'setBy', select: 'role' })
      .sort(sortMap[sort] || sortMap.recent)
      .skip(skip)
      .limit(lim)
      .lean(),
    Ratings.countDocuments(filter),
  ]);

  if (!items.length) {
    return res.status(200).json({ message: 'No user ratings' });
  }

  // 10) Batch load profiles & jobs
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
    JobPost.find({ _id: { $in: jobIds } })
      .select('_id category skills status')
      .lean(),
  ]);

  const empMap = new Map(employer.map((v) => [String(v.userId), v]));
  const workerMap = new Map(worker.map((v) => [String(v.userId), v]));
  const jobMap = new Map(jobs.map((v) => [String(v._id), v]));

  const decorated = items.map((r) => {
    const setterId = String(r.setBy);
    const profile =
      r.setBy?.role === 'Employer'
        ? empMap.get(setterId)
        : workerMap.get(setterId);

    const job = jobMap.get(String(r.jobId));

    return {
      setterUser: {
        _id: setterId,
        name: profile?.fullName || '',
        role: r.setBy?.role || '',
        avatar: profile?.avatarUrl || '',
      },
      job: {
        _id: String(r.jobId),
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
      targetId: String(tUserId),
      items: decorated,
      pagination: {
        page: pg,
        limit: lim,
        total,
        hasMore: skip + decorated.length < total,
      },
    },
  });
});
