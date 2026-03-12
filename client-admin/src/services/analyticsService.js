/**
 * Analytics Service — Client Admin
 *
 * All API calls for dashboard analytics and reports.
 * Uses the stored JWT token from localStorage for authentication.
 */

const API_BASE = '/api/analytics';

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

const analyticsService = {
  // ── Dashboard Stats ─────────────────────────────────────────────
  /**
   * Get role-scoped dashboard analytics summary.
   * Returns: { total, new, routed, inProgress, resolved, escalated, closed, resolutionRate, avgResolutionHours, thisMonth, byStatus, byCategory, byPriority }
   */
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── Reports ─────────────────────────────────────────────────────
  /**
   * Get detailed trend & breakdown reports.
   * @param {object} params - { from?, to?, groupBy? }
   */
  getReports: async (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const res = await fetch(`${API_BASE}/reports${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── Feedback Stats ─────────────────────────────────────────────
  /**
   * Get feedback statistics summary for widgets.
   * Returns: { total, new, inProgress, resolved, escalated, resolutionRate }
   */
  getFeedbackStats: async () => {
    const res = await fetch(`${API_BASE}/feedback-stats`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── System Overview (admin/QA only) ────────────────────────────
  /**
   * Get system-wide overview metrics.
   * Returns: { users: { total, active }, feedback: { total, resolved, escalated, resolutionRate }, feedbackByRole, recentActivity }
   */
  getSystemOverview: async () => {
    const res = await fetch(`${API_BASE}/system`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── Routing Rules (admin only) ─────────────────────────────────
  /**
   * Get routing rules configuration.
   * Returns: { rules: [...] }
   */
  getRoutingRules: async () => {
    const res = await fetch(`${API_BASE}/routing-rules`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Update routing rules configuration.
   * @param {Array} rules - Array of routing rule objects
   * Returns: { message, rules: [...] }
   */
  updateRoutingRules: async (rules) => {
    const res = await fetch(`${API_BASE}/routing-rules`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ rules }),
    });
    return handleResponse(res);
  },

  // ── System Logs (admin only) ────────────────────────────────────
  /**
   * Get system logs with filters.
   * @param {object} params - { page?, limit?, action?, resourceType?, severity?, userId?, from?, to?, search? }
   * Returns: { logs: [...], pagination: {...}, stats: {...} }
   */
  getSystemLogs: async (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const res = await fetch(`${API_BASE}/system-logs${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── Organizational Structure (admin/QA only) ─────────────────
  /**
   * Get faculties, departments, HODs and lecturers.
   * Returns: { summary: { totalFaculties, totalDepartments, totalHODs, totalLecturers }, faculties: [...], hods: [...], lecturers: [...] }
   */
  getOrganizationalStructure: async () => {
    const res = await fetch(`${API_BASE}/organizational-structure`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};

export default analyticsService;
