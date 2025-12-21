import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AuthUser } from '../../models/authModel.js';
import { JobPost } from '../../models/postModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';
import { rateBodySchema } from '../../validator/rating_valid.js';

export const setRating = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // 2) Validate request body
  const parsed = rateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = Array.isArray(first.path) ? first.path.join('.') : '';
    throw new AppError(`${first.message} on ${path}`, { status: 400 });
  }

  const { targetUser: targetId, jobId, score, tags, comment } = parsed.data;

  // 3) Prevent self-rating
  if (String(targetId) === String(authUser._id)) {
    throw new AppError('Cannot rate your own account', { status: 403 });
  }

  // 4) Validate target user
  const targetUser = await AuthUser.findById(targetId)
    .select('_id role isBlocked')
    .lean();

  if (!targetUser) {
    throw new AppError('Target user not found', { status: 404 });
  }
  if (targetUser.isBlocked) {
    throw new AppError('Target cannot be rated at this time', { status: 403 });
  }

  // 5) Validate job and participation
  const job = await JobPost.findById(jobId)
    .select('_id employerId assignedWorkerId status')
    .lean();

  if (!job) throw new AppError('Job post not found', { status: 404 });

  const employerId = String(job.employerId);
  const workerId = String(job.assignedWorkerId);
  const raterId = String(authUser._id);
  const tgtId = String(targetUser._id);

  if (!(employerId === raterId || workerId === raterId)) {
    throw new AppError('Not allowed to rate for this job', { status: 403 });
  }

  if (!(employerId === tgtId || workerId === tgtId)) {
    throw new AppError('Target is not linked to this job', { status: 400 });
  }

  if (job.status !== 'Completed') {
    throw new AppError('Rating allowed only after job completion', {
      status: 409,
    });
  }

  // 6) Determine target role in this job
  const targetRole = employerId === tgtId ? 'Employer' : 'Worker';

  // 7) Enforce one rating per rater-target-job (with edit limit)
  const triadFilter = {
    setBy: authUser._id,
    targetUser: targetUser._id,
    jobId: job._id,
    isDeleted: { $ne: true },
  };

  const existing = await Ratings.findOne(triadFilter)
    .select('_id editCount')
    .lean();

  if (existing) {
    if ((existing.editCount ?? 0) >= 2) {
      throw new AppError('Edit limit reached', { status: 409 });
    }

    await Ratings.findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          targetRole,
          score,
          tags: tags || [],
          comment: comment || '',
          lastEditedAt: new Date(),
        },
        $inc: { editCount: 1 },
      }
    );

    return res.status(200).json({ message: 'Rating updated successfully' });
  }

  // 8) Create rating if not exists
  await Ratings.findOneAndUpdate(
    triadFilter,
    {
      $set: { targetRole, score, tags: tags || [], comment: comment || '' },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({ message: 'Rating created successfully' });
});
