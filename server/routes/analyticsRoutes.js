const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');
const {
  getDashboardStats,
  getReports,
  getFeedbackStats,
  getSystemOverview,
  getRoutingRules,
  updateRoutingRules,
  getSystemLogs,
  getOrganizationalStructure,
} = require('../controllers/analyticsController');

// @route   GET /api/analytics/dashboard
// @desc    Get role-scoped dashboard statistics
// @access  Private (all staff)
router.get('/dashboard', protect, getDashboardStats);

// @route   GET /api/analytics/reports
// @desc    Get detailed trend & breakdown reports
// @access  Private (all staff)
router.get('/reports', protect, getReports);

// @route   GET /api/analytics/feedback-stats
// @desc    Get feedback statistics summary
// @access  Private (all staff)
router.get('/feedback-stats', protect, getFeedbackStats);

// @route   GET /api/analytics/system
// @desc    Get system-wide overview (admin & QA only)
// @access  Private (admin, quality_assurance)
router.get(
  '/system',
  protect,
  authorize('admin', 'quality_assurance'),
  getSystemOverview
);

// @route   GET /api/analytics/routing-rules
// @desc    Get routing rules configuration
// @access  Private (admin)
router.get(
  '/routing-rules',
  protect,
  authorize('admin'),
  getRoutingRules
);

// @route   PUT /api/analytics/routing-rules
// @desc    Update routing rules configuration
// @access  Private (admin)
router.put(
  '/routing-rules',
  protect,
  authorize('admin'),
  updateRoutingRules
);

// @route   GET /api/analytics/system-logs
// @desc    Get system logs with filters
// @access  Private (admin, quality_assurance)
router.get(
  '/system-logs',
  protect,
  authorize('admin', 'quality_assurance'),
  getSystemLogs
);

// @route   GET /api/analytics/organizational-structure
// @desc    Get faculties, departments, HODs and lecturers
// @access  Private (admin, quality_assurance)
router.get(
  '/organizational-structure',
  protect,
  authorize('admin', 'quality_assurance'),
  getOrganizationalStructure
);

module.exports = router;
