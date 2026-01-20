import mongoose, { model, Schema } from 'mongoose';
import { addressSchema } from './addressSchema.js';
import { pointSchema } from '../common/geoPoint.js';
import { mediaItemSchema } from './mediaItemSchema.js';

const statusType = ['Open', 'Closed', 'Completed', 'Canceled'];

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
    address: { type: addressSchema },
    location: { type: pointSchema },
    schedule: { type: String, trim: true, lowercase: true },
    payType: {
      type: String,
      enum: ['hourly', 'weekly', 'monthly'],
      lowercase: true,
    },
    city: { type: String, trim: true, lowercase: true },
    state: { type: String, trim: true, lowercase: true },
    status: { type: String, enum: statusType, default: 'Open' },
    employerAssets: { type: [mediaItemSchema], default: [] },
    // worker
    assignedWorkerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile' },
    completionProofs: { type: [mediaItemSchema], default: [] },
    submittedAt: { type: Date },
    employerConfirmBy: { type: Date },
    approvedAt: { type: Date },
    reviewWindowEnd: { type: Date },
  },
  { timestamps: true }
);

// Indexes for common filters/sorts
jobPostSchema.index({ status: 1, createdAt: -1 });
jobPostSchema.index({ employerId: 1, _id: 1, createdAt: -1 });

// Keep category/skills/budget separate unless you truly need this compound
jobPostSchema.index({ category: 1 });
jobPostSchema.index({ skills: 1 });
jobPostSchema.index({ budgetAmount: 1 });

// Critical: geospatial index
jobPostSchema.index({ location: '2dsphere' });

export const JobPost =
  mongoose.models.JobPost || model('JobPost', jobPostSchema);
