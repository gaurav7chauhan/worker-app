import { Application } from '../../models/applicationModel.js';
import { AuthUser } from '../../models/authModel.js';
import { Notification } from '../../models/notificationModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { notifySchemaStrict } from '../../validator/notify_valid.js';

function makeDedupeKey(data) {
  switch (data.type) {
    case 'JOB_APPLIED':
      return data.jobId
        ? `JOB_APPLIED:${data.userId}:${data.jobId}`
        : undefined;
    case 'MESSAGE_NEW':
      return data.conversationId
        ? `MESSAGE_NEW:${data.userId}:conv:${data.conversationId}`
        : undefined;
    case 'REVIEW_REMINDER':
      return data.jobId
        ? `REVIEW_REMINDER:${data.userId}:${data.jobId}`
        : undefined;
    default:
      return undefined;
  }
}

export const sentNotification = async (req, res, next) => {
  try {
    const parsed = notifySchemaStrict.safeParse(req.body);
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

    const keyRaw = data.dedupeKey ?? makeDedupeKey(data);
    const key = typeof keyRaw === 'string' ? keyRaw.trim() : keyRaw;
    if (key) {
      const now = new Date();
      const result = await Notification.updateOne(
        { dedupeKey: key },
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
      return res.status(result.upsertedCount ? 201 : 200).json({
        message: result.upsertedCount
          ? 'Notification successfully sent'
          : 'Notification already exists',
        result,
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
