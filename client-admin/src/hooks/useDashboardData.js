import { useState, useEffect } from 'react'
import analyticsService from '../services/analyticsService'
import feedbackService from '../services/feedbackService'

/**
 * Custom hook for fetching dashboard data
 * @param {object} options - Configuration options
 * @param {number} options.limit - Limit for feedback items (default: 100)
 * @returns {object} Loading state, stats, and feedback list
 */
export const useDashboardData = (options = {}) => {
  const { limit = 100 } = options
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [feedbackList, setFeedbackList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, feedbackData] = await Promise.all([
          analyticsService.getDashboardStats(),
          feedbackService.getFeedback({ limit })
        ])
        setStats(statsData)
        setFeedbackList(Array.isArray(feedbackData) ? feedbackData : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setFeedbackList([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [limit])

  return { loading, stats, feedbackList }
}

export default useDashboardData
