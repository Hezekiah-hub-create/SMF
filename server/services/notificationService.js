/**
 * Notification Service
 *
 * Handles in-app notification logging when feedback is routed (P2),
 * escalated (P5), or resolved (P4).
 *
 * In production this can be extended to send emails / push notifications.
 * For now it logs structured notification records to the console and
 * stores them in a lightweight in-memory store (easily swappable for a DB model).
 */

// ── In-memory notification store (replace with DB model in production) ──
const notifications = [];
let notifIdCounter = 1;

/**
 * Send push notification via Expo (for mobile app users)
 * @param {string} pushToken - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to pass
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
      }),
    });
    
    const result = await response.json();
    console.log('[PushNotification] Sent:', result);
    return result;
  } catch (error) {
    console.error('[PushNotification] Error:', error);
    return null;
  }
};

/**
 * Send push notification to a user if they have a push token
 * @param {object} user - User document with pushToken field
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data
 */
const notifyUserViaPush = async (user, title, body, data = {}) => {
  if (user && user.pushToken) {
    try {
      await sendPushNotification(user.pushToken, title, body, data);
    } catch (error) {
      console.error('[NotificationService] Failed to send push notification:', error);
    }
  }
};

/**
 * Create and store a notification record.
 * @param {object} opts
 * @param {string} opts.type        - 'routing' | 'escalation' | 'resolution' | 'response' | 'appointment'
 * @param {string} opts.title       - Short notification title
 * @param {string} opts.message     - Full notification message
 * @param {object} opts.recipient   - User document (recipient)
 * @param {object} opts.feedback    - Feedback document
 * @param {object} [opts.actor]     - User who triggered the notification
 * @param {object} [opts.appointment] - Appointment document
 * @returns {object} notification record
 */
const createNotification = ({ type, title, message, recipient, feedback, actor, appointment }) => {
  const notification = {
    id: notifIdCounter++,
    type,
    title,
    message,
    recipientId: recipient ? recipient._id : null,
    recipientName: recipient ? recipient.name : 'Unknown',
    recipientRole: recipient ? recipient.role : null,
    feedbackId: feedback ? feedback._id : null,
    feedbackTitle: feedback ? feedback.title : null,
    appointmentId: appointment ? appointment._id : null,
    actorId: actor ? actor._id : null,
    actorName: actor ? actor.name : 'System',
    isRead: false,
    createdAt: new Date(),
  };

  notifications.push(notification);

  console.log(
    `[NotificationService] [${type.toUpperCase()}] → ${notification.recipientName} (${notification.recipientRole}): ${title}`
  );

  return notification;
};

/**
 * P2 — Send routing notification to the assigned staff member.
 * @param {object} feedback  Mongoose Feedback document
 * @param {object} recipient Mongoose User document
 */
const sendRoutingNotification = async (feedback, recipient) => {
  const categoryLabels = {
    course_related: 'Course-Related',
    faculty_wide: 'Faculty-Wide',
    welfare: 'Welfare',
    admission: 'Admission',
    quality: 'Quality',
    mental_health: 'Mental Health',
  };

  const categoryLabel = categoryLabels[feedback.category] || feedback.category;

  return createNotification({
    type: 'routing',
    title: `New ${categoryLabel} Feedback Assigned`,
    message: `A new feedback item "${feedback.title}" has been routed to you for investigation. Priority: ${feedback.priority}.`,
    recipient,
    feedback,
    actor: null,
  });
};

/**
 * P5 — Send escalation notification to the escalation target.
 * @param {object} feedback         Mongoose Feedback document
 * @param {object} recipient        Mongoose User document (escalation target)
 * @param {object} escalatedByUser  Mongoose User document (who escalated)
 */
const sendEscalationNotification = async (feedback, recipient, escalatedByUser) => {
  return createNotification({
    type: 'escalation',
    title: `Escalated Feedback Requires Attention`,
    message: `Feedback "${feedback.title}" has been escalated to you (Level ${feedback.escalationLevel}) by ${escalatedByUser ? escalatedByUser.name : 'the system'} as it remains unresolved.`,
    recipient,
    feedback,
    actor: escalatedByUser,
  });
};

/**
 * P4 — Send resolution notification to the student who submitted.
 * Also sends push notification to mobile app users.
 * @param {object} feedback   Mongoose Feedback document
 * @param {object} recipient  Mongoose User document (student)
 * @param {object} resolver   Mongoose User document (staff who resolved)
 */
const sendResolutionNotification = async (feedback, recipient, resolver) => {
  const notification = createNotification({
    type: 'resolution',
    title: `Your Feedback Has Been Resolved`,
    message: `Your feedback "${feedback.title}" has been resolved. ${feedback.resolutionNote ? 'Note: ' + feedback.resolutionNote : ''}`,
    recipient,
    feedback,
    actor: resolver,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    recipient,
    notification.title,
    notification.message,
    { feedbackId: feedback._id.toString(), type: 'resolution' }
  );
  
  return notification;
};

/**
 * P3 — Send response notification to the student.
 * Also sends push notification to mobile app users.
 * @param {object} feedback   Mongoose Feedback document
 * @param {object} recipient  Mongoose User document (student)
 * @param {object} responder  Mongoose User document (staff who responded)
 */
const sendResponseNotification = async (feedback, recipient, responder) => {
  const notification = createNotification({
    type: 'response',
    title: `New Response on Your Feedback`,
    message: `${responder ? responder.name : 'A staff member'} has responded to your feedback "${feedback.title}".`,
    recipient,
    feedback,
    actor: responder,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    recipient,
    notification.title,
    notification.message,
    { feedbackId: feedback._id.toString(), type: 'response' }
  );
  
  return notification;
};

/**
 * Get all notifications for a specific user (by userId string).
 * @param {string} userId
 * @returns {object[]}
 */
const getNotificationsForUser = (userId) => {
  return notifications
    .filter((n) => n.recipientId && n.recipientId.toString() === userId.toString())
    .sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Mark a notification as read.
 * @param {number} notifId
 * @returns {object|null}
 */
const markAsRead = (notifId) => {
  const notif = notifications.find((n) => n.id === notifId);
  if (notif) {
    notif.isRead = true;
    notif.readAt = new Date();
  }
  return notif || null;
};

/**
 * Get unread count for a user.
 * @param {string} userId
 * @returns {number}
 */
const getUnreadCount = (userId) => {
  return notifications.filter(
    (n) =>
      n.recipientId &&
      n.recipientId.toString() === userId.toString() &&
      !n.isRead
  ).length;
};

/**
 * Send notification when a counselor accepts an appointment
 * Also sends push notification to mobile app users
 * @param {object} appointment - CounselingSession document
 * @param {object} student - User document (student)
 * @param {object} counselor - User document (counselor who accepted)
 */
const sendAppointmentAcceptedNotification = async (appointment, student, counselor) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const notification = createNotification({
    type: 'appointment',
    title: 'Appointment Accepted',
    message: `Your counseling appointment for ${appointment.type} on ${appointmentDate} at ${appointment.time} has been accepted by ${counselor.name}.`,
    recipient: student,
    appointment,
    actor: counselor,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    student,
    notification.title,
    notification.message,
    { appointmentId: appointment._id.toString(), type: 'appointment_accepted' }
  );
  
  return notification;
};

/**
 * Send notification when a counselor rejects an appointment
 * Also sends push notification to mobile app users
 * @param {object} appointment - CounselingSession document
 * @param {object} student - User document (student)
 * @param {object} counselor - User document (counselor who rejected)
 * @param {string} reason - Reason for rejection
 */
const sendAppointmentRejectedNotification = async (appointment, student, counselor, reason) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const notification = createNotification({
    type: 'appointment',
    title: 'Appointment Rejected',
    message: `Your counseling appointment for ${appointment.type} on ${appointmentDate} has been rejected by ${counselor.name}. ${reason ? 'Reason: ' + reason : ''}`,
    recipient: student,
    appointment,
    actor: counselor,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    student,
    notification.title,
    notification.message,
    { appointmentId: appointment._id.toString(), type: 'appointment_rejected' }
  );
  
  return notification;
};

/**
 * Send notification when a counselor completes an appointment
 * Also sends push notification to mobile app users
 * @param {object} appointment - CounselingSession document
 * @param {object} student - User document (student)
 * @param {object} counselor - User document (counselor who completed)
 */
const sendAppointmentCompletedNotification = async (appointment, student, counselor) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const notification = createNotification({
    type: 'appointment',
    title: 'Appointment Completed',
    message: `Your counseling appointment for ${appointment.type} on ${appointmentDate} has been marked as completed by ${counselor.name}.`,
    recipient: student,
    appointment,
    actor: counselor,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    student,
    notification.title,
    notification.message,
    { appointmentId: appointment._id.toString(), type: 'appointment_completed' }
  );
  
  return notification;
};

/**
 * Send notification when a counselor reschedules an appointment
 * Also sends push notification to mobile app users
 * @param {object} appointment - CounselingSession document
 * @param {object} student - User document (student)
 * @param {object} counselor - User document (counselor who rescheduled)
 * @param {string} reason - Reason for rescheduling
 */
const sendAppointmentRescheduledNotification = async (appointment, student, counselor, reason) => {
  const oldDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const newDate = appointment.newDate ? new Date(appointment.newDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'TBD';
  
  const notification = createNotification({
    type: 'appointment',
    title: 'Appointment Rescheduled',
    message: `Your counseling appointment for ${appointment.type} originally on ${oldDate} has been rescheduled to ${newDate} at ${appointment.newTime || appointment.time} by ${counselor.name}. ${reason ? 'Reason: ' + reason : ''}`,
    recipient: student,
    appointment,
    actor: counselor,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    student,
    notification.title,
    notification.message,
    { appointmentId: appointment._id.toString(), type: 'appointment_rescheduled' }
  );
  
  return notification;
};

/**
 * Send notification when an appointment is cancelled
 * Also sends push notification to mobile app users
 * @param {object} appointment - CounselingSession document
 * @param {object} recipient - User document (who receives the notification)
 * @param {object} cancelledBy - User document (who cancelled)
 * @param {string} cancelledByRole - Role of the person who cancelled ('student' or 'counselor')
 */
const sendAppointmentCancelledNotification = async (appointment, recipient, cancelledBy, cancelledByRole) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const notification = createNotification({
    type: 'appointment',
    title: 'Appointment Cancelled',
    message: `Your counseling appointment for ${appointment.type} on ${appointmentDate} has been cancelled by the ${cancelledByRole}.`,
    recipient,
    appointment,
    actor: cancelledBy,
  });
  
  // Send push notification to mobile app user
  await notifyUserViaPush(
    recipient,
    notification.title,
    notification.message,
    { appointmentId: appointment._id.toString(), type: 'appointment_cancelled' }
  );
  
  return notification;
};

/**
 * Send notification when feedback is routed to a staff member
 * @param {object} feedback - Feedback document
 * @param {object} recipient - User document (staff member)
 * @param {object} submitter - User document (student who submitted)
 */
const sendFeedbackRoutedNotification = async (feedback, recipient, submitter) => {
  const categoryLabels = {
    course_related: 'Course-Related',
    faculty_wide: 'Faculty-Wide',
    welfare: 'Welfare',
    admission: 'Admission',
    quality: 'Quality',
    mental_health: 'Mental Health',
  };

  const categoryLabel = categoryLabels[feedback.category] || feedback.category;
  const submittedByName = submitter ? submitter.name : 'Anonymous';

  return createNotification({
    type: 'routing',
    title: `New ${categoryLabel} Feedback Assigned`,
    message: `New feedback "${feedback.title}" has been routed to you from ${submittedByName}. Priority: ${feedback.priority}.`,
    recipient,
    feedback,
    actor: null,
  });
};

/**
 * Send notification when feedback is escalated
 * @param {object} feedback - Feedback document
 * @param {object} recipient - User document (escalation target)
 * @param {object} escalatedBy - User document (who escalated)
 */
const sendFeedbackEscalatedNotification = async (feedback, recipient, escalatedBy) => {
  return createNotification({
    type: 'escalation',
    title: `Feedback Escalated - Requires Attention`,
    message: `Feedback "${feedback.title}" has been escalated to you (Level ${feedback.escalationLevel}) by ${escalatedBy ? escalatedBy.name : 'the system'}.`,
    recipient,
    feedback,
    actor: escalatedBy,
  });
};

/**
 * Send notification when feedback is assigned to a specific staff
 * @param {object} feedback - Feedback document
 * @param {object} recipient - User document (assigned staff)
 * @param {object} assignedBy - User document (who assigned)
 */
const sendFeedbackAssignedNotification = async (feedback, recipient, assignedBy) => {
  return createNotification({
    type: 'assignment',
    title: 'Feedback Assigned to You',
    message: `Feedback "${feedback.title}" has been assigned to you. Priority: ${feedback.priority}.`,
    recipient,
    feedback,
    actor: assignedBy,
  });
};

module.exports = {
  sendRoutingNotification,
  sendEscalationNotification,
  sendResolutionNotification,
  sendResponseNotification,
  sendAppointmentAcceptedNotification,
  sendAppointmentRejectedNotification,
  sendAppointmentCompletedNotification,
  sendAppointmentRescheduledNotification,
  sendAppointmentCancelledNotification,
  sendFeedbackRoutedNotification,
  sendFeedbackEscalatedNotification,
  sendFeedbackAssignedNotification,
  getNotificationsForUser,
  markAsRead,
  getUnreadCount,
  sendPushNotification,
  notifyUserViaPush,
};
