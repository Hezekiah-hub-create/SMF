const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  upload
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
