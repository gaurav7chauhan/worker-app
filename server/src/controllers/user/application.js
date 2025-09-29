import { Application } from '../../models/applicationModel.js';
import { AuthUser } from '../../models/authModel.js';
import { JobPost } from '../../models/postModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';
import { applicationSchema } from '../../validator/applicationValidate.js';

export const workerApply = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id).select('isBlocked role');
    if (auth.role !== 'Worker') {
      throw new AppError('Only workers can apply to jobs', { status: 409 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const worker = await WorkerProfile.findOne({ userId: auth._id }).select('_id');
    if (!worker) {
      throw new AppError('Worker profile not found', { status: 404 });
    }

    const parsed = applicationSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(
        `${first?.message} in ${first?.path}` || 'Invalid data',
        { status: 422 }
      );
    }

    const { jobId, coverNote, expectedRate } = parsed.data;
    
    const job = await JobPost.findById(jobId).select('_id status');
    if (!job) {
      throw new AppError('Job post not found', { status: 404 });
    }
    if (job.status !== 'Open') {
      throw new AppError('Job is not open for applications', { status: 409 });
    }

    const dup = await Application.findOne({
      jobId: job._id,
      workerId: worker._id,
    });
    if (dup) {
      throw new AppError('Already applied to this job', { status:409  });
    }

    const created = await Application.create({
      workerId: worker._id,
      status: 'Applied',
      jobId,
      coverNote,
      expectedRate,
    });

    const application = {
      jobId: created.jobId,
      workerId: created.workerId,
      status: created.status,
      coverNote: created.coverNote,
      expectedRate: created.expectedRate,
    };

    return res
      .status(201)
      .json({ application, message: 'Application submitted successfully' });
  } catch (error) {
    return next(error);
  }
};
