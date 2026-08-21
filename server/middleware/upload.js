const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const makeStorage = (folder, resourceType = 'auto') =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `lms/${folder}`,
      resource_type: resourceType,
    },
  });

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files are allowed'), false);
};

exports.uploadAvatar = multer({
  storage: makeStorage('avatars', 'image'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadThumbnail = multer({
  storage: makeStorage('thumbnails', 'image'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadVideo = multer({
  storage: makeStorage('videos', 'video'),
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

exports.uploadResource = multer({
  storage: makeStorage('resources', 'raw'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
