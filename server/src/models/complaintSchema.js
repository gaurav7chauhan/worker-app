import mongoose, { Schema, model } from 'mongoose';

const mediaItemSchema = new Schema(
  {
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ['photo', 'video'],
      required: true,
      index: true,
    },
    meta: {
      width: Number,
      height: Number,
      durationSec: Number, // for video: easy to enforce <= 10
      mime: String,
      size: Number,
    },
  },
  { _id: false }
);

const complaintSchema = Schema(
  {
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    reqUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    note: {
      type: String,
      maxlength: 500,
      required: true,
    },
    proofs: {
      type: [mediaItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'rejected'],
      default: 'open',
    },
    adminComments: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ReqComplaint =
  mongoose.models.ReqComplaint || model('ReqComplaint', complaintSchema);
