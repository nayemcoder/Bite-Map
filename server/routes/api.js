const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const authController = require('../controllers/auth');
const profileController = require('../controllers/profile');
const upload = require('../config/multer');

// Auth routes
router.post('/signup', upload.single('profilePic'), authController.signup);
router.post('/login', authController.login);

// Profile routes
router.get('/profile', authenticateToken, profileController.getProfile);
router.put('/update-profile', authenticateToken, upload.single('profilePic'), profileController.updateProfile);

module.exports = router;