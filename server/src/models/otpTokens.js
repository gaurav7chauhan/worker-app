import { Schema } from 'mongoose';

const otpTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      index: true,
      // required: true
    },
    channel: {
      type: String,
      enum: ['email', 'phone'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['login', 'register', 'email_change', 'password_reset'],
    },
    codeHash: { type: String, required: true },
    consumed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const OtpToken = model('OtpToken', otpTokenSchema);
