const { CounselingSession, CounselingResource, CrisisContact } = require('../models/Counseling');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Helper to create notification using the existing notification service
const createNotification = async (userId, title, message, type) => {
  try {
    // Get the user document for the recipient
    const recipient = await User.findById(userId);
    if (recipient) {
      // Create in-memory notification
      notificationService.createNotification({
        type: type || 'counseling',
        title,
        message,
        recipient,
        feedback: null,
        actor: null,
      });
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// ─────────────────────────────────────────────────────────────────
// GET notifications for current user (combines feedback + appointment)
// ─────────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get notifications from the notification service
    const notifications = notificationService.getNotificationsForUser(userId);
    const unreadCount = notificationService.getUnreadCount(userId);
    
    res.json({ 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT mark notification as read
// ─────────────────────────────────────────────────────────────────
const markNotificationRead = async (req, res) => {
  try {
    const { notifId } = req.params;
    
    const notif = notificationService.markAsRead(parseInt(notifId));
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification: notif });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET all counselors (users with role 'counseling')
// ─────────────────────────────────────────────────────────────────
const getCounselors = async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counseling', isActive: true })
      .select('name email position department faculty');
    
    const counselorsData = counselors.map(c => ({
      id: c._id,
      name: c.name,
      title: c.position || 'Counselor',
      specialization: 'General Counseling',
      availability: 'Mon-Fri, 9am–5pm',
      rating: 4.8,
      avatar: c.profilePicture,
      bio: 'Professional counselor dedicated to student mental wellness.',
    }));

    res.json({ counselors: counselorsData });
  } catch (error) {
    console.error('getCounselors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET appointments (for students and counselors)
// ─────────────────────────────────────────────────────────────────
const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let appointments;
    
    // If user is admin or dean_students, get ALL appointments
    if (userRole === 'admin' || userRole === 'dean_students') {
      appointments = await CounselingSession.find()
        .populate('student', 'name email')
        .populate('counselor', 'name position')
        .sort({ date: -1 });
    }
    // If user is a counselor, get appointments assigned to them
    else if (userRole === 'counseling') {
      appointments = await CounselingSession.find({ counselor: userId })
        .populate('student', 'name email')
        .sort({ date: -1 });
    } else {
      // Students see their own appointments
      appointments = await CounselingSession.find({ student: userId })
        .populate('counselor', 'name position')
        .sort({ date: -1 });
    }

    const appointmentsData = appointments.map(a => ({
      id: a._id,
      studentId: a.student?._id || a.student,
      studentName: a.student?.name,
      counselorId: a.counselor?._id || a.counselor,
      counselorName: a.counselor?.name || a.counselor,
      date: a.date.toISOString(),
      time: a.time,
      status: a.status,
      appointmentStatus: a.appointmentStatus || 'pending',
      type: a.type,
      notes: a.notes,
      counselorNotes: a.counselorNotes || '',
      newDate: a.newDate ? a.newDate.toISOString() : null,
      newTime: a.newTime || null,
      createdAt: a.createdAt.toISOString(),
    }));

    res.json({ appointments: appointmentsData });
  } catch (error) {
    console.error('getAppointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST book appointment
// ─────────────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const { counselorId, counselorName, date, time, type, notes } = req.body;
    const studentId = req.user._id;
    const studentName = req.user.name;

    if (!counselorId || !date || !time || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const appointment = await CounselingSession.create({
      student: studentId,
      counselor: counselorId,
      date: new Date(date),
      time,
      type,
      notes: notes || '',
      status: 'upcoming',
      appointmentStatus: 'pending', // pending, accepted, rejected, rescheduled
    });

    // Notify the counselor about new booking
    await createNotification(
      counselorId,
      'New Counseling Session Request',
      `${studentName} has requested a counseling session on ${new Date(date).toLocaleDateString()} at ${time}`,
      'counseling'
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        counselorName,
        date: appointment.date.toISOString(),
        time: appointment.time,
        status: appointment.status,
        appointmentStatus: appointment.appointmentStatus,
        type: appointment.type,
        notes: appointment.notes,
      },
    });
  } catch (error) {
    console.error('bookAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT accept appointment (counselor)
// ─────────────────────────────────────────────────────────────────
const acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const counselorId = req.user._id;
    const counselor = req.user;

    const appointment = await CounselingSession.findOne({
      _id: appointmentId,
      counselor: counselorId,
    }).populate('student', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.appointmentStatus !== 'pending') {
      return res.status(400).json({ message: 'Appointment has already been processed' });
    }

    appointment.appointmentStatus = 'accepted';
    await appointment.save();

    // Notify student with rich notification
    await notificationService.sendAppointmentAcceptedNotification(
      appointment,
      appointment.student,
      counselor
    );

    res.json({
      message: 'Appointment accepted successfully',
      appointment: {
        id: appointment._id,
        appointmentStatus: appointment.appointmentStatus,
      },
    });
  } catch (error) {
    console.error('acceptAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT reject appointment (counselor)
// ─────────────────────────────────────────────────────────────────
const rejectAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const counselorId = req.user._id;
    const counselor = req.user;

    const appointment = await CounselingSession.findOne({
      _id: appointmentId,
      counselor: counselorId,
    }).populate('student', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.appointmentStatus !== 'pending') {
      return res.status(400).json({ message: 'Appointment has already been processed' });
    }

    appointment.appointmentStatus = 'rejected';
    appointment.counselorNotes = reason || 'Session rejected';
    await appointment.save();

    // Notify student with rich notification
    await notificationService.sendAppointmentRejectedNotification(
      appointment,
      appointment.student,
      counselor,
      reason
    );

    res.json({
      message: 'Appointment rejected successfully',
      appointment: {
        id: appointment._id,
        appointmentStatus: appointment.appointmentStatus,
      },
    });
  } catch (error) {
    console.error('rejectAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT complete appointment (counselor)
// ─────────────────────────────────────────────────────────────────
const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { counselorNotes } = req.body;
    const counselorId = req.user._id;
    const counselor = req.user;

    const appointment = await CounselingSession.findOne({
      _id: appointmentId,
      counselor: counselorId,
    }).populate('student', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.appointmentStatus !== 'accepted') {
      return res.status(400).json({ message: 'Can only complete accepted appointments' });
    }

    appointment.status = 'completed';
    appointment.appointmentStatus = 'completed';
    appointment.counselorNotes = counselorNotes || '';
    await appointment.save();

    // Notify student with rich notification
    await notificationService.sendAppointmentCompletedNotification(
      appointment,
      appointment.student,
      counselor
    );

    res.json({
      message: 'Appointment completed successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        appointmentStatus: appointment.appointmentStatus,
      },
    });
  } catch (error) {
    console.error('completeAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT reschedule appointment (counselor)
// ─────────────────────────────────────────────────────────────────
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newTime, reason } = req.body;
    const counselorId = req.user._id;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'New date and time are required' });
    }

    const appointment = await CounselingSession.findOne({
      _id: appointmentId,
      counselor: counselorId,
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.appointmentStatus !== 'pending') {
      return res.status(400).json({ message: 'Appointment has already been processed' });
    }

    appointment.appointmentStatus = 'rescheduled';
    appointment.newDate = new Date(newDate);
    appointment.newTime = newTime;
    appointment.counselorNotes = reason || 'Session has been rescheduled';
    await appointment.save();

    // Notify student
    await createNotification(
      appointment.student,
      'Counseling Session Rescheduled',
      `Your counseling session has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}. ${reason || ''}`,
      'counseling'
    );

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment: {
        id: appointment._id,
        appointmentStatus: appointment.appointmentStatus,
        newDate: appointment.newDate.toISOString(),
        newTime: appointment.newTime,
      },
    });
  } catch (error) {
    console.error('rescheduleAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE cancel appointment
// ─────────────────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    const appointment = await CounselingSession.findOne({
      _id: appointmentId,
      $or: [{ student: userId }, { counselor: userId }],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'upcoming') {
      return res.status(400).json({ message: 'Can only cancel upcoming appointments' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Notify the other party
    const notifyUserId = userId.toString() === appointment.student.toString() 
      ? appointment.counselor 
      : appointment.student;
    
    const cancelledBy = userId.toString() === appointment.student.toString() ? 'student' : 'counselor';
    
    await createNotification(
      notifyUserId,
      'Counseling Session Cancelled',
      `The counseling session scheduled for ${appointment.date.toLocaleDateString()} has been cancelled by the ${cancelledBy}.`,
      'counseling'
    );

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('cancelAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET mental health resources
// ─────────────────────────────────────────────────────────────────
const getResources = async (req, res) => {
  try {
    const resources = await CounselingResource.find({ isActive: true })
      .sort({ createdAt: -1 });

    const resourcesData = resources.map(r => ({
      id: r._id,
      title: r.title,
      type: r.type,
      category: r.category,
      url: r.url,
      icon: r.icon,
    }));

    res.json({ resources: resourcesData });
  } catch (error) {
    console.error('getResources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET counseling statistics
// ─────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let totalSessions, upcomingSessions, completedSessions;

    if (userRole === 'counseling') {
      // For counselors, show stats about their sessions
      totalSessions = await CounselingSession.countDocuments({ counselor: userId });
      upcomingSessions = await CounselingSession.countDocuments({ counselor: userId, status: 'upcoming', appointmentStatus: 'accepted' });
      completedSessions = await CounselingSession.countDocuments({ counselor: userId, status: 'completed' });
    } else {
      // For students
      totalSessions = await CounselingSession.countDocuments({ student: userId });
      upcomingSessions = await CounselingSession.countDocuments({ student: userId, status: 'upcoming' });
      completedSessions = await CounselingSession.countDocuments({ student: userId, status: 'completed' });
    }

    const totalHours = completedSessions;

    res.json({
      totalSessions,
      upcomingSessions,
      completedSessions,
      totalHours,
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET crisis contacts
// ─────────────────────────────────────────────────────────────────
const getCrisisContacts = async (req, res) => {
  try {
    const contacts = await CrisisContact.find({ isActive: true });

    const contactsData = contacts.map(c => ({
      id: c._id,
      name: c.name,
      phone: c.phone,
      available: c.availability,
      description: c.description,
    }));

    // If no contacts in DB, return default contacts
    if (contactsData.length === 0) {
      return res.json({
        contacts: [
          {
            id: 1,
            name: 'Campus Counseling Center',
            phone: '1-800-CAMPUS-1',
            available: '24/7',
            description: 'Immediate support for students in crisis',
          },
          {
            id: 2,
            name: 'National Crisis Helpline',
            phone: '988',
            available: '24/7',
            description: 'Suicide and crisis lifeline',
          },
          {
            id: 3,
            name: 'Campus Security',
            phone: '555-CAMPUS',
            available: '24/7',
            description: 'Emergency response and safety',
          },
        ],
      });
    }

    res.json({ contacts: contactsData });
  } catch (error) {
    console.error('getCrisisContacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};

