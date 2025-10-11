import { AuthUser } from '../../models/authModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';

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

    const targetId = qTargetId || String(auth._id);

    const targetUser = await AuthUser.findById(targetId)
      .select('_id isBlocked role')
      .lean();
    if (!targetUser) {
      throw new AppError('Target user not found', { status: 404 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const filter = {
      targetUser: targetUser._id,
      isDeleted: { $ne: true },
    };

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
        .slect('setBy jobId score tags comment targetRole createdAt')
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
