import { ratingTagsConfig } from '../../../config/ratingTagsConfig.js';
import { JobPost } from '../../models/job.model.js';
import { User } from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// set user rating

export const setUserRating = asyncHandler(async (req, res) => {
  const { targetUserId, jobId, rating, tags } = req.body;

  if (!targetUserId || !jobId || !rating) {
    throw new ApiError(400, 'Missing required fields');
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be from 1 to 5');
  }

  const job = await JobPost.findById(jobId);
  if (!job || job.status !== 'Completed') {
    throw new ApiError(400, 'Job not completed or not found');
  }

  // Make sure both people are part of the job
  const raterId = req.user._id.toString();

  const participants = [job.owner.toString(), job.selectedWorker.toString()];
  if (
    !(participants.includes(targetUserId) && participants.includes(raterId))
  ) {
    throw new ApiError(
      400,
      'Invalid rating: both parties are not part of this job'
    );
  }

  // Validate tags based on job category and rating
  const allowedTags = ratingTagsConfig[job.category]?.[rating] || [];

  const invalidTags = tags.filter((tag) => !allowedTags.includes(tag));
  if (invalidTags.length > 0) {
    // ✅ Fixed bug: was "invalidTags > 0"
    throw new ApiError(400, `Invalid tags: ${invalidTags.join(', ')}`);
  }

  // Find the user who is being rated
  const userToRate = await User.findById(targetUserId);
  if (!userToRate) {
    throw new ApiError(404, 'User to rate not found');
  }

  // Prevent duplicate rating for the same job by same user
  const alreadyRated = userToRate.ratings.find(
    (r) => r.job.toString() === jobId && r.fromUser.toString() === raterId
  );
  if (alreadyRated) {
    throw new ApiError(400, 'You already rated this user for this job');
  }

  // Recalculate average rating
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

// get user rating

export const getUserRating = asyncHandler(async (req, res) => {
  const targetUserId = req.params?.userId || req.user._id;

  const user = await User.findById(targetUserId).select(
    'averageRating ratings'
  );

  if (!user) {
    throw new ApiError(404, 'User rating not found');
  }

  if (!user.averageRating || user.averageRating === 0) {
    return res.status(200).json(new ApiResponse(200, 'No user rating yet', {}));
  }

  return res.status(200).json(
    new ApiResponse(200, 'User rating', {
      averageRating: user.averageRating,
      ratedUsers: user.ratings.length,
    })
  );
});

// update user rating

export const updateUserRating = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const userId = req.user._id.toString();

  // Find the user who received the rating for this job, containing a rating from this user

  const targetUser = await User.findOne({
    'ratings.job': jobId,
    'ratings.fromUser': userId,
  }).select('ratings');

  if (!targetUser) {
    throw new ApiError(404, 'Rating not found');
  }

  // Find the specific rating in that array

  const ratingToUpdate = targetUser.ratings.find(
    (r) =>
      r.job._id.toString() === jobId && r.fromUser._id.toString() === userId
  );

  if (!ratingToUpdate) {
    throw new ApiError(404, 'Rating not found for this job by you');
  }

  res.status(200).json(new ApiResponse(200, 'Rating found', ratingToUpdate));
});

// users all ratings

export const getMyGivenRatings = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id.toString();

  // Step 1: Find all users who have received a rating from me
  const users = await User.find({ 'ratings.fromUser': loggedInUserId })
    .select('fullName profileImage ratings')
    .populate('ratings.job', 'title'); // optional: job title

  const myRatings = [];

  users.forEach((user) => {
    user.ratings.forEach((r) => {
      if (r.fromUser._id.toString() === loggedInUserId) {
        myRatings.push({
          toUserId: user._id,
          toUserName: user.fullName,
          toUserImage: user.profileImage,
          jobId: r.job?._id || null,
          jobTitle: r.job?.title || null,
          rating: r.rating,
          tags: r.tags,
        });
      }
    });
  });

  res
    .status(200)
    .json(new ApiResponse(200, 'Ratings you have given to others', myRatings));
});
