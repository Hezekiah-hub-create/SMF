import { useState, useEffect, useCallback } from 'react';
import feedbackService from '../services/feedbackService';
import counselingService from '../services/counselingService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for polling unread notification count
 * Used to display badge on notifications tab
 * @returns {object} - { unreadCount, loading, error, refetch }
 */
export const useUnreadNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      setError(null);
      
      // Fetch notifications - both feedback and counseling use the same notification service
      // so we only need to fetch from one source to avoid duplicates
      const feedbackData = await feedbackService.getNotifications(token);
      
      let totalUnread = 0;
      
      // Count unread from feedback notifications
      if (feedbackData && feedbackData.notifications) {
        const feedbackNotifs = feedbackData.notifications;
        totalUnread = feedbackNotifs.filter(n => !n.isRead).length;
      }
      
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      setError(err.message);
      // Don't reset count on error, keep existing
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount
  };
};

export default useUnreadNotificationCount;

