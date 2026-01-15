import multer from 'multer';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const fileFilter = (req, file, cb) => {
  if (IMAGE_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos allowed'), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});
