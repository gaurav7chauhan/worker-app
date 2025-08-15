import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    userType: { type: String, enum: ['worker', 'employer'], required: true },

    isBlocked: { type: Boolean, default: false },

    location: { type: String, minlength: 2 },

    agreeTerms: { type: Boolean, required: true },

    profileImage: String,

    averageRating: { type: Number, default: 0 }, // ← add this for rating

    ratings: [
      {
        // ← add this for rating history
        fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost' },
        rating: { type: Number, min: 1, max: 5 },
        tags: [{ type: String }],
      },
    ],
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
