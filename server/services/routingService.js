/**
 * Routing Service — DFD P2: Automatic Analysis & Routing Engine
 *
 * Maps feedback category → target role (routedTo) according to the DFD:
 *
 *  course_related  → hod  (Department / Lecturer / Course)
 *  faculty_wide    → dean_faculty  (Faculty-wide)
 *  welfare         → dean_students (Dean of Students)
 *  admission       → admissions    (Admissions Office)
 *  quality         → quality_assurance (QA Unit)
 *  mental_health   → counseling    (Counseling Unit)
 */

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const notificationService = require('./notificationService');

// ── Category → Role mapping (DFD P2) ─────────────────────────────
const CATEGORY_ROLE_MAP = {
  course_related: 'hod',
  faculty_wide: 'dean_faculty',
  welfare: 'dean_students',
  admission: 'admissions',
  quality: 'quality_assurance',
  mental_health: 'counseling',
};

// ── Priority inference from keywords ─────────────────────────────
const URGENT_KEYWORDS = [
  'urgent', 'emergency', 'critical', 'immediate', 'danger',
  'harassment', 'abuse', 'suicide', 'mental breakdown', 'crisis',
];
const HIGH_KEYWORDS = [
  'serious', 'important', 'failed', 'failing', 'discrimination',
  'unfair', 'cheating', 'fraud', 'missing', 'lost',
];

/**
 * Infer priority from title + description text.
 * @param {string} text
 * @returns {'urgent'|'high'|'medium'|'low'}
 */
const inferPriority = (text = '') => {
  const lower = text.toLowerCase();
  if (URGENT_KEYWORDS.some((kw) => lower.includes(kw))) return 'urgent';
  if (HIGH_KEYWORDS.some((kw) => lower.includes(kw))) return 'high';
  return 'medium';
};

/**
 * P2 — Route a feedback document to the correct unit.
 *
 * Steps:
 *  1. Determine target role from category map.
 *  2. Infer priority from content.
 *  3. Find the best matching staff user for that role
 *     (optionally scoped to the same department/faculty).
 *  4. Update feedback: routedTo, assignedTo, status → 'routed', routedAt.
 *  5. Send notification to the assigned user.
 *
 * @param {object} feedback  Mongoose Feedback document
 * @returns {Promise<object>}  Updated feedback document
 */
const routeFeedback = async (feedback) => {
  try {
    const targetRole = CATEGORY_ROLE_MAP[feedback.category];
    if (!targetRole) {
      console.warn(`[RoutingService] No role mapping for category: ${feedback.category}`);
      return feedback;
    }

    // Infer priority
    const inferredPriority = inferPriority(
      `${feedback.title} ${feedback.description}`
    );

    // Find best staff member for this role
    // Prefer one in the same department/faculty if available
    let assignedUser = null;

    const roleQuery = { role: targetRole, isActive: true };

    // For course-related, try to find HOD in the same department
    if (feedback.category === 'course_related' && feedback.department) {
      assignedUser = await User.findOne({
        ...roleQuery,
        department: feedback.department.toString(),
      });
    }

    // For faculty-wide, try to find dean in the same faculty
    if (!assignedUser && feedback.category === 'faculty_wide' && feedback.faculty) {
      assignedUser = await User.findOne({
        ...roleQuery,
        faculty: feedback.faculty.toString(),
      });
    }

    // Fallback: any active user with the target role
    if (!assignedUser) {
      assignedUser = await User.findOne(roleQuery);
    }

    // Update feedback document
    feedback.routedTo = targetRole;
    feedback.assignedTo = assignedUser ? assignedUser._id : null;
    feedback.status = 'routed';
    feedback.priority = inferredPriority;
    feedback.routedAt = new Date();

    await feedback.save();

    // Send notification (DFD: Admissions gets explicit notification arrow)
    if (assignedUser) {
      await notificationService.sendRoutingNotification(feedback, assignedUser);
    }

    console.log(
      `[RoutingService] Feedback ${feedback._id} routed → ${targetRole}` +
        (assignedUser ? ` (assigned to ${assignedUser.name})` : ' (no user found)')
    );

    return feedback;
  } catch (error) {
    console.error('[RoutingService] Error routing feedback:', error.message);
    throw error;
  }
};

/**
 * P5 — Escalate an unresolved feedback to the next level.
 *
 * Escalation ladder:
 *  Level 0 (not escalated) → Level 1: HOD
 *  Level 1 (HOD)           → Level 2: Dean of Faculty
 *
 * @param {object} feedback  Mongoose Feedback document
 * @param {object} escalatedByUser  Mongoose User document
 * @param {string} [note]
 * @returns {Promise<object>}
 */
const escalateFeedback = async (feedback, escalatedByUser, note = '') => {
  try {
    const nextLevel = (feedback.escalationLevel || 0) + 1;

    let targetRole;
    if (nextLevel === 1) {
      targetRole = 'hod';
    } else if (nextLevel === 2) {
      targetRole = 'dean_faculty';
    } else {
      console.warn(`[RoutingService] Max escalation level reached for ${feedback._id}`);
      return feedback;
    }

    // Find escalation target
    let escalationTarget = null;
    if (feedback.department) {
      escalationTarget = await User.findOne({
        role: targetRole,
        isActive: true,
        department: feedback.department.toString(),
      });
    }
    if (!escalationTarget) {
      escalationTarget = await User.findOne({ role: targetRole, isActive: true });
    }

    feedback.isEscalated = true;
    feedback.escalationLevel = nextLevel;
    feedback.escalatedAt = new Date();
    feedback.escalatedTo = escalationTarget ? escalationTarget._id : null;
    feedback.status = 'escalated';
    feedback.routedTo = targetRole;
    feedback.assignedTo = escalationTarget ? escalationTarget._id : null;

    feedback.statusHistory.push({
      status: 'escalated',
      changedBy: escalatedByUser._id,
      changedAt: new Date(),
      note: note || `Escalated to ${targetRole} (level ${nextLevel})`,
    });

    await feedback.save();

    if (escalationTarget) {
      await notificationService.sendEscalationNotification(
        feedback,
        escalationTarget,
        escalatedByUser
      );
    }

    console.log(
      `[RoutingService] Feedback ${feedback._id} escalated → ${targetRole} (level ${nextLevel})`
    );

    return feedback;
  } catch (error) {
    console.error('[RoutingService] Error escalating feedback:', error.message);
    throw error;
  }
};

/**
 * Get the target role for a given category (utility).
 * @param {string} category
 * @returns {string|null}
 */
const getTargetRole = (category) => CATEGORY_ROLE_MAP[category] || null;

module.exports = {
  routeFeedback,
  escalateFeedback,
  getTargetRole,
  CATEGORY_ROLE_MAP,
  inferPriority,
};
