/**
 * User Service — Client Admin
 *
 * All API calls for user management operations.
 * Uses the stored JWT token from localStorage for authentication.
 */

const API_BASE = '/api/users';

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

const userService = {
  // ── GET — All Users ─────────────────────────────────────────────
  /**
   * Get all users with optional filters.
   * @param {object} [params] - { role?, department?, isActive?, page?, limit? }
   */
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const res = await fetch(`${API_BASE}${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET — Users by Role ─────────────────────────────────────────
  /**
   * Get users grouped by role (for dropdowns).
   */
  getUsersByRole: async () => {
    const res = await fetch(`${API_BASE}/by-role`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── GET — Single User ──────────────────────────────────────────
  /**
   * Get a single user by ID.
   * @param {string} id - User ID
   */
  getUserById: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── POST — Create User ─────────────────────────────────────────
  /**
   * Create a new user.
   * @param {object} userData - { name, email, password, role, department?, faculty? }
   */
  createUser: async (userData) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  // ── PUT — Update User ─────────────────────────────────────────
  /**
   * Update user details.
   * @param {string} id - User ID
   * @param {object} userData - { name?, email?, role?, department?, faculty? }
   */
  updateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  // ── PUT — Toggle User Status ──────────────────────────────────
  /**
   * Activate or deactivate a user.
   * @param {string} id - User ID
   */
  toggleUserStatus: async (id) => {
    const res = await fetch(`${API_BASE}/${id}/toggle-status`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── PUT — Reset Password ──────────────────────────────────────
  /**
   * Reset a user's password.
   * @param {string} id - User ID
   */
  resetPassword: async (id) => {
    const res = await fetch(`${API_BASE}/${id}/reset-password`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ── DELETE — Delete User ───────────────────────────────────────
  /**
   * Delete a user.
   * @param {string} id - User ID
   */
  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};

export default userService;
