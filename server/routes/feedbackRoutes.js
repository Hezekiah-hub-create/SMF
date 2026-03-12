const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');
const {
  submitFeedback,
  getFeedback,
  getAllFeedback,
  getMyFeedback,
  getFeedbackById,
  respondToFeedback,
  resolveFeedback,
  escalateFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats,
  getNotifications,
  markNotificationRead,
} = require('../controllers/feedbackController');

// ── Notification routes (before /:id to avoid conflict) ──────────
// @route   GET /api/feedback/notifications
router.get('/notifications', protect, getNotifications);

// @route   PUT /api/feedback/notifications/:notifId/read
router.put('/notifications/:notifId/read', protect, markNotificationRead);

// ── Stats ─────────────────────────────────────────────────────────
// @route   GET /api/feedback/stats
router.get('/stats', protect, getFeedbackStats);

// ── Core CRUD ─────────────────────────────────────────────────────

// @route   GET /api/feedback
// @desc    Get all feedback (role-filtered)
router.get('/', protect, getFeedback);

// @route   GET /api/feedback/all
// @desc    Get ALL feedback without pagination (role-filtered)
router.get('/all', protect, getAllFeedback);

// @route   GET /api/feedback/my
// @desc    Get feedback submitted by current user (for students)
router.get('/my', protect, getMyFeedback);

// @route   POST /api/feedback
// @desc    P1 — Submit feedback (triggers P2 auto-routing)
// @access  Any authenticated user (students + staff)
router.post('/', protect, submitFeedback);

// @route   GET /api/feedback/:id
// @desc    Get single feedback with responses
router.get('/:id', protect, getFeedbackById);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (admin only)
router.delete('/:id', protect, authorize(...ROLES.SYSTEM_ADMIN), deleteFeedback);

// ── Status management ─────────────────────────────────────────────

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status (staff only)
router.put(
  '/:id/status',
  protect,
  authorize(...ROLES.ALL_STAFF),
  updateFeedbackStatus
);

// ── P3 — Respond (Target Unit Processing) ────────────────────────

// @route   POST /api/feedback/:id/respond
// @desc    Add a response to feedback
router.post(
  '/:id/respond',
  protect,
  authorize(...ROLES.ALL_STAFF),
  respondToFeedback
);

// ── P4 — Resolve ──────────────────────────────────────────────────

// @route   PUT /api/feedback/:id/resolve
// @desc    Mark feedback as resolved
router.put(
  '/:id/resolve',
  protect,
  authorize(...ROLES.ALL_STAFF),
  resolveFeedback
);

// ── P5 — Escalate ─────────────────────────────────────────────────

// @route   PUT /api/feedback/:id/escalate
// @desc    Escalate unresolved feedback to next level
router.put(
  '/:id/escalate',
  protect,
  authorize(...ROLES.ALL_STAFF),
  escalateFeedback
);

module.exports = router;
