const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Path to the video file
 * @param {string} folder - Cloudinary folder (optional)
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadVideoToCloudinary = async (filePath, folder = 'project-videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: folder,
      eager: [
        { width: 400, height: 300, crop: 'pad' }, // Thumbnail
      ],
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail: result.eager?.[0]?.secure_url || null,
    };
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Cloudinary public_id (stored in database)
 * @returns {Promise<void>}
 */
const deleteVideoFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    // public_id is already stored correctly, just use it directly
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });
    console.log(`Video deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Error deleting video from Cloudinary:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
};

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} folder - Cloudinary folder (optional)
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImageToCloudinary = async (filePath, folder = 'project-thumbnails') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: folder,
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Optimize thumbnail size
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id (stored in database)
 * @returns {Promise<void>}
 */
const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    console.log(`Image deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
};

module.exports = {
  uploadVideoToCloudinary,
  deleteVideoFromCloudinary,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};

