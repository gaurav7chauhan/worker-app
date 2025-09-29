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

const scheduleSchema = new mongoose.Schema(
  {
    timeFrom: { type: String }, // HH:MM
    timeTo: { type: String },
    dayPart: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
    },
    term: {
      type: String,
      enum: [
        'one_time',
        'half_day',
        'full_day',
        'full_time',
        '1_week',
        '2_weeks',
        '3_weeks',
        '1_month',
        '2_months',
        '3_months',
      ],
      required: true,
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
    skills: { type: [String], default: undefined },
    description: { type: String, trim: true },
    budgetAmount: { type: Number, required: true },
    location: { type: addressSchema },
    schedule: { scheduleSchema },
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
