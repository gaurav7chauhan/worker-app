import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { Notification } from '../../models/notificationModel.js';

export const listNotifications = asyncHandler(async (req, res) => {
  // authenticated user (set by requireActiveUser middleware)
  const { _id: userId } = req.authUser;

  // parse isRead query safely
  const isRead =
    req.query.isRead === 'true'
      ? true
      : req.query.isRead === 'false'
      ? false
      : undefined;

  // pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);

  // build filter
  const filter = { userId };
  if (typeof isRead === 'boolean') filter.isRead = isRead;
  if (req.query.type) filter.type = req.query.type;

  // run queries in parallel
  const itemsQuery = Notification.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalQuery = Notification.countDocuments(filter);
  const unreadQuery = Notification.countDocuments({ userId, isRead: false });

  const [items, total, unreadCount] = await Promise.all([
    itemsQuery,
    totalQuery,
    unreadQuery,
  ]);

  return res.status(200).json({
    page,
    limit,
    total,
    unreadCount,
    items,
    message: 'Notifications successfully fetched',
  });
});
