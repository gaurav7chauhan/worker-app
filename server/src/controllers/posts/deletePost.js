import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { JobPost } from '../../models/postModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const deletePost = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  if (authUser.role !== 'Employer') {
    throw new AppError('Only employer can change job status', {
      status: 403,
    });
  }

  const employer = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();
  if (!employer) {
    throw new AppError('Employer profile not found', { status: 404 });
  }

  const { jobId } = req.params;

  if (!jobId || !mongoose.isValidObjectId(jobId)) {
    throw new AppError('Invalid or missing Job ID', { status: 400 });
  }

  const job = await JobPost.findOneAndDelete({
    _id: jobId,
    employerId: employer._id,
  });

  // isDeleted: { type: Boolean, default: false }, deletedAt: Date
  // const job = await JobPost.findOneAndUpdate(
  //   { _id: jobId, employerId: employer._id, isDeleted: { $ne: true } },
  //   { $set: { isDeleted: true, deletedAt: new Date() } },
  //   { new: true, projection: '_id isDeleted' }
  // ).lean();

  if (!job) {
    throw new AppError('Job not found or not owned by employer', {
      status: 404,
    });
  }

  return res.status(200).json({ message: 'Job post deleted successfully' });
});
