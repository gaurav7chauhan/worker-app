import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { Notification } from '../../models/notificationModel.js';

export const allNotificationsRead = asyncHandler(async (req, res) => {
  const authUser = req.authUser;

  const now = new Date();
  await Notification.updateMany(
    { userId: authUser._id, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );

  return res.status(200).json({
    message: 'All Notifications marked as read',
  });
});
