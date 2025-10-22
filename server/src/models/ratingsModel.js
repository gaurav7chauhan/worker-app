import mongoose, { model, Schema } from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    setBy: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    targetRole: {
      type: String,
      enum: ['Employer', 'Worker'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    tags: { type: [String], default: [] },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isDeleted: { type: Boolean, default: false },
    editCount: { type: Number, default: 0, min: 0 },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

ratingSchema.index(
  { setBy: 1, targetUser: 1, jobId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);
ratingSchema.index(
  { targetUser: 1, createdAt: -1 },
  { partialFilterExpression: { isDeleted: { $ne: true } } }
);

ratingSchema.index(
  { setBy: 1, createdAt: -1 },
  { partialFilterExpression: { isDeleted: { $ne: true } } }
);

export const Ratings =
  mongoose.models.Ratings || model('Ratings', ratingSchema);
