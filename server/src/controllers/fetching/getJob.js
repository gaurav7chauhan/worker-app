import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { JobPost } from '../../models/postModel.js';

export const getJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('Invalid or missing job ID', { status: 400 });
    }

    const baseExclude =
      '-assignedWorkerId -employerAssets -completionProofs -employerConfirmBy -submittedAt -approvedAt -reviewWindowEnd';

    const doc = await JobPost.findById(jobId).select(baseExclude).lean();
    if (!doc) return res.status(404).json({ message: 'Job not found' });

    if (doc.status === 'Completed' || doc.status === 'Canceled') {
      const includeMore =
        'assignedWorkerId employerAssets completionProofs employerConfirmBy submittedAt approvedAt';

      const more = await JobPost.findById(jobId).select(includeMore).lean();
      // Merge to keep consistent shape
      const job = { ...doc, ...more };
      return res.status(200).json({ message: 'Job successfully fetched', job });
    }

    return res.status(200).json({ message: 'Job successfully fetched', doc });
  } catch (e) {
    return next(e);
  }
};
