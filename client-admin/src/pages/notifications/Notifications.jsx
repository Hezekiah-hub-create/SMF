import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import feedbackService from '../../services/feedbackService'
import { useAuth } from '../../context/AuthContext'

// Modern Icons
const Icons = {
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  )
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await feedbackService.getNotifications()
        if (data.notifications) {
          setNotifications(data.notifications)
        } else if (data.data?.notifications) {
          setNotifications(data.data.notifications)
        } else {
          setNotifications([])
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
        setError('Failed to load notifications')
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notifId) => {
    try {
      await feedbackService.markNotificationRead(notifId)
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead)
      for (const notif of unread) {
        await feedbackService.markNotificationRead(notif.id)
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id)
    }
    if (notif.feedbackId) {
      navigate(`/dashboard/feedback/${notif.feedbackId}`)
    }
  }

  const getTypeStyles = (type) => {
    switch (type) {
      case 'routing':
        return { bg: '#dbeafe', color: '#3b82f6', icon: Icons.Send }
      case 'response':
        return { bg: '#e0e7ff', color: '#6366f1', icon: Icons.Mail }
      case 'resolution':
        return { bg: '#d1fae5', color: '#10b981', icon: Icons.CheckCircle }
      case 'escalation':
        return { bg: '#fee2e2', color: '#ef4444', icon: Icons.AlertTriangle }
      default:
        return { bg: '#f1f5f9', color: '#64748b', icon: Icons.Bell }
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  })

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Main Content */}
<div style={{ padding: '32px 32px 32px 32px', maxWidth: '1900px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Notifications</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Stay updated on feedback assigned to you</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#6366f1' }}>{notifications.length}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Notifications</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{unreadCount}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Unread</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{notifications.length - unreadCount}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Read</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: filter === f ? '#6366f1' : '#fff',
                  color: filter === f ? '#fff' : '#64748b',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Icons.Check /> Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <Icons.Bell />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                All Caught Up!
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
              </div>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notif, idx) => {
                const styles = getTypeStyles(notif.type)
                const IconComponent = styles.icon
                return (
                  <div
                    key={notif.id || idx}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '20px 24px',
                      borderBottom: idx < filteredNotifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                      background: notif.isRead ? '#fff' : '#fafbfc',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = notif.isRead ? '#fff' : '#fafbfc'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: styles.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: styles.color,
                      flexShrink: 0
                    }}>
                      <IconComponent />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: notif.isRead ? '500' : '600', 
                          color: '#1e293b',
                          flex: 1
                        }}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#6366f1',
                            flexShrink: 0
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '6px', lineHeight: '1.5' }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icons.Clock />
                        {formatTime(notif.createdAt)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ color: '#cbd5e1', flexShrink: 0, alignSelf: 'center' }}>
                      <Icons.ArrowRight />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
