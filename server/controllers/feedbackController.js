/**
 * Feedback Controller
 *
 * Implements the full DFD flow:
 *  P1 — submitFeedback      : validate & store
 *  P2 — (auto) routeFeedback: called inside submitFeedback
 *  P3 — respondToFeedback   : target unit investigation & response
 *  P4 — resolveFeedback     : mark resolved, notify student
 *  P5 — escalateFeedback    : escalate unresolved to next level
 */

const Feedback = require('../models/Feedback');
const Response = require('../models/Response');
const User = require('../models/User');
// Register Department & Faculty schemas so Mongoose populate() can resolve them
require('../models/Department');
require('../models/Faculty');
const routingService = require('../services/routingService');
const notificationService = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Build a role-based query filter so each user only sees
 * feedback relevant to their role.
 */
const buildRoleFilter = (user) => {
  const { role, department, faculty } = user;

  switch (role) {
    case 'student':
      // Students see only their own submissions
      return { submittedBy: user._id };

    case 'lecturer':
      // Lecturers see course-related feedback in their department
      return { category: 'course_related', department: department || null };

    case 'hod':
      // HOD sees all department feedback + escalated
      return {
        $or: [
          { routedTo: 'hod' },
          { category: 'course_related', department: department || null },
        ],
      };

    case 'dean_faculty':
      // Dean of Faculty sees faculty-wide + escalated to them
      return {
        $or: [
          { routedTo: 'dean_faculty' },
          { faculty: faculty || null },
          { isEscalated: true, escalationLevel: 2 },
        ],
      };

    case 'dean_students':
      return { routedTo: 'dean_students' };

    case 'admissions':
      return { routedTo: 'admissions' };

    case 'quality_assurance':
      // QA sees everything (university-wide oversight)
      return {};

    case 'academic_affairs':
      return { routedTo: 'academic_affairs' };

    case 'counseling':
      return { routedTo: 'counseling' };

    case 'admin':
    case 'src':
      // Admin & SRC see everything
      return {};

    default:
      return { assignedTo: user._id };
  }
};

// ─────────────────────────────────────────────────────────────────
// P1 — Submit Feedback (Validation & Storage)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Submit new feedback (P1 + triggers P2)
 * @route   POST /api/feedback
 * @access  Private (student / any authenticated user)
 */
const submitFeedback = async (req, res) => {
  try {
    const { title, description, category, isAnonymous, department, faculty } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    // Validate category
    const validCategories = Feedback.CATEGORIES;
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // P1 — Create and store feedback
    const feedback = await Feedback.create({
      title: title.trim(),
      description: description.trim(),
      category,
      isAnonymous: isAnonymous || false,
      submittedBy: isAnonymous ? null : req.user._id,
      department: department || req.user.department || null,
      faculty: faculty || req.user.faculty || null,
      status: 'new',
      statusHistory: [
        {
          status: 'new',
          changedBy: req.user._id,
          changedAt: new Date(),
          note: 'Feedback submitted',
        },
      ],
    });

    // P2 — Auto-route immediately after submission
    const routedFeedback = await routingService.routeFeedback(feedback);

    res.status(201).json({
      message: 'Feedback submitted and routed successfully',
      feedback: routedFeedback,
    });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET — List Feedback (role-filtered)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get all feedback (role-filtered) with pagination
 * @route   GET /api/feedback
 * @access  Private
 */
const getFeedback = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    const filter = buildRoleFilter(req.user);

    // Optional query filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [feedbackList, total] = await Promise.all([
      Feedback.find(filter)
        .populate('submittedBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('department', 'name code')
        .populate('faculty', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Feedback.countDocuments(filter),
    ]);

    res.json({
      feedback: feedbackList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get ALL feedback without pagination limits (role-filtered)
 * @route   GET /api/feedback/all
 * @access  Private
 */
const getAllFeedback = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    const filter = buildRoleFilter(req.user);

    // Optional query filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const feedbackList = await Feedback.find(filter)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('department', 'name code')
      .populate('faculty', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      feedback: feedbackList,
      total: feedbackList.length,
    });
  } catch (error) {
    console.error('getAllFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get feedback submitted by current user (for students)
 * @route   GET /api/feedback/my
 * @access  Private (student)
 */
const getMyFeedback = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    // Students can only see their own feedback
    const filter = { submittedBy: req.user._id };

    // Optional query filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [feedbackList, total] = await Promise.all([
      Feedback.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('department', 'name code')
        .populate('faculty', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Feedback.countDocuments(filter),
    ]);

    res.json({
      feedback: feedbackList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getMyFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET — Single Feedback
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get feedback by ID
 * @route   GET /api/feedback/:id
 * @access  Private
 */
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('submittedBy', 'name email role department faculty')
      .populate('assignedTo', 'name email role')
      .populate('escalatedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .populate('department', 'name code')
      .populate('faculty', 'name code')
      .populate({
        path: 'responses',
        populate: { path: 'respondedBy', select: 'name email role' },
      });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Access control: students can only view their own (non-anonymous)
    if (
      req.user.role === 'student' &&
      feedback.submittedBy &&
      feedback.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('getFeedbackById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// P3 — Respond to Feedback (Target Unit Processing)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Add a response to feedback (P3)
 * @route   POST /api/feedback/:id/respond
 * @access  Private (staff only)
 */
const respondToFeedback = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Response message is required' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Create response record
    const response = await Response.create({
      feedback: feedback._id,
      respondedBy: req.user._id,
      message: message.trim(),
      isInternal,
      statusAtResponse: feedback.status,
    });

    // Update feedback status to in_progress if still routed/new
    if (['new', 'routed'].includes(feedback.status)) {
      feedback.status = 'in_progress';
      feedback.statusHistory.push({
        status: 'in_progress',
        changedBy: req.user._id,
        changedAt: new Date(),
        note: 'Staff responded — investigation in progress',
      });
      await feedback.save();
    }

    // Notify student (if not anonymous and not internal note)
    if (!isInternal && feedback.submittedBy) {
      const student = await User.findById(feedback.submittedBy);
      if (student) {
        await notificationService.sendResponseNotification(feedback, student, req.user);
      }
    }

    const populatedResponse = await Response.findById(response._id).populate(
      'respondedBy',
      'name email role'
    );

    res.status(201).json({
      message: 'Response added successfully',
      response: populatedResponse,
    });
  } catch (error) {
    console.error('respondToFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// P4 — Resolve Feedback (Response & Resolution)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Mark feedback as resolved (P4)
 * @route   PUT /api/feedback/:id/resolve
 * @access  Private (staff only)
 */
const resolveFeedback = async (req, res) => {
  try {
    const { resolutionNote } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.status === 'resolved') {
      return res.status(400).json({ message: 'Feedback is already resolved' });
    }

    feedback.status = 'resolved';
    feedback.resolvedAt = new Date();
    feedback.resolvedBy = req.user._id;
    feedback.resolutionNote = resolutionNote || '';
    feedback.statusHistory.push({
      status: 'resolved',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: resolutionNote || 'Feedback resolved',
    });

    await feedback.save();

    // Notify student (P4 — Response & Resolution back to student)
    if (feedback.submittedBy) {
      const student = await User.findById(feedback.submittedBy);
      if (student) {
        await notificationService.sendResolutionNotification(feedback, student, req.user);
      }
    }

    res.json({
      message: 'Feedback resolved successfully',
      feedback,
    });
  } catch (error) {
    console.error('resolveFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// P5 — Escalate Feedback (If Unresolved)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Escalate unresolved feedback (P5)
 * @route   PUT /api/feedback/:id/escalate
 * @access  Private (staff only)
 */
const escalateFeedback = async (req, res) => {
  try {
    const { note } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.status === 'resolved') {
      return res.status(400).json({ message: 'Cannot escalate a resolved feedback' });
    }

    if (feedback.escalationLevel >= 2) {
      return res.status(400).json({ message: 'Feedback has already reached maximum escalation level' });
    }

    const escalated = await routingService.escalateFeedback(feedback, req.user, note);

    res.json({
      message: `Feedback escalated to level ${escalated.escalationLevel}`,
      feedback: escalated,
    });
  } catch (error) {
    console.error('escalateFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Update Status (general)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Update feedback status
 * @route   PUT /api/feedback/:id/status
 * @access  Private (staff only)
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = Feedback.STATUSES;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const previousStatus = feedback.status;
    feedback.status = status;
    feedback.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Status changed from ${previousStatus} to ${status}`,
    });

    if (status === 'resolved') {
      feedback.resolvedAt = new Date();
      feedback.resolvedBy = req.user._id;
    }

    await feedback.save();

    res.json({ message: 'Status updated', feedback });
  } catch (error) {
    console.error('updateFeedbackStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Delete Feedback (admin only)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Delete feedback
 * @route   DELETE /api/feedback/:id
 * @access  Private (admin only)
 */
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await Response.deleteMany({ feedback: feedback._id });
    await feedback.deleteOne();

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('deleteFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Get Feedback Stats (for dashboards)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get feedback statistics for the current user's scope
 * @route   GET /api/feedback/stats
 * @access  Private
 */
const getFeedbackStats = async (req, res) => {
  try {
    const filter = buildRoleFilter(req.user);

    const [total, byStatus, byCategory, escalated, recentFeedback] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Feedback.countDocuments({ ...filter, isEscalated: true }),
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('submittedBy', 'name')
        .populate('department', 'name'),
    ]);

    // Flatten byStatus into a map
    const statusMap = {};
    byStatus.forEach(({ _id, count }) => { statusMap[_id] = count; });

    const categoryMap = {};
    byCategory.forEach(({ _id, count }) => { categoryMap[_id] = count; });

    const resolved = statusMap['resolved'] || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      total,
      new: statusMap['new'] || 0,
      routed: statusMap['routed'] || 0,
      inProgress: statusMap['in_progress'] || 0,
      resolved,
      escalated,
      closed: statusMap['closed'] || 0,
      resolutionRate,
      byCategory: categoryMap,
      recentFeedback,
    });
  } catch (error) {
    console.error('getFeedbackStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get notifications for current user
 * @route   GET /api/feedback/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = notificationService.getNotificationsForUser(req.user._id);
    const unreadCount = notificationService.getUnreadCount(req.user._id);
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/feedback/notifications/:notifId/read
 * @access  Private
 */
const markNotificationRead = async (req, res) => {
  try {
    const notif = notificationService.markAsRead(parseInt(req.params.notifId));
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', notification: notif });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
