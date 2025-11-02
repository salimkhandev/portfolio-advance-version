const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|wmv|flv|webm|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'));
  }
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: videoFilter
});

const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: imageFilter
});

const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit per file
    fieldSize: 50 * 1024 * 1024, // 50MB for other fields
    fields: 10, // Maximum number of non-file fields
    fieldNameSize: 100, // Maximum field name size
    files: 2 // Maximum number of files (video + thumbnail)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      return videoFilter(req, file, cb);
    }
    if (file.fieldname === 'thumbnail') {
      return imageFilter(req, file, cb);
    }
    cb(new Error('Invalid file type!'));
  }
});

module.exports = {
  uploadVideo: uploadVideo.single('video'),
  uploadImage: uploadImage.single('image'), // Changed to 'image' for skills
  uploadMultiple: uploadMultiple.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ])
};

