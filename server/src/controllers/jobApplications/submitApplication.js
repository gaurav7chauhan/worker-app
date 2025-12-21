import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AppError } from '../../utils/apiError.js';
import { JobPost } from '../../models/postModel.js';
import { Application } from '../../models/applicationModel.js';
import { WorkerProfile } from '../../models/workerProfileModel.js';
import { applicationSchema } from '../../validator/application_valid.js';

export const submitApplication = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // only workers can apply
  if (authUser.role !== 'Worker') {
    throw new AppError('Only workers can apply to jobs', { status: 409 });
  }

  // ensure worker profile exists
  const worker = await WorkerProfile.findOne({ userId: authUser._id }).select(
    '_id'
  );
  if (!worker) {
    throw new AppError('Worker profile not found', { status: 404 });
  }

  // validate request body
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new AppError(first?.message || 'Invalid data', { status: 422 });
  }

  const { jobId, coverNote, expectedRate } = parsed.data;

  // validate job
  const job = await JobPost.findById(jobId).select('_id status');
  if (!job) {
    throw new AppError('Job post not found', { status: 404 });
  }
  if (job.status !== 'Open') {
    throw new AppError('Job is not open for applications', { status: 409 });
  }

  // prevent duplicate application
  const existing = await Application.findOne({
    jobId: job._id,
    workerId: worker._id,
  }).lean();

  if (existing) {
    return res.status(200).json({
      message: 'Already applied to this job',
      _id: existing._id,
    });
  }

  // create application
  const created = await Application.create({
    workerId: worker._id,
    jobId,
    coverNote,
    expectedRate,
    status: 'Applied',
  });

  return res.status(201).json({
    application: {
      _id: created._id,
      jobId: created.jobId,
      workerId: created.workerId,
      status: created.status,
      coverNote: created.coverNote,
      expectedRate: created.expectedRate,
    },
    message: 'Application submitted successfully',
  });
});
