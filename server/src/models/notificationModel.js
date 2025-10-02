import mongoose, { Schema } from 'mongoose';
import { notifyTypes } from '../validator/notifyValid.js';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true }, // receiver
    actorId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true }, // who triggered it
    type: { type: String, enum: notifyTypes, required: true },
    body: { type: String, trim: true },
    // Context for deep-links in UI; keep generic so one schema fits many events
    jobId: { type: Schema.Types.ObjectId, ref: 'JobPost' },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    //   conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    //   messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    //   reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    dedupeKey: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index(
  { dedupeKey: 1 },
  {
    unique: true,
    partialFilterExpression: { dedupeKey: { $exists: true, $type: 'string' } },
  }
);


export const Notification = mongoose.model('Notification', notificationSchema);
