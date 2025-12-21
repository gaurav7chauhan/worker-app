import mongoose from 'mongoose';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const statusUpdate = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;
  
  if (authUser.role !== 'Employer') {
    throw new AppError('Only employer can change job status', {
      status: 403,
    });
  }

  const STATUS = ['Open', 'Closed', 'Canceled'];

  const { jobId } = req.params;
  const { status } = req.body;

  if (!jobId || !status) {
    throw new AppError('jobId and status are required', { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid jobId', { status: 400 });
  }

  if (status === 'Completed') {
    throw new AppError('Completed status cannot be set by employer', {
      status: 409,
    });
  }

  if (!STATUS.includes(status)) {
    throw new AppError('Invalid status value', { status: 400 });
  }

  const employer = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();
  if (!employer) {
    throw new AppError('Employer profile not found', { status: 404 });
  }

  const job = await JobPost.findOne({ _id: jobId, employerId: employer._id })
    .select('_id status')
    .lean();

  if (!job) {
    throw new AppError('Job not found or not owned by employer', {
      status: 404,
    });
  }

  if (job.status === status) {
    return res.status(200).json({
      message: 'Job is already in the requested status',
      data: { status: job.status },
    });
  }

  const updated = await JobPost.findOneAndUpdate(
    { _id: jobId, employerId: employer._id },
    { $set: { status } },
    { new: true, projection: 'status' }
  ).lean();

  return res.status(200).json({
    message: 'Status update successfully',
    data: { status: updated.status },
  });
});
