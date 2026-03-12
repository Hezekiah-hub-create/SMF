const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  processMessage,
  getQuickActionsHandler,
  getFeedbackStatus,
  startFeedbackSubmit
} = require('../controllers/chatbotController');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/chatbot/message
 * @desc    Process a chatbot message
 * @access  Private
 */
router.post('/message', processMessage);

/**
 * @route   GET /api/chatbot/quick-actions
 * @desc    Get quick action options
 * @access  Private
 */
router.get('/quick-actions', getQuickActionsHandler);

/**
 * @route   GET /api/chatbot/feedback-status
 * @desc    Get user's feedback status summary
 * @access  Private
 */
router.get('/feedback-status', getFeedbackStatus);

/**
 * @route   POST /api/chatbot/start-submit
 * @desc    Start feedback submission flow
 * @access  Private
 */
router.post('/start-submit', startFeedbackSubmit);

module.exports = router;

