import mongoose, { Schema, model } from 'mongoose';
import { languages } from '../../config/languageConfig.js';
import { addressSchema } from './addressSchema.js';

const employerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    area: { type: addressSchema, trim: true, default: null },
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
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    jobsPosted: { type: Number, default: 0, min: 0 },
    hiresCount: { type: Number, default: 0, min: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

employerProfileSchema.index({ area: 1, ratingAvg: -1 }); //Equality → Sort → Range //ESR
employerProfileSchema.index({ userId: 1 }, { unique: true });

export const EmployerProfile =
  mongoose.models.EmployerProfile ||
  model('EmployerProfile', employerProfileSchema);
