import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

// Use your server URL - update this with your actual backend URL
let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'

// Dynamically use Expo's host URI or Android bridge ONLY if set to localhost/127.0.0.1
const isLocal = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');

if (__DEV__ && isLocal) {
  if (Constants.expoConfig?.hostUri) {
    const hostIp = Constants.expoConfig.hostUri.split(':')[0]
    API_BASE_URL = `http://${hostIp}:5000/api`
    console.log('[AuthService] Auto-detected Expo Host IP:', hostIp);
  } else if (Platform.OS === 'android') {
    // Standard Android emulator bridge
    API_BASE_URL = 'http://172.23.182.19:5000/api'
    console.log('[AuthService] Using Android Emulator bridge: 172.23.182.19');
  }
}

console.log('[AuthService] API URL in use:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  // Token will be added by the calling code if needed
  return config
}, (error) => {
  return Promise.reject(error)
})

const authService = {
  login: async (identifier, password) => {
    try {
      // identifier can be email or student ID
      const response = await api.post('/auth/login', { identifier, password })
      return response.data
    } catch (error) {
      throw error
    }
  },

  register: async (fullName, email, password) => {
    try {
      // Generate username from email (part before @)
      const username = email.split('@')[0]
      // Use 'student' as the default role for mobile app users
      const response = await api.post('/auth/register', { 
        fullName, 
        email, 
        password, 
        username,
        role: 'student'
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Logout endpoint may not exist, that's ok
    }
  },

  getProfile: async (token) => {
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateProfile: async (token, data) => {
    try {
      const response = await api.put('/auth/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  updatePushToken: async (token, pushToken) => {
    try {
      const response = await api.put('/users/push-token', { pushToken }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  changePassword: async (token, currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}

export default authService
