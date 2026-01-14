import { Schema } from 'mongoose';

export const addressSchema = new Schema(
  {
    line1: { type: String, trim: true, maxlength: 150}, // house/flat, building
    city: { type: String, trim: true, maxlength: 100, },
    neighbourhood: { type: String, trim: true, maxlength: 100, },
  },
  { _id: false }
);
