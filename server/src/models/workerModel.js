import mongoose, { Schema, model } from 'mongoose';
import { addressSchema } from './addressSchema.js';
import { pointSchema } from '../common/geoPoint.js';

const workerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true },
    fullName: { type: String, required: true, trim: true },
    openForWork: { type: Boolean, default: true },
    address: { type: addressSchema, default: null },
    location: { type: pointSchema },
    category: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0 },
    bio: { type: String, default: '', maxlength: 500, trim: true },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    languages: { type: [String], default: ['hindi'] },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

workerProfileSchema.index({ address: 1, skills: 1, ratingAvg: -1 });
workerProfileSchema.index({ userId: 1 }, { unique: true });

workerProfileSchema.index({ location: '2dsphere' });

export const WorkerProfile =
  mongoose.models.WorkerProfile || model('WorkerProfile', workerProfileSchema);
