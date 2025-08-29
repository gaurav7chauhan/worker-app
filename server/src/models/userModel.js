import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ratingSubSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPost',
      index: true,
    },
    
    rating: { type: Number, min: 1, max: 5, required: true },

    tags: [{ type: String, trim: true, maxlength: 32 }],
  },
  {
    _id: false,
    timestamps: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    userType: { type: String, enum: ['worker', 'employer'], required: true },

    isBlocked: { type: Boolean, default: false },

    location: { type: String, minlength: 2, required: false },

    agreeTerms: { type: Boolean, required: false },

    profileImage: String,

    averageRating: { type: Number, default: 0 },

    ratingCount: { type: Number, default: 0 },

    ratingSum: { type: Number, default: 0 },

    ratings: {
      type: [ratingSubSchema],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ 'ratings.fromUser': 1, 'ratings.createdAt': -1 });
userSchema.index({ 'ratings.job': 1 });
userSchema.index({ userType: 1 });

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
