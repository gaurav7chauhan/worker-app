import mongoose, { Schema } from 'mongoose';

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPost',
      required: true,
      index: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    coverNote: { type: String, trim: true, maxlength: 500 },
    expectedRate: { type: Number },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ workerId: 1, status: 1, createdAt: -1 });

export const Application =
  mongoose.models.Application ||
  mongoose.model('Application', applicationSchema);
