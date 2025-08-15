import { ratingTagsConfig } from '../../../config/ratingTagsConfig';
import { JobPost } from '../../models/job.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const userRating = asyncHandler(async (req, res) => {
  const { targetUserId, jobId, rating, tags } = req.body;

  if (!targetUserId || !jobId || !rating) {
    throw new ApiError(400, 'Missing required fields');
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be from 1 to 5');
  }

  //   if (!Array.isArray(tags) || tags.length < 3) {
  //     return res.status(400).json(new ApiResponse(400, 'Select at least 3 tags'));
  //   }

  const job = await JobPost.findById(jobId);

  if (!job || job.status !== 'Completed') {
    throw new ApiError(400, 'Job not completed or not found');
  }

  const raterId = req.user._id.toString();

  let participants = [job.owner.toString(), job.selectedWorker.toString()];

  if (
    !(participants.includes(targetUserId) && participants.includes(raterId))
  ) {
    throw new ApiError(400, 'Invalid rating: not part of this job');
  }

  const allowedTags = ratingTagsConfig[job.category]?.[rating] || [];

  const invalidTags = tags.filter((tag) => !allowedTags.includes(tag));

  if (invalidTags > 0) {
    throw new ApiError(400, `Invalid tags: ${invalidTags.join(', ')}`);
  }

  const userToRate = await User.findById(targetUserId);

  if (!userToRate) {
    throw new ApiError(404, 'User to rate not found');
  }

  const alreadyRated = userToRate.ratings.find(
    (r) => r.job.toString() === jobId && r.fromUser.toString() === raterId
  );

  if (alreadyRated) {
    throw new ApiError(400, 'You already rated this user for this job');
  }

  const total = userToRate.ratings.reduce((sum, r) => sum + r.rating, 0);

  const newAverage = total / userToRate.ratings.length;

  await User.updateOne(
    { _id: targetUserId },
    {
      $push: { ratings: { fromUser: raterId, job: jobId, rating, tags } },
      $set: { averageRating: newAverage },
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, 'Rating submitted successfully', userToRate));
});
