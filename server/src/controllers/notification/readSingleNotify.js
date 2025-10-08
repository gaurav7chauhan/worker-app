import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { Notification } from '../../models/notificationModel.js';
import { AppError } from '../../utils/apiError.js';

export const markNotificationRead = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid notification id', { status: 400 });
    }

    const auth = await AuthUser.findById(req.auth._id)
      .select('_id isBlocked')
      .lean();
    if (!auth) {
      throw new AppError('User not found', { status: 404 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const result = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    if (!result) {
      throw new AppError('Notification not found', { status: 404 });
    }

    return res.status(200).json({
      updated: result.modifiedCount === 1,
      message: 'Notification marked as read',
    });
  } catch (error) {
    return next(error);
  }
};
