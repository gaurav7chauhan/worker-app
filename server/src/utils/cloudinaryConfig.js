import { promises as fs } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  localFilePath,
  fileType,
  mime,
  opts = {}
) => {
  if (!localFilePath || !fileType) return null;

  // Strict MIME allow-list
  const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const VIDEO_MIME = new Set(['video/mp4', 'video/webm']);
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';

  if (
    (isImage && !IMAGE_MIME.has(mime)) ||
    (isVideo && !VIDEO_MIME.has(mime))
  ) {
    try {
      await fs.unlink(localFilePath);
    } catch {}
    return null;
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: isImage ? 'image' : 'video',
      folder: opts?.folder,
      public_id: opts?.public_id,
      overwrite: true,
    });

    if (isVideo && response?.duration && response.duration > 15) {
      await cloudinary.uploader.destroy(response.public_id, {
        resource_type: 'video',
        invalidate: true,
      });
      return null;
    }

    return response;
  } catch (error) {
    return null;
  } finally {
    try {
      await fs.unlink(localFilePath);
    } catch {}
  }
};
