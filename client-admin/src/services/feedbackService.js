/**
 * Feedback Service — Client Admin
 *
 * All API calls for the feedback management flow (DFD P1–P5).
 * Uses the stored JWT token from localStorage for authentication.
 */

const API_BASE = '/api/feedback';

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

const feedbackService = {
  // ── P1 — Submit Feedback (triggers P2 auto-routing) ─────────────
  /**
   * Submit new feedback.
   * @param {object} payload - { title, description, category, isAnonymous, department?, faculty? }
   */
  submitFeedback: async (payload) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── GET — List Feedback (role-filtered) ──────────────────────────
  /**
   * Get all feedback visible to the current user (role-filtered by server).
   * Returns paginated response with feedback array.
   * @param {object} [params] - { status?, category?, priority?, page?, limit? }
   */
  getFeedback: async (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const res = await fetch(`${API_BASE}${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    const data = await handleResponse(res);
    // Return the feedback array from paginated response
    return data.feedback || data.data || [];
  },

  // ── GET — All Feedback (no pagination limit) ─────────────────────
  /**
   * Get ALL feedback visible to the current user without pagination limits.
   * Useful for exports and detailed analysis.
   * @param {object} [params] - { status?, category?, priority? }
   */
  getAllFeedback: async (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const res = await fetch(`${API_BASE}/all${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET — My Feedback (students see only their own) ──────────────
  /**
   * Get feedback submitted by the current user (for students).
   * @param {object} [params] - { status?, category?, priority?, page?, limit? }
   */
  getMyFeedback: async (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const res = await fetch(`${API_BASE}/my${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    const data = await handleResponse(res);
    return data.feedback || data.data || [];
  },

  // ── GET — Single Feedback ─────────────────────────────────────────
  /**
   * Get a single feedback item with all responses.
   * @param {string} id - Feedback ID
   */
  getFeedbackById: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET — Stats ───────────────────────────────────────────────────
  /**
   * Get feedback statistics for the current user's scope.
   */
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── P3 — Respond to Feedback ──────────────────────────────────────
  /**
   * Add a response to a feedback item.
   * @param {string} id - Feedback ID
   * @param {object} payload - { message, isInternal? }
   */
  respondToFeedback: async (id, payload) => {
    const res = await fetch(`${API_BASE}/${id}/respond`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── P4 — Resolve Feedback ─────────────────────────────────────────
  /**
   * Mark feedback as resolved.
   * @param {string} id - Feedback ID
   * @param {object} [payload] - { resolutionNote? }
   */
  resolveFeedback: async (id, payload = {}) => {
    const res = await fetch(`${API_BASE}/${id}/resolve`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── P5 — Escalate Feedback ────────────────────────────────────────
  /**
   * Escalate unresolved feedback to the next level.
   * @param {string} id - Feedback ID
   * @param {object} [payload] - { note? }
   */
  escalateFeedback: async (id, payload = {}) => {
    const res = await fetch(`${API_BASE}/${id}/escalate`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── Update Status ─────────────────────────────────────────────────
  /**
   * Update feedback status.
   * @param {string} id - Feedback ID
   * @param {object} payload - { status, note? }
   */
  updateStatus: async (id, payload) => {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── Delete Feedback (admin only) ──────────────────────────────────
  /**
   * Delete a feedback item.
   * @param {string} id - Feedback ID
   */
  deleteFeedback: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── Notifications ─────────────────────────────────────────────────
  /**
   * Get notifications for the current user.
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

export default feedbackService;
