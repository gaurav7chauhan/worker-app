import { Notification } from '../../models/notificationModel';
import { AppError } from '../../utils/apiError.js';
import { notificationSchema } from '../../validator/notifyValid.js';

export const notifyAll = async (req, res, next) => {
  try {
    const parsed = notificationSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error?.issues[0];
      throw new AppError(
        `${first.message} in ${first.path}` || 'Invalid data',
        { status: 422 }
      );
    }

    const data = parsed.data;

    if (data.dedupeKey) {
      if (check) {
        return res
          .status(200)
          .json({ check, message: 'You already send this N' });
      }
    }
  } catch (error) {
    return next(error);
  }
};
