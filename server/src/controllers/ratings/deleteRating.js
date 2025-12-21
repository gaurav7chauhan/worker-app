import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const deleteRating = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // 2) Validate rating id
  const { ratingId } = req.params;
  if (!ratingId) {
    throw new AppError('RatingId required', { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(ratingId)) {
    throw new AppError('Invalid rating id', { status: 400 });
  }

  // 3) Delete rating only if owned by requester
  const deleted = await Ratings.findOneAndDelete({
    _id: ratingId,
    setBy: authUser._id,
  });

  if (!deleted) {
    throw new AppError('Rating not found', { status: 404 });
  }

  // 4) Respond success
  return res.status(200).json({
    message: 'Rating successfully deleted',
  });
});
