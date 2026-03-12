import { useState, useEffect, useCallback } from 'react'
import feedbackService from '../services/feedbackService'
import counselingService from '../services/counselingService'
import { useAuth } from '../context/AuthContext'

/**
 * Custom hook for fetching role-based notifications
 * Fetches from both feedback and counseling APIs to get all notifications
 * @param {number} limit - Maximum number of notifications to fetch
 * @returns {object} - { notifications, unreadCount, loading, error, refetch }
 */
export const useNotifications = (limit = 10) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Get user's role for filtering
  const getUserRole = useCallback(() => {
    if (user?.role) return user.role
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      return localUser.role || ''
    } catch { return '' }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch notifications from both feedback and counseling APIs in parallel
      const [feedbackData, counselingData] = await Promise.allSettled([
        feedbackService.getNotifications(),
        counselingService.getNotifications()
      ])
      
      // Combine notifications from both sources
      let allNotifications = []
      
      // Add feedback notifications
      if (feedbackData.status === 'fulfilled' && feedbackData.value) {
        const feedbackNotifications = Array.isArray(feedbackData.value) 
          ? feedbackData.value 
          : (feedbackData.value.notifications || [])
        allNotifications = [...allNotifications, ...feedbackNotifications.map(n => ({...n, source: 'feedback'}))]
      }
      
      // Add counseling/appointment notifications
      if (counselingData.status === 'fulfilled' && counselingData.value) {
        const counselingNotifications = Array.isArray(counselingData.value) 
          ? counselingData.value 
          : (counselingData.value.notifications || [])
        allNotifications = [...allNotifications, ...counselingNotifications.map(n => ({...n, source: 'counseling'}))]
      }
      
      // Filter notifications based on user role
      const userRole = getUserRole().toLowerCase()
      let filteredNotifications = allNotifications
      
      // Role-based notification filtering
      switch (userRole) {
        case 'student':
          // Students see their own feedback responses and appointment notifications
          filteredNotifications = allNotifications.filter(n => 
            n.type === 'response' || 
            n.type === 'resolution' ||
            n.type === 'appointment' ||
            n.source === 'counseling'
          )
          break
        case 'hod':
        case 'lecturer':
        case 'staff':
          // Department staff - show department-related notifications
          filteredNotifications = filteredNotifications.filter(n => 
            n.type === 'routing' || 
            n.type === 'escalation' ||
            n.type === 'assignment' ||
            n.source === 'feedback'
          )
          break
        case 'dean_faculty':
          // Faculty dean - show faculty-wide notifications
          filteredNotifications = filteredNotifications.filter(n =>
            n.type === 'routing' ||
            n.type === 'escalation' ||
            n.source === 'feedback'
          )
          break
        case 'dean_students':
          // Dean of students - show welfare-related and appointment notifications
          filteredNotifications = filteredNotifications.filter(n =>
            n.type === 'routing' ||
            n.type === 'escalation' ||
            n.type === 'appointment' ||
            n.source === 'feedback' ||
            n.source === 'counseling'
          )
          break
        case 'admin':
        case 'quality_assurance':
          // QA/Admin - show all notifications
          filteredNotifications = allNotifications
          break
        case 'admissions':
          filteredNotifications = filteredNotifications.filter(n =>
            n.type === 'routing' ||
            n.source === 'feedback'
          )
          break
        case 'academic_affairs':
          filteredNotifications = filteredNotifications.filter(n =>
            n.type === 'routing' ||
            n.source === 'feedback'
          )
          break
        case 'counseling':
          // Counselors see appointment-related notifications
          filteredNotifications = filteredNotifications.filter(n =>
            n.type === 'appointment' ||
            n.source === 'counseling'
          )
          break
        default:
          // Show all for other roles
          filteredNotifications = allNotifications
          break
      }

      // Sort by date (newest first) and limit
      const sorted = [...filteredNotifications]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, limit)

      setNotifications(sorted)
      // Count unread based on isRead property (not 'read')
      setUnreadCount(sorted.filter(n => !n.isRead).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [limit, getUserRole])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Try to mark as read in both services
      await Promise.allSettled([
        feedbackService.markNotificationRead(notificationId),
        counselingService.markNotificationRead(notificationId)
      ])
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all as read in both services
      for (const notification of notifications) {
        await Promise.allSettled([
          feedbackService.markNotificationRead(notification.id),
          counselingService.markNotificationRead(notification.id)
        ])
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [notifications])

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}

export default useNotifications
