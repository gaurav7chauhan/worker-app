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
    if (!id) {
      throw new AppError('Id is required', { status: 400 });
    }
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

    const updated = await Notification.findOneAndUpdate(
      { _id: req.params?.id, userId: req.auth._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).lean();
    if (!updated) {
      throw new AppError('Notification not found or already read', {
        status: 404,
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      data: {
        _id: updated._id,
        isRead: updated.isRead,
        readAt: updated.readAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
