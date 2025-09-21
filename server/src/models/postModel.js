import mongoose, { model, Schema } from 'mongoose';
import { jobCategories } from '../../config/categoriesConfig.js';

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
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: jobCategories, required: true },
    skills: { type: String, trim: true },
    budgetAmount: { type: Number, required: true },
    budgetCurrency: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    schedule: { type: String, required: true, trim: true },
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
