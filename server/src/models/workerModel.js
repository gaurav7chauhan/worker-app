import mongoose, { Schema, model } from 'mongoose';
import { addressSchema } from './addressSchema.js';

const workerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true },
    fullName: { type: String, required: true, trim: true },
    area: { type: addressSchema, default: null },
    category: { type: [String], default: [] }, // just an array
    skills: { type: [String], default: [] }, // just an array
    experienceYears: { type: Number, default: 0, min: 0 },
    bio: { type: String, default: '', maxlength: 500, trim: true },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    languages: { type: [String], default: ['hindi'] },
  },
  { timestamps: true }
);

workerProfileSchema.index({ area: 1, skills: 1, ratingAvg: -1 });
workerProfileSchema.index({ userId: 1 }, { unique: true });

export const WorkerProfile =
  mongoose.models.WorkerProfile || model('WorkerProfile', workerProfileSchema);
