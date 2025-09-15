import { Schema } from 'mongoose';

export const addressSchema = new Schema(
  {
    line1: { type: String, trim: true, maxlength: 120, required: true }, // house/flat, building
    line2: { type: String, trim: true, maxlength: 120 }, // street/landmark
    line3: { type: String, trim: true, maxlength: 120 }, // optional extra
    pincode: { type: String, trim: true, maxlength: 10, required: true }, // keep as string, India pincodes can start with 0
    city: { type: String, trim: true, maxlength: 80, required: true },
    state: { type: String, trim: true, maxlength: 80, required: true },
  },
  { _id: false }
);
