import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['worker', 'employer'],
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      match: /^\+?\d{10,15}$/,
      required: false,
    },
    location: {
      type: String,
      required: false,
      minlength: 2,
    },
    agreeTerms: {
      type: Boolean,
      required: true,
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

// password hash for user
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  }
  return next();
});

userSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
