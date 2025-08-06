import fs from 'fs/promises';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log('File path not found');
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'image',
    });

    await fs.unlink(localFilePath);
    return response;
  } catch (error) {
    await fs.unlink(localFilePath);
    return null;
  }
};
