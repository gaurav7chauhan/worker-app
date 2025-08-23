import mongoose from 'mongoose';
import { jobCategories } from '../../config/categoriesConfig';

const commentSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  message: String,

  quote: Number,

  createdAt: { type: Date, default: Date.now },
});

const jobSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // client who posted the job
      required: true,
    },

    selectedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    title: { type: String, required: true },

    description: { type: String, required: true },

    location: { type: String, required: true },

    budget: { type: Number, required: true },

    images: [{ type: String }], // URLs or file paths from cloud storage

    status: {
      type: String,
      enum: ['Open', 'Hired', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },

    category: {
      type: String,
      enum: jobCategories,
      required: true,
    },

    comments: [commentSchema], // worker responses to job

    payment: {
      status: {
        type: String,
        enum: ['pending', 'escrow', 'released', 'refunded'],
        default: 'pending',
      },
      amount: Number,
    },
  },
  { timestamps: true }
);

export const JobPost = mongoose.model('JobPost', jobSchema);
