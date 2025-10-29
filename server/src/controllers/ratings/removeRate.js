import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { Ratings } from '../../models/ratingsModel.js';
import { AppError } from '../../utils/apiError.js';

export const deleteRating = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const auth = await AuthUser.findById(req.auth._id)
      .select('_id role isBlocked')
      .lean();
    if (!auth) {
      throw new AppError('User not found', { status: 404 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const { ratingId } = req.params;
    if (!ratingId) throw new AppError('RatingId required', { status: 400 });

    if (ratingId && !mongoose.Types.ObjectId.isValid(ratingId)) {
      throw new AppError('Invalid rating id', { status: 400 });
    }

    const deleted = await Ratings.findOneAndDelete({
      _id: ratingId,
      setBy: auth._id,
    });
    if (!deleted) throw new AppError('Rating not found', { status: 404 });

    return res.status(200).json({ message: 'Ratings successfully deleted' });
  } catch (e) {
    return next(e);
  }
};
