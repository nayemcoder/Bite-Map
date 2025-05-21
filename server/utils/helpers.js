const path = require('path');

const DEFAULT_PROFILE_IMAGE = '/uploads/cat.png';

function constructImageUrl(req, imagePath) {
  if (!imagePath) return `${req.protocol}://${req.get('host')}${DEFAULT_PROFILE_IMAGE}`;
  return `${req.protocol}://${req.get('host')}/uploads/${path.basename(imagePath)}`;
}

module.exports = {
  constructImageUrl
};