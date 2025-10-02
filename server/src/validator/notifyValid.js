import mongoose from 'mongoose';
import { z } from 'zod';

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    message: 'Invalid ObjectId',
  });

export const notifyTypes = [
  'JOB_APPLIED',
  'JOB_SHORTLISTED',
  'JOB_HIRED',
  'JOB_REJECTED',
  'JOB_ASSIGNED',
  'JOB_CANCELED',
  'JOB_COMPLETION_SUBMITTED',
  'JOB_COMPLETION_APPROVED',
  'JOB_COMPLETION_DECLINED',
  'JOB_AUTO_ACCEPTED',
  'REVIEW_WINDOW_OPEN',
  'REVIEW_REMINDER',
  'REVIEW_SUBMITTED',
  'REVIEW_RELEASED',
  'MESSAGE_NEW',
];

const typeEnum = z.enum(notifyTypes);

export const notificationSchema = z.object({
    userId: objectId,
    actorId: objectId,
    type: typeEnum,
    body: z.string().trim().min(1).max(500).optional(),
    jobId: objectId.optional(),
    applicationId: objectId.optional(),
    dedupeKey: z.string().trim()
});



// export const createNotificationSchemaStrict = createNotificationSchema.superRefine((val, ctx) => {
//   if (val.type === 'MESSAGE_NEW') {
//     // if enabling later:
//     // if (!val.conversationId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'conversationId required for MESSAGE_NEW', path: ['conversationId'] });
//   }
//   if (val.type === 'JOB_APPLIED' && !val.jobId) {
//     ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'jobId required for JOB_APPLIED', path: ['jobId'] });
//   }
// });