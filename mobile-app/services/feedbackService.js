import axios from 'axios'
import cacheService from './cacheService'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const feedbackService = {
  // Get all feedback for the user (students see their own, staff see assigned)
  // Returns paginated response with feedback array
  getFeedback: async (token, params = {}) => {
    try {
      const response = await api.get('/feedback', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      // Return the feedback array from paginated response
      return response.data.feedback || response.data.data || []
    } catch (error) {
      throw error
    }
  },

  // Get all feedback without pagination limit
  getAllFeedback: async (token, params = {}) => {
    try {
      const response = await api.get('/feedback/all', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get feedback submitted by current user (for students)
  getMyFeedback: async (token, params = {}) => {
    try {
      const response = await api.get('/feedback/my', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = response.data.feedback || response.data.data || []
      // Save to cache
      await cacheService.save(cacheService.KEYS.FEEDBACK_LIST, data)
      return data
    } catch (error) {
      // If network error, try to get from cache
      const cachedData = await cacheService.get(cacheService.KEYS.FEEDBACK_LIST)
      if (cachedData) {
        console.log('[FeedbackService] Returning cached data due to network error')
        return cachedData
      }
      throw error
    }
  },

  // Get feedback by ID (includes responses from staff)
  getFeedbackById: async (token, feedbackId) => {
    try {
      const response = await api.get(`/feedback/${feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Submit feedback response (for staff)
  submitResponse: async (token, feedbackId, data) => {
    try {
      const response = await api.post(`/feedback/${feedbackId}/respond`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update feedback status (for staff)
  updateStatus: async (token, feedbackId, status, note = '') => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/status`, { status, note }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Resolve feedback (for staff)
  resolveFeedback: async (token, feedbackId, resolutionNote = '') => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/resolve`, { resolutionNote }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Escalate feedback (for staff)
  escalateFeedback: async (token, feedbackId, reason = '') => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/escalate`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get feedback statistics
  getStats: async (token) => {
    try {
      const response = await api.get('/feedback/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = response.data
      // Save to cache
      await cacheService.save(cacheService.KEYS.STATS, data)
      return data
    } catch (error) {
      // If network error, try to get from cache
      const cachedData = await cacheService.get(cacheService.KEYS.STATS)
      if (cachedData) {
        console.log('[FeedbackService] Returning cached stats due to network error')
        return cachedData
      }
      throw error
    }
  },

  // Submit new feedback
  submitFeedback: async (token, data) => {
    try {
      const response = await api.post('/feedback', data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get notifications for the current user
  getNotifications: async (token) => {
    try {
      const response = await api.get('/feedback/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = response.data
      // Save to cache
      await cacheService.save(cacheService.KEYS.NOTIFICATIONS, data)
      return data
    } catch (error) {
      // If network error, try to get from cache
      const cachedData = await cacheService.get(cacheService.KEYS.NOTIFICATIONS)
      if (cachedData) {
        console.log('[FeedbackService] Returning cached notifications due to network error')
        return cachedData
      }
      throw error
    }
  },

  // Mark a notification as read
  markNotificationRead: async (token, notifId) => {
    try {
      const response = await api.put(`/feedback/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default feedbackService
