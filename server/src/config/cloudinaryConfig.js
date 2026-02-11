import { promises as fs } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary once at startup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = (buffer, mime, opts = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: opts.folder,
        public_id: opts.public_id,
      },
      (error, result) => {
        if (error) return resolve(null);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

