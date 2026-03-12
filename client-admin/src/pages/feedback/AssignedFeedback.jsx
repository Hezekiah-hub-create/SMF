import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatsCard, DashboardHeader } from '../../components/dashboard/DashboardComponents'
import analyticsService from '../../services/analyticsService'
import feedbackService from '../../services/feedbackService'
import { useAuth } from '../../context/AuthContext'

const AssignedFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  // Get user info
  const getUserInfo = () => {
    if (user) {
      return { 
        name: user.name || 'User',
        role: user.role || 'staff',
        department: user.department || null
      }
    }
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      return { 
        name: localUser.name || 'User',
        role: localUser.role || 'staff',
        department: localUser.department || null
      }
    } catch { return { name: 'User', role: 'staff', department: null } }
  }

  const userInfo = getUserInfo()

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true)
        const data = await feedbackService.getFeedback({ limit: 100 })
        setFeedbackList(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch feedback:', error)
        setFeedbackList([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [])

  // Filter feedback based on role and filter selection
  const filteredFeedback = useMemo(() => {
    if (!Array.isArray(feedbackList)) return []
    
    let result = feedbackList

    // Apply search filter
    if (searchTerm) {
      result = result.filter(fb => 
        fb.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(fb => fb.status === filter)
    }

    return result
  }, [feedbackList, filter, searchTerm])

  // Get stats based on filtered feedback
  const stats = useMemo(() => {
    if (!Array.isArray(feedbackList)) {
      return { total: 0, pending: 0, inProgress: 0, resolved: 0 }
    }
    return {
      total: feedbackList.length,
      pending: feedbackList.filter(fb => fb.status === 'pending').length,
      inProgress: feedbackList.filter(fb => fb.status === 'in_progress').length,
      resolved: feedbackList.filter(fb => fb.status === 'resolved').length
    }
  }, [feedbackList])

  const handleViewDetail = (id) => {
    navigate(`/dashboard/feedback/${id}`)
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { bg: '#fee2e2', color: '#dc2626' }
      case 'medium': return { bg: '#fef3c7', color: '#d97706' }
      case 'low': return { bg: '#dcfce7', color: '#16a34a' }
      default: return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return { bg: '#dcfce7', color: '#16a34a' }
      case 'in_progress': return { bg: '#dbeafe', color: '#2563eb' }
      case 'pending': return { bg: '#fef3c7', color: '#d97706' }
      case 'escalated': return { bg: '#fecaca', color: '#dc2626' }
      default: return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <DashboardHeader 
        title="Assigned Feedback" 
        subtitle="View and manage feedback assigned to you"
      />

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Feedback</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pending</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>{stats.pending}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>In Progress</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats.inProgress}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Resolved</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid #e6e9ee',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '250px',
            outline: 'none'
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid #e6e9ee',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e6e9ee', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : filteredFeedback.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No feedback found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e6e9ee' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Title</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Category</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Priority</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.map((item, idx) => {
                const priorityColors = getPriorityColor(item.priority)
                const statusColors = getStatusColor(item.status)
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                      <div style={{ fontWeight: '500' }}>{item.title || 'Untitled'}</div>
                      {item.description && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{item.category || 'General'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        background: priorityColors.bg, 
                        color: priorityColors.color, 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {item.priority || 'Normal'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        background: statusColors.bg, 
                        color: statusColors.color, 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {item.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button 
                        onClick={() => handleViewDetail(item._id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#4169e1', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          padding: '4px 8px'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AssignedFeedback
