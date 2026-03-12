const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCounselors,
  getAppointments,
  bookAppointment,
  acceptAppointment,
  rejectAppointment,
  completeAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getResources,
  getStats,
  getCrisisContacts,
  getNotifications,
  markNotificationRead,
} = require('../controllers/counselingController');

// All routes require authentication
router.use(protect);

// Counseling routes
router.get('/counselors', getCounselors);
router.get('/appointments', getAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:appointmentId/accept', acceptAppointment);
router.put('/appointments/:appointmentId/reject', rejectAppointment);
router.put('/appointments/:appointmentId/complete', completeAppointment);
router.put('/appointments/:appointmentId/reschedule', rescheduleAppointment);
router.delete('/appointments/:appointmentId', cancelAppointment);
router.get('/resources', getResources);
router.get('/stats', getStats);
router.get('/crisis-contacts', getCrisisContacts);

// Notification routes for counseling appointments
router.get('/notifications', getNotifications);
router.put('/notifications/:notifId/read', markNotificationRead);

module.exports = router;

