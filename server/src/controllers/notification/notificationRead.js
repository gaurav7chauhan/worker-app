import mongoose from 'mongoose';
import { Notification } from '../../models/notificationModel.js';
import { AppError } from '../../utils/apiError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const notificationRead = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const { _id: userId } = req.authUser;

  // validate notification id
  const { notificationId } = req.params;
  if (!notificationId) {
    throw new AppError('Notification id is required', { status: 400 });
  }
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new AppError('Invalid notification id', { status: 400 });
  }

  // mark notification as read
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, userId, isRead: false },
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
});
