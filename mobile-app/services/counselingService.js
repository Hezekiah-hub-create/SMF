import axios from 'axios'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const counselingService = {
  // Get all available counselors
  getCounselors: async (token) => {
    try {
      const response = await api.get('/counseling/counselors', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch counselors:', error)
      throw error
    }
  },

  // Get student's counseling appointments (or counselor's assigned appointments)
  getAppointments: async (token) => {
    try {
      const response = await api.get('/counseling/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      throw error
    }
  },

  // Book a counseling appointment
  bookAppointment: async (token, data) => {
    try {
      const response = await api.post('/counseling/appointments', data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Accept an appointment (counselor only)
  acceptAppointment: async (token, appointmentId) => {
    try {
      const response = await api.put(`/counseling/appointments/${appointmentId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Reject an appointment (counselor only)
  rejectAppointment: async (token, appointmentId, reason) => {
    try {
      const response = await api.put(`/counseling/appointments/${appointmentId}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Reschedule an appointment (counselor only)
  rescheduleAppointment: async (token, appointmentId, newDate, newTime, reason) => {
    try {
      const response = await api.put(`/counseling/appointments/${appointmentId}/reschedule`, { 
        newDate, 
        newTime, 
        reason 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Cancel an appointment
  cancelAppointment: async (token, appointmentId) => {
    try {
      const response = await api.delete(`/counseling/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get mental health resources
  getResources: async (token) => {
    try {
      const response = await api.get('/counseling/resources', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      throw error
    }
  },

  // Get counseling statistics
  getStats: async (token) => {
    try {
      const response = await api.get('/counseling/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch counseling stats:', error)
      throw error
    }
  },

  // Get crisis helpline contacts
  getCrisisContacts: async (token) => {
    try {
      const response = await api.get('/counseling/crisis-contacts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch crisis contacts:', error)
      throw error
    }
  },

  // Get notifications for the current user (appointments)
  getNotifications: async (token) => {
    try {
      const response = await api.get('/counseling/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  },

  // Mark a notification as read
  markNotificationRead: async (token, notifId) => {
    try {
      const response = await api.put(`/counseling/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }
}

export default counselingService

