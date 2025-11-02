const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadVideoToCloudinary = async (fileInput, folder = 'project-videos') => {
  try {
    const isBuffer = Buffer.isBuffer(fileInput);
    const uploadOptions = {
      resource_type: 'video',
      folder: folder,
      chunk_size: 6000000,
    };

    let result;
    if (isBuffer) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        uploadStream.end(fileInput);
      });
    } else {
      result = await cloudinary.uploader.upload(fileInput, uploadOptions);
      if (fs.existsSync(fileInput)) fs.unlinkSync(fileInput);
    }

    const thumbnailUrl = cloudinary.utils.url(result.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 400, height: 300, crop: 'pad', quality: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail: thumbnailUrl,
    };
  } catch (error) {
    // Only clean up file if it was a file path (not a buffer)
    if (!Buffer.isBuffer(fileInput) && fs.existsSync(fileInput)) {
      fs.unlinkSync(fileInput);
    }
    throw error;
  }
};

const deleteVideoFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });
  } catch (error) {
    // Don't throw - deletion failures shouldn't break the flow
  }
};

const uploadImageToCloudinary = async (fileInput, folder = 'project-thumbnails') => {
  try {
    const isBuffer = Buffer.isBuffer(fileInput);
    let uploadOptions = {
      resource_type: 'image',
      folder: folder,
      quality: 'auto',
      fetch_format: 'auto'
    };

    let result;
    if (isBuffer) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        uploadStream.end(fileInput);
      });
    } else {
      result = await cloudinary.uploader.upload(fileInput, uploadOptions);
      if (fs.existsSync(fileInput)) fs.unlinkSync(fileInput);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    if (!Buffer.isBuffer(fileInput) && fs.existsSync(fileInput)) {
      fs.unlinkSync(fileInput);
    }
    throw error;
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  } catch (error) {
    // Don't throw - deletion failures shouldn't break the flow
  }
};

module.exports = {
  uploadVideoToCloudinary,
  deleteVideoFromCloudinary,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};

