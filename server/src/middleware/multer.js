import multer from 'multer';

// Temporary storage before upload to Cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Or use memoryStorage for direct buffer usage
  },
  filename: function (req, file, cb) {
    // Unique filename
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });
export default upload;
