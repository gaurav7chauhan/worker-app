import mongoose from 'mongoose';
import { jobCategories } from '../../config/categoriesConfig.js';

const commentSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  message: String,

  quote: Number,

  createdAt: { type: Date, default: Date.now },
});

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // client who posted the job
      required: true,
    },

    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    title: { type: String, required: true },

    description: { type: String, required: true },

    location: { type: String },

    budget: { type: Number, required: true },

    images: [{ type: String }], // URLs or file paths from cloud storage

    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },

    category: {
      type: String,
      enum: jobCategories,
      required: true,
    },

    // comments: [commentSchema], // worker responses to job

    // payment: {
    //   status: {
    //     type: String,
    //     enum: ['pending', 'escrow', 'released', 'refunded'],
    //     default: 'pending',
    //   },
    //   amount: Number,
    // },
  },
  { timestamps: true }
);

jobSchema.index({ createdAt: -1 }); // Index for sorting by creation date

jobSchema.index({ owner: 1 });

export const JobPost = mongoose.model('JobPost', jobSchema);
