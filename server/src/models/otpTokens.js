import { Schema } from 'mongoose';

const otpTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      index: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['login', 'register', 'email_change', 'password_reset'],
    },
    codeHash: { type: String, required: true },
    consumed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpTokenSchema.index(
  { userId: 1, purpose: 1, email: 1, consumed: 1 },
  { unique: true, partialFilterExpression: { consumed: false } }
);

export const OtpToken = model('OtpToken', otpTokenSchema);
