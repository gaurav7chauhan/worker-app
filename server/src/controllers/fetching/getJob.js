import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { JobPost } from '../../models/postModel.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const getJob = asyncHandler(async (req, res) => {
  // params validation
  const { jobId } = req.params;
  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid or missing job ID', { status: 400 });
  }

  // base db fetch (restricted fields)
  const baseExclude =
    '-assignedWorkerId -employerAssets -completionProofs -employerConfirmBy -submittedAt -approvedAt -reviewWindowEnd';

  const doc = await JobPost.findById(jobId).select(baseExclude).lean();
  if (!doc) return res.status(404).json({ message: 'Job not found' });

  // conditional db fetch (completed / canceled)
  if (doc.status === 'Completed' || doc.status === 'Canceled') {
    const includeMore =
      'assignedWorkerId employerAssets completionProofs employerConfirmBy submittedAt approvedAt';

    const more = await JobPost.findById(jobId).select(includeMore).lean();

    const job = { ...doc, ...more };
    return res.status(200).json({ message: 'Job successfully fetched', job });
  }

  // response
  return res.status(200).json({ message: 'Job successfully fetched', doc });
});
