import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { Application } from '../../models/applicationModel.js';
import { AuthUser } from '../../models/authModel.js';
import { Notification } from '../../models/notificationModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { notifySchemaStrict } from '../../validator/notify_valid.js';

// generate dedupe key based on notification type
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

export const sentNotification = asyncHandler(async (req, res) => {
  // validate payload
  const parsed = notifySchemaStrict.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error?.issues[0];
    throw new AppError(first?.message || 'Invalid data', { status: 422 });
  }

  const data = parsed.data;

  // validate receiver & actor
  const [userExist, actorExist] = await Promise.all([
    AuthUser.exists({ _id: data.userId }),
    AuthUser.exists({ _id: data.actorId }),
  ]);

  if (!userExist) {
    throw new AppError('Receiver userId not found', { status: 404 });
  }
  if (!actorExist) {
    throw new AppError('Sender userId not found', { status: 404 });
  }

  // validate optional relations
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

  // dedupe handling
  const keyRaw = data.dedupeKey ?? makeDedupeKey(data);
  const dedupeKey = typeof keyRaw === 'string' ? keyRaw.trim() : undefined;

  if (dedupeKey) {
    const now = new Date();

    const result = await Notification.updateOne(
      { dedupeKey },
      {
        $setOnInsert: {
          userId: data.userId,
          actorId: data.actorId,
          type: data.type,
          jobId: data.jobId,
          applicationId: data.applicationId,
          body: data.body ?? null,
          dedupeKey,
        },
        $set: { updatedAt: now },
      },
      { upsert: true }
    );

    return res.status(result.upsertedCount ? 201 : 200).json({
      message: result.upsertedCount
        ? 'Notification successfully sent'
        : 'Notification already exists',
    });
  }

  // fallback: no dedupe
  const doc = await Notification.create(data);

  return res.status(201).json({
    id: doc._id,
    message: 'Notification successfully sent',
  });
});
