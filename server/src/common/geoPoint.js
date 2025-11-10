import { Schema } from 'mongoose';

export const pointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

export const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().gte(-180).lte(180), // Longitude
    z.number().gte(-90).lte(90), // Latitude
  ]),
});
