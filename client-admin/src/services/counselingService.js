/**
 * Counseling Service — Client Admin
 *
 * All API calls for the counseling/appointments management.
 * Uses the stored JWT token from localStorage for authentication.
 */

const API_BASE = '/api/counseling';

// ── Helper: parse JSON safely ─────────────────────────────────────
const parseJSON = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

// ── Helper: build auth headers ────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// ── Helper: throw on non-OK response ─────────────────────────────
const handleResponse = async (res) => {
  const data = await parseJSON(res);
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

const counselingService = {
  // ── GET all appointments ────────────────────────────────────────
  /**
   * Get all appointments visible to the current user.
   * Returns all appointments for admin/dean_students/counseling roles.
   */
  getAppointments: async () => {
    const res = await fetch(`${API_BASE}/appointments`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET counselors ────────────────────────────────────────────
  /**
   * Get all available counselors.
   */
  getCounselors: async () => {
    const res = await fetch(`${API_BASE}/counselors`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── POST book appointment ──────────────────────────────────────
  /**
   * Book a new counseling appointment.
   * @param {object} payload - { counselorId, counselorName, date, time, type, notes }
   */
  bookAppointment: async (payload) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── PUT accept appointment ─────────────────────────────────────
  /**
   * Accept a pending appointment (counselor only).
   * @param {string} appointmentId
   */
  acceptAppointment: async (appointmentId) => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/accept`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── PUT reject appointment ─────────────────────────────────────
  /**
   * Reject a pending appointment (counselor only).
   * @param {string} appointmentId
   * @param {object} payload - { reason }
   */
  rejectAppointment: async (appointmentId, payload) => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/reject`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── PUT complete appointment ─────────────────────────────────────
  /**
   * Mark an appointment as completed (counselor only).
   * @param {string} appointmentId
   * @param {object} payload - { counselorNotes }
   */
  completeAppointment: async (appointmentId, payload = {}) => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── PUT reschedule appointment ────────────────────────────────
  /**
   * Reschedule an appointment (counselor only).
   * @param {string} appointmentId
   * @param {object} payload - { newDate, newTime, reason }
   */
  rescheduleAppointment: async (appointmentId, payload) => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── DELETE cancel appointment ───────────────────────────────────
  /**
   * Cancel an appointment (student or counselor).
   * @param {string} appointmentId
   */
  cancelAppointment: async (appointmentId) => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET resources ──────────────────────────────────────────────
  /**
   * Get mental health resources.
   */
  getResources: async () => {
    const res = await fetch(`${API_BASE}/resources`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET stats ─────────────────────────────────────────────────
  /**
   * Get counseling statistics.
   */
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET crisis contacts ─────────────────────────────────────────
  /**
   * Get crisis contacts.
   */
  getCrisisContacts: async () => {
    const res = await fetch(`${API_BASE}/crisis-contacts`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── Notifications ───────────────────────────────────────────────
  /**
   * Get notifications for the current user (appointments + feedback).
   */
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Mark a notification as read.
   * @param {number} notifId
   */
  markNotificationRead: async (notifId) => {
    const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};

export default counselingService

