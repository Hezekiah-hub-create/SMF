import React, { createContext, useState, useEffect, useContext } from 'react'
import * as SecureStore from 'expo-secure-store'
import authService from '../services/authService'
import { useNotifications } from '../hooks/useNotifications'
import cacheService from '../services/cacheService'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { expoPushToken } = useNotifications()

  // Register push token whenever we have both a token and an expoPushToken
  useEffect(() => {
    if (token && expoPushToken) {
      authService.updatePushToken(token, expoPushToken)
        .catch(err => console.error('[AuthContext] Failed to update push token:', err))
    }
  }, [token, expoPushToken])

  // Initialize auth on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token')
        if (storedToken) {
          setToken(storedToken)
          // Validate token and fetch user profile
          try {
            const userProfile = await authService.getProfile(storedToken)
            setUser(userProfile)
          } catch (err) {
            // Token invalid, clear it
            await SecureStore.deleteItemAsync('token')
            setToken(null)
            setUser(null)
          }
        }
      } catch (e) {
        // Ignore errors on initial load
      } finally {
        setIsLoading(false)
      }
    }

    bootstrapAsync()
  }, [])

  const authContext = {
    user,
    token,
    isLoading,
    expoPushToken,
    login: async (identifier, password, rememberMe = false) => {
      try {
        const response = await authService.login(identifier, password)
        const { token: loginToken, user: loginUser } = response
        
        // Store token securely (always store for mobile app)
        await SecureStore.setItemAsync('token', loginToken)
        setToken(loginToken)

        // Fetch full profile (includes feedbackCount, resolvedCount, populated dept/faculty)
        let fullUser = loginUser
        try {
          fullUser = await authService.getProfile(loginToken)
        } catch (_) {
          // Fall back to login response user if profile fetch fails
        }

        setUser(fullUser)
        return { success: true, user: fullUser }
      } catch (error) {
        return { 
          success: false, 
          error: error?.response?.data?.message || 'Login failed' 
        }
      }
    },
    register: async (fullName, email, password) => {
      try {
        const response = await authService.register(fullName, email, password)
        const { token: regToken, user: regUser } = response
        
        await SecureStore.setItemAsync('token', regToken)
        setToken(regToken)
        setUser(regUser)
        return { success: true, user: regUser }
      } catch (error) {
        return { 
          success: false, 
          error: error?.response?.data?.message || 'Registration failed' 
        }
      }
    },
    logout: async () => {
      try {
        await authService.logout()
      } catch (err) {
        // Ignore logout errors
      }
      await SecureStore.deleteItemAsync('token')
      await cacheService.clearAll()
      setToken(null)
      setUser(null)
    },
  }

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
