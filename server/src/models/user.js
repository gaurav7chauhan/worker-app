import { Schema, model } from 'mongoose';
import { jobCategories } from '../../config/categoriesConfig.js';

const employerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

employerProfileSchema.index({ area: 1, ratingAvg: -1 });      //Equality → Sort → Range //ESR
employerProfileSchema.index({ userId: 1 }, { unique: true });
export const EmployerProfile = model('EmployerProfile', employerProfileSchema);

const workerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    skills: [{ type: String, enum: jobCategories, index: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

workerProfileSchema.index({ area: 1, skills: 1, ratingAvg: -1 });
workerProfileSchema.index({ userId: 1 }, { unique: true });
export const WorkerProfile = model('WorkerProfile', workerProfileSchema);
