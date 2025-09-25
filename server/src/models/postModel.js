import mongoose, { model, Schema } from 'mongoose';
import { addressSchema } from './addressSchema.js';

const statusType = [
  'Open',
  'Assigned',
  'InProgress',
  'SubmittedByWorker',
  'Completed',
  'Canceled',
];

const mediaItemSchema = new Schema(
  {
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ['photo', 'video'],
      required: true,
      index: true,
    },
    meta: {
      width: Number,
      height: Number,
      durationSec: Number, // for video: easy to enforce <= 10
      mime: String,
      size: Number,
    },
  },
  { _id: false }
);

const jobPostSchema = new Schema(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'EmployerProfile',
      required: true,
    },
    category: { type: [String], default: [], required: true },
    skills: { type: [String], default: [] },
    description: { type: String, trim: true },
    budgetAmount: { type: Number, required: true },
    location: { type: addressSchema, trim: true },
    schedule: { type: String, trim: true },
    status: { type: String, enum: statusType, default: 'Open' },
    employerAssets: { type: [mediaItemSchema], default: [] },

    assignedWorkerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile' },
    completionProofs: { type: [mediaItemSchema], default: [] },
    submittedAt: { type: Date },
    employerConfirmBy: { type: Date },
    approvedAt: { type: Date },
    reviewWindowEnd: { type: Date },
  },
  { timestamps: true }
);

jobPostSchema.index({ status: 1, category: 1, createdAt: -1 });
jobPostSchema.index({ employerId: 1, createdAt: -1 });

export const JobPost =
  mongoose.models.JobPost || model('JobPost', jobPostSchema);
