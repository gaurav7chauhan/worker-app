import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const myGivenRatings = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // 2) Extract filters & pagination
  const {
    targetUserId,
    jobId,
    role,
    minScore,
    maxScore,
    withComment,
    page = 1,
    limit = 20,
    sort = 'recent',
  } = req.query;

  const filter = {
    setBy: authUser._id,
    isDeleted: { $ne: true },
  };

  // 3) Validate optional IDs
  if (targetUserId && !mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError('Invalid targetUserId', { status: 400 });
  }
  if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid jobId', { status: 400 });
  }

  if (targetUserId) {
    const tUser = await AuthUser.findById(targetUserId).select('_id').lean();
    if (!tUser) throw new AppError('Target user not found', { status: 404 });
    filter.targetUser = tUser._id;
  }

  if (jobId) {
    const job = await JobPost.findOne({ _id: jobId, status: 'Completed' })
      .select('_id')
      .lean();
    if (!job) throw new AppError('Job not found', { status: 404 });
    filter.jobId = job._id;
  }

  // 4) Single rating mode (targetUser + job)
  const single = req.query.single === 'true' || (targetUserId && jobId);

  if (single) {
    const rating = await Ratings.findOne(filter)
      .select('targetUser jobId score tags comment targetRole createdAt')
      .lean();

    if (!rating) {
      throw new AppError('User ratings not found', { status: 404 });
    }

    const uid = String(rating.targetUser);
    const roleTU = rating.targetRole;

    const [profile, jobDoc] = await Promise.all([
      roleTU === 'Employer'
        ? EmployerProfile.findOne({ userId: uid })
            .select('fullName avatarUrl location')
            .lean()
        : WorkerProfile.findOne({ userId: uid })
            .select('fullName avatarUrl location')
            .lean(),
      JobPost.findById(rating.jobId).select('category skills status').lean(),
    ]);

    return res.status(200).json({
      message: 'Rating fetched successfully',
      data: {
        targetUser: {
          _id: uid,
          name: profile?.fullName || '',
          role: roleTU,
          avatar: profile?.avatarUrl || '',
        },
        job: {
          _id: String(rating.jobId),
          category: jobDoc?.category || '',
          skills: jobDoc?.skills || [],
          status: jobDoc?.status || 'Completed',
        },
        rating: {
          score: rating.score,
          tags: rating.tags || [],
          comment: rating.comment || '',
          createdAt: rating.createdAt,
        },
      },
    });
  }

  // 5) Optional list filters
  if (role === 'Employer' || role === 'Worker') {
    filter.targetRole = role;
  }

  let min = minScore != null ? Number(minScore) : null;
  let max = maxScore != null ? Number(maxScore) : null;

  if (min != null) filter.score = { ...(filter.score || {}), $gte: min };
  /*filter.score = {
    $gte >= min 
  }*/
  if (max != null) filter.score = { ...(filter.score || {}), $lte: max };

  if (withComment === 'true') {
    filter.comment = { $exists: true, $ne: '' };
  }

  // 6) Sorting & pagination
  const sortMap = {
    recent: { createdAt: -1 },
    score_desc: { score: -1, createdAt: -1 },
    score_asc: { score: 1, createdAt: -1 },
  };

  const pg = Math.max(1, Number(page));
  const lim = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pg - 1) * lim;

  const items = await Ratings.find(filter)
    .select('targetUser jobId score tags comment targetRole createdAt')
    .sort(sortMap[sort] || sortMap.recent)
    .skip(skip)
    .limit(lim)
    .lean();

  const total = await Ratings.countDocuments(filter);

  if (!items.length) {
    return res.status(200).json({
      message: 'No user ratings',
      data: { items: [], pagination: { page: pg, limit: lim, total: 0 } },
    });
  }

  // 7) Batch load profiles & jobs
  const employerIds = items
    .filter((r) => r.targetRole === 'Employer')
    .map((r) => r.targetUser);
  const workerIds = items
    .filter((r) => r.targetRole === 'Worker')
    .map((r) => r.targetUser);
  const jobIds = [...new Set(items.map((r) => String(r.jobId)))];

  const [employer, worker, jobs] = await Promise.all([
    EmployerProfile.find({ userId: { $in: employerIds } })
      .select('userId fullName avatarUrl')
      .lean(),
    WorkerProfile.find({ userId: { $in: workerIds } })
      .select('userId fullName avatarUrl')
      .lean(),
    JobPost.find({ _id: { $in: jobIds } })
      .select('_id category skills status')
      .lean(),
  ]);

  const empMap = new Map(employer.map((p) => [String(p.userId), p]));
  const workerMap = new Map(worker.map((p) => [String(p.userId), p]));
  const jobMap = new Map(jobs.map((p) => [String(p._id), p]));

  const decorated = items.map((r) => {
    const profile =
      r.targetRole === 'Employer'
        ? empMap.get(String(r.targetUser))
        : workerMap.get(String(r.targetUser));

    const job = jobMap.get(String(r.jobId));

    return {
      targetUser: {
        _id: String(r.targetUser),
        name: profile?.fullName || '',
        role: r.targetRole,
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
      setBy: String(authUser._id),
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
