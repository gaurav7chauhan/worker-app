import mongoose, { Schema, model } from 'mongoose';
import { mediaItemSchema } from './mediaItemSchema.js';

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
