const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUsersByRole,
  resetUserPassword,
  updatePushToken,
} = require('../controllers/userController');

// All user management routes require admin role

// @route   POST /api/users/push-token
// @desc    Update user's push notification token (for mobile app)
router.put('/push-token', protect, updatePushToken);

// @route   GET /api/users/by-role
// @desc    Get users grouped by role (for dropdowns)
router.get('/by-role', protect, authorize(...ROLES.SYSTEM_ADMIN), getUsersByRole);

// @route   GET /api/users
// @desc    Get all users with optional filters
router.get('/', protect, authorize(...ROLES.SYSTEM_ADMIN), getAllUsers);

// @route   POST /api/users
// @desc    Create a new user
router.post('/', protect, authorize(...ROLES.SYSTEM_ADMIN), createUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', protect, authorize(...ROLES.SYSTEM_ADMIN), getUserById);

// @route   PUT /api/users/:id
// @desc    Update user details
router.put('/:id', protect, authorize(...ROLES.SYSTEM_ADMIN), updateUser);

// @route   PUT /api/users/:id/toggle-status
// @desc    Activate / deactivate user
router.put('/:id/toggle-status', protect, authorize(...ROLES.SYSTEM_ADMIN), toggleUserStatus);

// @route   PUT /api/users/:id/reset-password
// @desc    Reset user password
router.put('/:id/reset-password', protect, authorize(...ROLES.SYSTEM_ADMIN), resetUserPassword);

// @route   DELETE /api/users/:id
// @desc    Delete user
router.delete('/:id', protect, authorize(...ROLES.SYSTEM_ADMIN), deleteUser);

module.exports = router;
