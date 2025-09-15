import mongoose, { Schema, model } from 'mongoose';
import { jobCategories } from '../../config/categoriesConfig.js';
import { languages } from '../../config/languageConfig.js';
import { addressSchema } from './addressSchema.js';

const workerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    area: { type: addressSchema, trim: true, default: null },
    skills: [{ type: String, enum: jobCategories, index: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    bio: { type: String, default: '', maxlength: 500, trim: true },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    languages: {
      type: [String],
      default: ['hindi'],
      set: (arr) =>
        Array.isArray(arr)
          ? arr.map((v) => String(v).toLowerCase().trim())
          : [],
      validate: {
        validator: (arr) =>
          arr.every((v) => languages.includes(String(v).toLowerCase())),
        message: 'Invalid language in languages array',
      },
    },
    availability: {
      type: String,
      enum: ['available', 'off-work', 'outside'],
      default: 'available',
    },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedJobs: { type: Number, default: 0, min: 0 },
    onTimeRate: { type: Number, default: 0, min: 0, max: 100 },
    repeatClientRate: { type: Number, default: 0, min: 0, max: 100 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

workerProfileSchema.index({ area: 1, skills: 1, ratingAvg: -1 });
workerProfileSchema.index({ userId: 1 }, { unique: true });

export const WorkerProfile =
  mongoose.models.WorkerProfile || model('WorkerProfile', workerProfileSchema);
