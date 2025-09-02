import { Schema, model } from 'mongoose';
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
  },
  { timestamps: true }
);

authUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

authUserSchema.method.isPasswordMatch = async function (incomingPassword) {
  return await bcrypt.compare(incomingPassword, this.password);
};

export const AuthUser = model('AuthUser', authUserSchema);
