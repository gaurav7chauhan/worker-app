import mongoose, { Schema } from 'mongoose';

const types = [
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

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true }, // receiver
    type: { type: String, enum: types, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    // Context for deep-links in UI; keep generic so one schema fits many events
    jobId: { type: Schema.Types.ObjectId, ref: 'JobPost' },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    //   conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    //   messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    //   reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    actorId: { type: Schema.Types.ObjectId, ref: 'AuthUser' }, // who triggered it
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    dedupeKey: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 }); // bell list
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
