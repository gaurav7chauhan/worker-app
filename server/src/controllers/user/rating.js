import mongoose, { isValidObjectId } from 'mongoose';
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

    const participants = [job.employer.toString(), job.worker.toString()];
    if (
      !(participants.includes(targetUserId) && participants.includes(raterId))
    ) {
      return res.status(400).json({
        message: 'Invalid rating: both parties are not part of this job',
      });
    }

    const updatedUser = await User.updateOne(
      {
        _id: targetUserId,
        ratings: { $not: { $eleMatch: { fromUser: raterId, job: jobId } } },
      },
      [
        {
          $set: {
            ratings: {
              $concatArrays: [
                { $ifNull: ['$ratings', []] },
                [
                  {
                    fromUser: raterId,
                    job: jobId,
                    rating: Number(rating),
                    tags,
                  },
                ],
              ],
            },
            ratingCount: { $add: [{ $ifNull: ['$ratingCount', 0] }, 1] },
            ratingSum: {
              $add: [{ $ifNull: ['$ratingSum', 0] }, Number(rating)],
            },

            // Average = round((oldSum + r) / (oldCount + 1), 1)
            averageRating: {
              $round: [
                {
                  $divide: [
                    { $add: [{ $ifNull: ['$ratingSum', 0] }, Number(rating)] },
                    { $add: [{ $ifNull: ['$ratingCount', 0] }, 1] },
                  ],
                },
                1,
              ],
            },
          },
        },
      ],
      { upsert: false }
    );

    if (updatedUser.modifiedCount === 1) {
      // optionally fetch minimal fields to return
      const updated = await User.findById(targetUserId).select(
        'averageRating ratingCount'
      );

      return res
        .status(200)
        .json({ message: 'Rating submitted', data: updated });
    }

    return res
      .status(400)
      .json({ message: 'You already rated this user for this job' });
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

    const user = await User.findById(targetUserId)
      .select('averageRating ratingCount -_id')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User rating not found' });
    }

    if (user.ratingCount === 0) {
      return res.status(200).json({
        message: 'No user rating yet',
        data: { averageRating: 0, ratedUsers: 0 },
      });
    }

    return res.status(200).json({
      message: 'User rating',
      data: {
        averageRating: user.averageRating ?? 0,
        ratedUsers: user.ratingCount ?? 0,
      },
    });
  } catch (error) {
    console.error('Error getting user rating:', error.message);
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
