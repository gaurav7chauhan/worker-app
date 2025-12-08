import { AuthUser } from '../../models/authModel.js';
import { Notification } from '../../models/notificationModel.js';
import { AppError } from '../../utils/apiError.js';

export const allNotificationsRead = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
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

    const now = new Date();
    await Notification.updateMany(
      { userId: auth._id, isRead: false },
      { $set: { isRead: true, readAt: now } }
    );

    return res.status(200).json({
      message: 'All Notifications marked as read',
    });
  } catch (error) {
    return next(error);
  }
};
