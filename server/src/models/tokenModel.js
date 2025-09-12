import mongoose, { Schema } from 'mongoose';

const refreshSessionSchema = new Schema(
  {
    principalType: {
      type: String,
      enum: ['User', 'Admin'],
      required: true,
    },
    principalId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      refPath: 'principalType',
    },
    jti: { type: String, required: true, unique: true },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: { type: Date },
    reason: { type: String },
    // Optional: bind to client context for added security
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helpful compound index for common queries: active sessions per user
RefreshSessionSchema.index({ principalId: 1, revoked: 1 });

export const RefreshSession =
  mongoose.models.RefreshSession ||
  mongoose.model('RefreshSession', refreshSessionSchema);
