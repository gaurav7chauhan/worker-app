import { AuthUser } from '../../models/authModel.js';
import { JobPost } from '../../models/postModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';
import { rateBodySchema } from '../../validator/rateValid.js';

export const createRating = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const auth = await AuthUser.findById(req.auth._id)
      .select('_id role isBlocked')
      .lean();
    if (!auth) {
      throw new AppError('User not found', { status: 404 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const parsed = rateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const path = Array.isArray(first.path) ? first.path.join('.') : '';
      throw new AppError(`${first.message} on ${path}`, { status: 400 });
    }

    const { targetUser: targetId, jobId, score, tags, comment } = parsed.data;

    if (String(targetId) === String(auth._id)) {
      throw new AppError('Cannot rate your own account', { status: 403 });
    }

    const targetUser = await AuthUser.findById(targetId)
      .select('_id role isBlocked')
      .lean();
    if (!targetUser) {
      throw new AppError('Target user not found', { status: 404 });
    }
    if (targetUser.isBlocked) {
      throw new AppError('Target cannot be rated at this time', {
        status: 403,
      });
    }

    const job = await JobPost.findById(jobId)
      .select('_id employerId assignedWorkerId status')
      .lean();
    if (!job) {
      throw new AppError('Job post not found', { status: 404 });
    }

    const employerId = String(job.employerId);
    const workerId = String(job.assignedWorkerId);
    const raterId = String(auth._id);
    const tgtId = String(targetUser._id);

    const raterIsEmployer = employerId === raterId;
    const raterIsWorker = workerId === raterId;

    if (!(raterIsEmployer || raterIsWorker)) {
      throw new AppError('Not allowed to rate for this job', { status: 403 });
    }

    const targetIsEmployer = employerId === tgtId;
    const targetIsWorker = workerId === tgtId;

    if (!(targetIsEmployer || targetIsWorker)) {
      throw new AppError('Target is not linked to this job', { status: 400 });
    }

    if (job.status !== 'Completed') {
      throw new AppError('Rating allowed only after job completion', {
        status: 409,
      });
    }

    const targetRole = targetIsEmployer ? 'Employer' : 'Worker';

    const rating = await Ratings.findOneAndUpdate(
      {
        setBy: auth._id,
        targetUser: targetUser._id,
        jobId: job._id,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          targetRole,
          score,
          tags: tags || [],
          comment: comment || '',
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const wasCreated =
      rating && rating.createdAt?.getTime?.() === rating.updatedAt?.getTime?.();
    const message = wasCreated
      ? 'Rating created successfully'
      : 'Rating updated successfully';
    const statusCode = wasCreated ? 201 : 200;

    // await updateUserRatingAggregates(targetUser._id, targetRole);

    return res.status(statusCode).json({
      message,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return next(
        new AppError('You have already rated this user for this job', {
          status: 409,
        })
      );
    }
    return next(err);
  }
};
