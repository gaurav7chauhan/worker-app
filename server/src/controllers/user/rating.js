import mongoose, { isValidObjectId } from 'mongoose';
import { ratingTagsConfig } from '../../../config/ratingTagsConfig.js';
import { JobPost } from '../../models/jobModel.js';
import { User } from '../../models/userModel.js';

// set user rating

export const setUserRating = async (req, res) => {
  const { targetUserId, jobId } = req.params;
  const { rating, tags = [] } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    if (!targetUserId || !jobId || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be from 1 to 5' });
    }

    const job = await JobPost.findById(jobId);
    if (!job || job.status !== 'Completed') {
      return res
        .status(400)
        .json({ message: 'Job not completed or not found' });
    }

    // Make sure both people are part of the job
    const raterId = req.user._id.toString();

    const participants = [job.owner.toString(), job.selectedWorker.toString()];
    if (
      !(participants.includes(targetUserId) && participants.includes(raterId))
    ) {
      return res.status(400).json({
        message: 'Invalid rating: both parties are not part of this job',
      });
    }

    // Find the user who is being rated
    const userToRate = await User.findById(targetUserId);
    if (!userToRate) {
      return res.status(404).json({ message: 'User to rate not found' });
    }

    // Prevent duplicate rating for the same job by same user
    const alreadyRated = userToRate.ratings.find(
      (r) =>
        r.job.toString() === jobId.toString() &&
        r.fromUser.toString() === raterId
    );
    if (alreadyRated) {
      return res.status(400).json({
        message: 'You already rated this user for this job',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      {
        $push: { ratings: { fromUser: raterId, job: jobId, rating, tags } },
      },
      { new: true, select: 'ratings averageRating' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User to rate not found' });
    }

    // Recalculate average rating
    const total = userToRate.ratings.reduce((sum, r) => sum + r.rating, 0);
    updatedUser.averageRating =
      updatedUser.ratings.length > 0
        ? Number((total / updatedUser.ratings.length).toFixed(1))
        : 0;

    await updatedUser.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: 'Rating submitted successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error setting user rating:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// get user rating

export const getUserRating = async (req, res) => {
  try {
    const targetUserId = req.params?.userId || req.user?._id;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    if (!targetUserId || !isValidObjectId(targetUserId)) {
      return res.status(400).json({ message: 'Invalid or missing user ID' });
    }

    const user = await User.findById(targetUserId).select(
      'averageRating ratings'
    );

    if (!user) {
      return res.status(404).json({ message: 'User rating not found' });
    }

    if (user.ratings.length === 0) {
      return res.status(200).json({
        message: 'No user rating yet',
        data: { averageRating: 0, ratedUsers: 0 },
      });
    }

    return res.status(200).json({
      message: 'User rating',
      data: {
        averageRating: user.averageRating,
        ratedUsers: user.ratings.length,
      },
    });
  } catch (error) {
    console.error('Error getting user rating:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// update user rating

export const updateUserRating = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { rating, tags } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const userId = req.user._id.toString();

    if (!rating && !tags) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const job = await JobPost.findById(jobId);

    if (!job || job.status !== 'Completed') {
      return res
        .status(400)
        .json({ message: 'Job not completed or not found' });
    }

    // Authorization: Ensure req.user is part of the job
    const isEmployer = job.employer.toString() === userId;

    const isWorker = job.worker.toString() === userId;

    if (!isEmployer && !isWorker) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to rate this job' });
    }

    // Determine target based on rater's role
    let targetUserId;

    if (isEmployer) {
      targetUserId = job.worker.toString(); // Employer rates worker
    } else if (isWorker) {
      targetUserId = job.employer.toString(); // Worker rates employer
    } else {
      return res.status(400).json({ message: 'Invalid user type for rating' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: 'Invalid rating. Rating must be between 1 and 5.' });
    }

    // Find the user who received the rating for this job, containing a rating from this user

    const targetUser = await User.findOne({
      _id: targetUserId,
      'ratings.job': jobId,
      'ratings.fromUser': userId,
    }).select('ratings averageRating');

    if (!targetUser) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Find the specific rating in that array

    const ratingToUpdate = targetUser.ratings.find(
      (r) => r.job.toString() === jobId && r.fromUser.toString() === userId
    );

    if (!ratingToUpdate) {
      return res.status(404).json({
        message: 'Rating not found for this job by you',
      });
    }

    if (tags) {
      const validationRating = rating || ratingToUpdate.rating;
      const allowedTags =
        ratingTagsConfig[job.category]?.[validationRating] || [];

      const invalidTags = tags.filter((tag) => !allowedTags.includes(tag));
      if (invalidTags.length > 0) {
        return res.status(400).json({
          message: `Invalid tags: ${invalidTags.join(', ')}`,
        });
      }
    }

    // Conditional updates
    if (rating) ratingToUpdate.rating = rating;
    if (tags) ratingToUpdate.tags = tags;

    const totalRatings = targetUser.ratings.reduce(
      (sum, r) => sum + r.rating,
      0
    );

    targetUser.averageRating =
      targetUser.ratings.length > 0
        ? totalRatings / targetUser.ratings.length
        : 0;

    targetUser.markModified('ratings');
    await targetUser.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: 'Rating updated successfully',
      data: ratingToUpdate,
    });
  } catch (error) {
    console.error('Error updating user rating:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// users all ratings

export const getMyGivenRatings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const loggedInUserId = new mongoose.Types.ObjectId(req.user._id);
    const page = parseInt(req.params?.page, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const pipeline = [
      // Order matters: filter early with $match and trim fields with $project to reduce
      // workload for downstream stages and improve index usage

      // Narrow to users that have at least one matching rating
      { $match: { 'ratings.fromUser': loggedInUserId } },

      // Keep only this user's ratings per user doc
      {
        $project: {
          fullName: 1,
          profileImage: 1,
          ratings: {
            $filter: {
              input: '$ratings',
              as: 'r',
              cond: { $eq: ['$$r.fromUser', loggedInUserId] },
            },
          },
        },
      },

      // Work with each rating as a separate doc
      { $unwind: '$ratings' },

      // Join job title
      {
        $lookup: {
          from: 'jobposts',
          localField: 'ratings.job',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },

      // Shape the final document
      {
        $project: {
          _id: 0,
          toUserId: '$_id',
          toUserName: '$fullName',
          toUserImage: '$profileImage',
          jobId: '$job._id',
          jobTitle: '$job.title',
          rating: '$ratings.rating',
          tags: '$ratings.tags',
          createdAt: '$ratings.createdAt',
        },
      },
    ];

    const [out] = await User.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]).option({ allowDiskUse: true });

    const data = out?.data ?? [];
    const total = out?.total?.[0]?.count ?? 0;

    return res.status(200).json({
      message: 'Ratings you have given to others',
      page,
      limit,
      total,
      data,
    });
  } catch (error) {
    console.error('Error getting given ratings:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
