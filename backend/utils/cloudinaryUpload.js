const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Upload video to Cloudinary directly from buffer (optimized for serverless)
 * @param {string|Buffer} fileInput - Path to the video file OR Buffer containing video data
 * @param {string} folder - Cloudinary folder (optional)
 * @returns {Promise<{url: string, public_id: string, thumbnail: string}>}
 */
const uploadVideoToCloudinary = async (fileInput, folder = 'project-videos') => {
  try {
    const isBuffer = Buffer.isBuffer(fileInput);
    
    // Minimal options for faster upload - no eager transformations (can be done later)
    // Use chunk_size for large files on serverless platforms
    const uploadOptions = {
      resource_type: 'video',
      folder: folder,
      chunk_size: 6000000, // 6MB chunks - helps with large files on Vercel
      // Removed eager transformations to speed up upload
      // Thumbnails can be generated on-demand using Cloudinary URLs
    };

    let result;
    if (isBuffer) {
      // Direct upload from memory buffer - fastest for serverless
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        // Stream buffer directly to Cloudinary
        uploadStream.end(fileInput);
      });
    } else {
      // Legacy: Upload from file path (only for local development)
      result = await cloudinary.uploader.upload(fileInput, uploadOptions);
      // Clean up local file
      if (fs.existsSync(fileInput)) {
        fs.unlinkSync(fileInput);
      }
    }

    // Generate thumbnail URL on-the-fly using Cloudinary video transformation
    // This doesn't require processing during upload - Cloudinary generates it on first request
    // Construct URL with video-to-image transformation
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
 * Upload image to Cloudinary directly from buffer (optimized for serverless)
 * @param {string|Buffer} fileInput - Path to the image file OR Buffer containing image data
 * @param {string} folder - Cloudinary folder (optional)
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImageToCloudinary = async (fileInput, folder = 'project-thumbnails') => {
  try {
    // Determine if fileInput is a Buffer (memory storage) or a file path (disk storage)
    const isBuffer = Buffer.isBuffer(fileInput);
    
    // Minimal options for fastest upload - transformations can be done on-demand via URL
    let uploadOptions = {
      resource_type: 'image',
      folder: folder,
      // Removed transformations during upload for speed
      // Use Cloudinary URL transformations on-demand instead
      quality: 'auto',
      fetch_format: 'auto'
    };

    let result;
    if (isBuffer) {
      // Direct upload from memory buffer - fastest for serverless
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        // Stream buffer directly to Cloudinary
        uploadStream.end(fileInput);
      });
    } else {
      // Legacy: Upload from file path (only for local development)
      result = await cloudinary.uploader.upload(fileInput, uploadOptions);
      // Clean up local file
      if (fs.existsSync(fileInput)) {
        fs.unlinkSync(fileInput);
      }
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Only clean up file if it was a file path (not a buffer)
    if (!Buffer.isBuffer(fileInput) && fs.existsSync(fileInput)) {
      fs.unlinkSync(fileInput);
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

