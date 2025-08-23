import mongoose, { Schema } from 'mongoose';

const refreshSessionSchema = new Schema(
  {
    principalType: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      index: true,
    },

    principalId: {
      type: String,
      required: true,
      index: true,
    },

    // Unique identifier embedded in the refresh JWT payload
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // When this refresh token should expire (from JWT exp)
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Soft invalidation flag (optional but recommended)
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshSession = mongoose.model(
  'RefreshSession',
  refreshSessionSchema
);
