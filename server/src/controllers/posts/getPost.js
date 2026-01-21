import mongoose from 'mongoose';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';

export const getPost = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  if (!jobId || !mongoose.isValidObjectId(jobId)) {
    throw new AppError('Invalid or missing Job ID', { status: 400 });
  }

  const authUser = req.authUser;
  const employer = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();

  if (!employer) {
    throw new AppError('Employer not found', { status: 404 });
  }

  const jobPost = await JobPost.findOne({
    _id: jobId,
    employerId: employer._id,
  })
    .select(
      '-assignedWorkerId -completionProofs -submittedAt -employerConfirmBy -approvedAt -reviewWindowEnd'
    )
    .lean();
  if (!jobPost) {
    throw new AppError('Post not found', { status: 404 });
  }

  return res
    .status(200)
    .json({ message: 'Post successfully fetched', jobPost });
});
