// utils/helpers.js
const path = require('path');

const DEFAULT_PROFILE_IMAGE = '/uploads/default-profile.png';
const DEFAULT_RESTAURANT_IMAGE = '/uploads/default-restaurant.jpg';

/**
 * Construct full image URL for profile or restaurant image.
 * Returns default image URL if no imagePath provided.
 *
 * @param {Request} req - Express request object
 * @param {string} imagePath - Image filename or path
 * @param {'profile'|'restaurant'} type - Image type for default fallback
 * @returns {string} - Full URL to the image
 */
function constructImageUrl(req, imagePath, type = 'profile') {
  if (!imagePath) {
    const defaultImage = type === 'restaurant' ? DEFAULT_RESTAURANT_IMAGE : DEFAULT_PROFILE_IMAGE;
    return `${req.protocol}://${req.get('host')}${defaultImage}`;
  }

  // Use only the basename to avoid any directory traversal
  const filename = path.basename(imagePath);

  // Replace backslashes (Windows) with slashes (URL friendly)
  return `${req.protocol}://${req.get('host')}/uploads/${filename.replace(/\\/g, '/')}`;
}

module.exports = {
  constructImageUrl
};
