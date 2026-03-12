import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'

if (__DEV__ && API_BASE_URL.includes('localhost')) {
  if (Constants.expoConfig?.hostUri) {
    const hostIp = Constants.expoConfig.hostUri.split(':')[0]
    API_BASE_URL = `http://${hostIp}:5000/api`
  } else if (Platform.OS === 'android') {
    API_BASE_URL = 'http://172.23.182.19:5000/api'
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const chatbotService = {
  /**
   * Send a message to the chatbot
   * @param {string} token - Auth token
   * @param {string} message - User message
   * @param {object} context - Optional context (e.g., feedback submission flow)
   */
  sendMessage: async (token, message, context = {}) => {
    try {
      const response = await api.post('/chatbot/message', 
        { message, context },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get quick action options from API
   * @param {string} token - Auth token
   */
  getQuickActions: async (token) => {
    try {
      const response = await api.get('/chatbot/quick-actions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      // Return default quick actions on error
      return { 
        quickActions: [
          { id: 'submit', label: '📝 Submit Feedback', description: 'Create new feedback' },
          { id: 'status', label: '🔍 Check Status', description: 'View your feedback status' },
          { id: 'faq', label: '❓ FAQ', description: 'Common questions & answers' },
        ]
      }
    }
  },

  /**
   * Get user's feedback status summary
   * @param {string} token - Auth token
   */
  getFeedbackStatus: async (token) => {
    try {
      const response = await api.get('/chatbot/feedback-status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Start feedback submission flow
   * @param {string} token - Auth token
   */
  startFeedbackSubmit: async (token) => {
    try {
      const response = await api.post('/chatbot/start-submit', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Submit feedback through chatbot flow
   * @param {string} token - Auth token
   * @param {object} data - Feedback data
   */
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
}

export default chatbotService

