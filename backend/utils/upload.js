const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Temporary storage - files will be uploaded to Cloudinary and then deleted
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with appropriate prefix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let prefix = 'file-';
    if (file.fieldname === 'thumbnail' || file.fieldname === 'image') {
      prefix = file.fieldname === 'thumbnail' ? 'thumbnail-' : 'image-';
    } else if (file.fieldname === 'video') {
      prefix = 'video-';
    }
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for videos
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

// File filter for images
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

// Configure multer for videos
const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: videoFilter
});

// Configure multer for images (supports both 'image' and 'thumbnail' fieldnames)
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: imageFilter
});

// Configure multer for multiple file types (videos and images)
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if it's a video
    if (file.fieldname === 'video') {
      return videoFilter(req, file, cb);
    }
    // Check if it's an image/thumbnail
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

