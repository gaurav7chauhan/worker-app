import { Notification } from '../../models/notificationModel.js';
import { AppError } from '../../utils/apiError.js';

export const listNotifications = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const userId = req.auth._id;
    const isRead =
      req.query.isRead === 'true'
        ? true
        : req.query.isRead === 'false'
        ? false
        : undefined;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);

    const auth = await AuthUser.findById(userId).lean();
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const filter = { userId };

    if (typeof isRead === 'boolean') filter.isRead = isRead;
    if (req.query.type) filter.type = req.query.type;

    const [items, total, unreadCount] = await Promise.all([
      (
        await Notification.find(filter)
      )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return res.status(200).json({ page, limit, total, items, unreadCount });
  } catch (error) {
    return next(error);
  }
};
