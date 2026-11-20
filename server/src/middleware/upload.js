const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MB = 1024 * 1024;
const ROOT = path.join(__dirname, '..', '..');
const THUMB_DIR = path.join(ROOT, 'uploads', 'thumbnails'); // public
const FILE_DIR = path.join(ROOT, 'storage', 'products'); // private (served only after purchase)

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const FILE_EXT = /\.(pdf|zip|docx?|xlsx?|pptx?|txt|epub)$/i;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'thumbnail' ? THUMB_DIR : FILE_DIR;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = file.fieldname === 'thumbnail' ? IMAGE_EXT.test(file.originalname) : FILE_EXT.test(file.originalname);
  cb(ok ? null : new Error(file.fieldname === 'thumbnail' ? 'Thumbnail must be jpg, png, webp or gif' : 'Unsupported product file type'), ok);
};

const uploader = multer({ storage, fileFilter, limits: { fileSize: 50 * MB, files: 2 } }).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

// Converts multer errors into clean JSON 400 responses
exports.uploadProductFiles = (req, res, next) =>
  uploader(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 50 MB)' : err.message || 'Upload failed';
    res.status(400).json({ success: false, message });
  });

exports.PATHS = { ROOT, THUMB_DIR, FILE_DIR };
