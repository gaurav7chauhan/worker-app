import mongoose, { Schema } from 'mongoose';

const userActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  actions: String, // e.g., 'search', 'visit_page'

  details: String, // e.g., searched term or page name

  duration: Number, // For 'visit_page', time spent in seconds (optional)

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);

