import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const myGivenRatings = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const auth = await AuthUser.findById(req.auth._id)
      .select('_id isBlocked')
      .lean();
    if (!auth) throw new AppError('User not found', { status: 404 });

    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

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
      setBy: auth._id,
      isDeleted: { $ne: true },
    };

    // SINGLE doc fields....

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
      const job = await JobPost.findOne({
        _id: jobId,
        status: 'Completed',
      })
        .select('category skills status')
        .lean();
      if (!job) throw new AppError('Job not found', { status: 404 });
      filter.jobId = job._id;
    }

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

      const data = {
        targetUser: {
          _id: uid,
          name: profile?.fullName || '',
          role: roleTU,
          avatar: profile?.avatarUrl,
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
      };
      return res.status(200).json({
        message: 'Ratings fetched successfully',
        data: {
          setBy: String(auth._id),
          items: [],
          pagination: { page: pg, limit: lim, total: 0, hasMore: false },
        },
      });
    }

    // OPTIONAL doc fields....

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

    const sortMap = {
      recent: { createdAt: -1 },
      score_desc: { score: -1, createdAt: -1 },
      score_asc: { score: 1, createdAt: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.recent;

    const pg = Math.max(1, Number(page));
    const lim = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pg - 1) * lim;

    const items = await Ratings.find(filter)
      .select('targetUser jobId score tags comment targetRole createdAt')
      .sort(sortSpec)
      .skip(skip)
      .limit(lim)
      .lean();

    if (items.length === 0) {
      return res.status(200).json({ message: 'No user ratings' });
    }

    const total = await Ratings.countDocuments(filter);

    const employerIds = items
      .filter((r) => r.targetRole === 'Employer')
      .map((r) => r.targetUser);
    const workerIds = items
      .filter((r) => r.targetRole === 'Worker')
      .map((r) => r.targetUser);
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

    const empMap = new Map(employer.map((p) => [String(p.userId), p]));
    const workerMap = new Map(worker.map((p) => [String(p.userId), p]));
    const jobMap = new Map(jobs.map((p) => [String(p._id), p]));

    const decorated = items.map((r) => {
      const uid = r.targetUser;
      const tRole = r.targetRole;
      const profile =
        tRole === 'Employer' ? empMap.get(uid) : workerMap.get(uid);

      const jId = String(r.jobId);
      const job = jobMap.get(jId);
      return {
        targetUser: {
          _id: uid,
          name: profile?.fullName || '',
          role: tRole || '',
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
        setBy: String(auth._id),
        items: decorated,
        pagination: {
          page: pg,
          limit: lim,
          total,
          hasMore: skip + decorated.length < total,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
