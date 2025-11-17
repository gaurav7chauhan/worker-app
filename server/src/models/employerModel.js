import mongoose, { Schema, model } from 'mongoose';
import { addressSchema } from './addressSchema.js';
import { pointSchema } from '../common/geoPoint.js';

const employerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true },
    fullName: { type: String, required: true, trim: true, min: 3 },
    address: { type: addressSchema, trim: true, default: null },
    location: { type: pointSchema },
    bio: { type: String, default: '', maxlength: 500, trim: true },
    avatarUrl: { type: String, default: '' },
    languages: { type: [String], default: ['hindi'] },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    jobsPosted: { type: Number, default: 0, min: 0 },
    hiresCount: { type: Number, default: 0, min: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

employerProfileSchema.index({ address: 1, ratingAvg: -1 }); //Equality → Sort → Range //ESR
employerProfileSchema.index({ userId: 1 }, { unique: true });

employerProfileSchema.index({ location: '2dsphere' });

export const EmployerProfile =
  mongoose.models.EmployerProfile ||
  model('EmployerProfile', employerProfileSchema);
