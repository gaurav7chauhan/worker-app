import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connection.connection.host}`
    );
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

