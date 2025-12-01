import { Schema } from "mongoose";

export const mediaItemSchema = new Schema(
  {
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ['image'],
      required: true,
      index: true,
    },
    meta: {
      width: Number,
      height: Number,
      mime: String,
      size: Number,
    },
  },
  { _id: false }
);
