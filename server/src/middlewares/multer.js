import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

const upload_dir = path.join(process.cwd(), 'uploads/tmp');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, upload_dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME = new Set(['video/mp4', 'video/webm']);

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype ;
  if (IMAGE_MIME.has(mimeType) || VIDEO_MIME.has(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos allowed'), false);
  }
};

const limits = {
  fileSize: 10 * 1024 * 1024,
  files: 6,
};

export const upload = multer({ storage, fileFilter, limits });
