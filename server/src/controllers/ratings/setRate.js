import { AuthUser } from '../../models/authModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { rateBodySchema } from '../../validator/rateValid.js';

export const createRating = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const auth = await AuthUser.findById(req.auth._id)
      .select('role isBlocked')
      .lean();
    if (!auth) {
      throw new AppError('User not found', { status: 404 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const payload = rateBodySchema.safeParse(req.body);
    if (!payload.success) {
      const first = payload.error?.issues[0];
      throw new AppError(`${first.message} on ${first.path}`, { status: 409 });
    }

    const targetId = payload.data.targetUser;
    const jobId = payload.data.jobId;

    const targetUser = await AuthUser.findById(targetId).select('_id').lean();
    if (!targetUser) {
      throw new AppError('Target user not found', { status: 404 });
    }

    const job = await JobPost.findById(jobId)
      .select('_id employerId assignedWorkerId')
      .lean();
    if (!job) {
      throw new AppError('Job post not found', { status: 404 });
    }

    const bothIds = auth._id || targetUser._id;

    if (job.employerId !== bothIds || job.assignedWorkerId !== bothIds) {
      throw new AppError('', { status: 404 });
    }
  } catch (error) {
    return next(error);
  }
};
