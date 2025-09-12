import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const authUserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Employer', 'Worker'],
      required: true,
    },
    isBlocked: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    verificationExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

authUserSchema.index(
  { verificationExpires: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { emailVerified: false } }
);

authUserSchema.index({ email: 1 });

authUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

authUserSchema.methods.isPasswordMatch = async function (incomingPassword) {
  return bcrypt.compare(incomingPassword, this.password);
};

export const AuthUser = mongoose.models.AuthUser || model('AuthUser', authUserSchema);
