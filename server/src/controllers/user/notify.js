import { Application } from '../../models/applicationModel.js';
import { AuthUser } from '../../models/authModel.js';
import { Notification } from '../../models/notificationModel';
import { JobPost } from '../../models/postModel.js';
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

    const userExist = await AuthUser.exists({ _id: data.userId });
    if (!userExist) {
      throw new AppError('Receiver userId not found', { status: 404 });
    }

    const actorExist = await AuthUser.exists({ _id: data.actorId });
    if (!actorExist) {
      throw new AppError('Sender userId not found', { status: 404 });
    }

    if (data.jobId) {
      const jobExist = await JobPost.exists({ _id: data.jobId });
      if (!jobExist) {
        throw new AppError('JobId not found', { status: 404 });
      }
    }
    if (data.applicationId) {
      const applyExist = await Application.exists({ _id: data.applicationId });
      if (!applyExist) {
        throw new AppError('ApplicationId not found', { status: 404 });
      }
    }

    if (data.dedupeKey) {
      const now = new Date();
      const result = await Notification.updateOne(
        { dedupeKey: data.dedupeKey },
        {
          $setOnInsert: {
            userId: data.userId,
            actorId: data.actorId,
            type: data.type,
            jobId: data.jobId,
            applicationId: data.applicationId,
            body: data.body ?? null,
          },
          $set: { updatedAt: now },
        },
        { upsert: true }
      );
      return res
        .status(result.upsertedCount ? 201 : 200)
        .json({
          upserted: !!result.upsertedCount,
          message: result.upsertedCount
            ? 'Notification successfully sent'
            : 'Notification already exists',
        });
    }

    const doc = await Notification.create(data);
    return res
      .status(201)
      .json({ id: doc._id, message: 'Notification successfully send' });
  } catch (error) {
    return next(error);
  }
};
