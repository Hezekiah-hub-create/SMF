import React, { useState, useEffect, useMemo } from 'react'
import counselingService from '../../services/counselingService'
import { useAuth } from '../../context/AuthContext'

// Icons
const Icons = {
  Calendar: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  User: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  CheckCircle: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  AlertCircle: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  RefreshCw: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Heart: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Check: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  X: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  List: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  LayoutGrid: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Plus: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Filter: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  TrendingUp: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendingDown: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  FileText: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Users: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Briefcase: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
}

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const isDeanStudents = user?.role === 'dean_students'
  const isCounselor = user?.role === 'counseling'
  const isStudent = !isAdmin && !isDeanStudents && !isCounselor

  // Get user display info
  const getUserDisplayInfo = () => {
    if (isCounselor) {
      return {
        label: 'Your Appointments',
        subtitle: `Viewing appointments assigned to ${user?.name || 'you'}`,
        badge: 'Counselor'
      }
    }
    if (isAdmin) {
      return {
        label: 'All Appointments',
        subtitle: 'Viewing all counseling appointments in the system',
        badge: 'Administrator'
      }
    }
    if (isDeanStudents) {
      return {
        label: 'Student Welfare Appointments',
        subtitle: 'Viewing all student counseling appointments',
        badge: 'Dean of Students'
      }
    }
    return {
      label: 'My Appointments',
      subtitle: 'Viewing your counseling appointments',
      badge: 'Student'
    }
  }

  const userInfo = getUserDisplayInfo()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await counselingService.getAppointments()
      setAppointments(response.appointments || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
      setError('Failed to load appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments based on status and search query
  const filteredAppointments = useMemo(() => {
    let filtered = appointments
    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.appointmentStatus === filter || apt.status === filter)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt => 
        (apt.studentName || '').toLowerCase().includes(query) ||
        (apt.counselorName || '').toLowerCase().includes(query) ||
        (apt.type || '').toLowerCase().includes(query) ||
        (apt.notes || '').toLowerCase().includes(query)
      )
    }
    return filtered
  }, [appointments, filter, searchQuery])

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups = {}
    filteredAppointments.forEach(apt => {
      const date = new Date(apt.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(apt)
    })
    return groups
  }, [filteredAppointments])

  // Stats calculations
  const stats = useMemo(() => {
    const total = appointments.length
    const pending = appointments.filter(a => a.appointmentStatus === 'pending').length
    const accepted = appointments.filter(a => a.appointmentStatus === 'accepted').length
    const completed = appointments.filter(a => a.appointmentStatus === 'completed' || a.status === 'completed').length
    const rejected = appointments.filter(a => a.appointmentStatus === 'rejected' || a.status === 'cancelled').length
    const rescheduled = appointments.filter(a => a.appointmentStatus === 'rescheduled').length
    
    return { total, pending, accepted, completed, rejected, rescheduled }
  }, [appointments])

  const getStatusColor = (status, appointmentStatus) => {
    if (appointmentStatus === 'accepted' || status === 'completed') return '#10b981'
    if (appointmentStatus === 'pending') return '#f59e0b'
    if (appointmentStatus === 'rejected' || status === 'cancelled') return '#ef4444'
    if (appointmentStatus === 'rescheduled') return '#8b5cf6'
    return '#6b7280'
  }

  const getStatusBg = (status, appointmentStatus) => {
    if (appointmentStatus === 'accepted' || status === 'completed') return '#d1fae5'
    if (appointmentStatus === 'pending') return '#fef3c7'
    if (appointmentStatus === 'rejected' || status === 'cancelled') return '#fee2e2'
    if (appointmentStatus === 'rescheduled') return '#f3e8ff'
    return '#f3f4f6'
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Individual Session': return <Icons.User size={18} />
      case 'Stress Management': return <Icons.Heart size={18} />
      case 'Career Guidance': return <Icons.Briefcase size={18} />
      case 'Follow-up': return <Icons.RefreshCw size={18} />
      default: return <Icons.Calendar size={18} />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Individual Session': return '#3b82f6'
      case 'Stress Management': return '#ec4899'
      case 'Career Guidance': return '#8b5cf6'
      case 'Follow-up': return '#10b981'
      default: return '#6b7280'
    }
  }

  const handleAccept = async (appointmentId) => {
    try {
      setActionLoading(appointmentId)
      await counselingService.acceptAppointment(appointmentId)
      fetchAppointments()
    } catch (err) {
      console.error('Failed to accept appointment:', err)
      setError('Failed to accept appointment.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selectedAppointment) return
    try {
      setActionLoading(selectedAppointment)
      await counselingService.rejectAppointment(selectedAppointment, { reason: rejectReason })
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (err) {
      console.error('Failed to reject appointment:', err)
      setError('Failed to reject appointment.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      setActionLoading(appointmentId)
      await counselingService.cancelAppointment(appointmentId)
      fetchAppointments()
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
      setError('Failed to cancel appointment.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (appointmentId) => {
    try {
      setActionLoading(appointmentId)
      await counselingService.completeAppointment(appointmentId)
      fetchAppointments()
    } catch (err) {
      console.error('Failed to complete appointment:', err)
      setError('Failed to complete appointment.')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (apt) => {
    setSelectedAppointment(apt.id)
    setShowRejectModal(true)
  }

  const filters = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'accepted', label: 'Accepted', count: stats.accepted },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'rejected', label: 'Rejected', count: stats.rejected },
  ]

  // Render stat card
  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          background: bgColor, 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: color 
        }}>
          <Icon size={24} />
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '12px',
            color: trend > 0 ? '#10b981' : '#ef4444',
            fontWeight: '500'
          }}>
            {trend > 0 ? <Icons.TrendingUp size={14} /> : <Icons.TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  )

  // Render appointment card for grid view
  const AppointmentCard = ({ apt }) => (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Card Header */}
      <div style={{
        background: `linear-gradient(135deg, ${getTypeColor(apt.type)}15 0%, ${getTypeColor(apt.type)}05 100%)`,
        padding: '16px',
        borderBottom: `1px solid ${getTypeColor(apt.type)}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: getTypeColor(apt.type),
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            {getTypeIcon(apt.type)}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{apt.type}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{apt.time}</div>
          </div>
        </div>
        <span style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          background: getStatusBg(apt.status, apt.appointmentStatus),
          color: getStatusColor(apt.status, apt.appointmentStatus),
          textTransform: 'capitalize'
        }}>
          {apt.appointmentStatus || apt.status}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#f1f5f9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <Icons.User size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              {apt.studentName || 'Student'}
            </div>
            {!isCounselor && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Counselor: {apt.counselorName || 'Not assigned'}
              </div>
            )}
          </div>
        </div>
        
        {apt.notes && (
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            padding: '10px',
            background: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '12px',
            fontStyle: 'italic',
            borderLeft: `3px solid ${getTypeColor(apt.type)}`
          }}>
            "{apt.notes}"
          </div>
        )}

        {/* Action Buttons */}
        {isCounselor && apt.appointmentStatus === 'pending' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAccept(apt.id)}
              disabled={actionLoading === apt.id}
              style={{
                flex: 1,
                padding: '10px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: actionLoading === apt.id ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.Check size={14} /> Accept
            </button>
            <button
              onClick={() => openRejectModal(apt)}
              disabled={actionLoading === apt.id}
              style={{
                flex: 1,
                padding: '10px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: actionLoading === apt.id ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.X size={14} /> Reject
            </button>
          </div>
        )}

        {isCounselor && apt.appointmentStatus === 'accepted' && apt.status !== 'completed' && (
          <button
            onClick={() => handleComplete(apt.id)}
            disabled={actionLoading === apt.id}
            style={{
              width: '100%',
              padding: '10px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
              opacity: actionLoading === apt.id ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  )

  // Render appointment row for list view
  const AppointmentRow = ({ apt }) => (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.2s ease',
    }}>
      {/* Time */}
      <div style={{ minWidth: '90px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{apt.time}</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{apt.type}</div>
      </div>

      {/* Type indicator */}
      <div style={{
        width: '4px',
        height: '60px',
        background: getTypeColor(apt.type),
        borderRadius: '2px'
      }}></div>

      {/* Details */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: `${getTypeColor(apt.type)}15`, 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: getTypeColor(apt.type) 
          }}>
            {getTypeIcon(apt.type)}
          </div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
            {apt.studentName || 'Student'}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isCounselor && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icons.User size={14} /> {apt.counselorName || 'Not assigned'}
            </span>
          )}
        </div>
        {apt.notes && (
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
            "{apt.notes}"
          </div>
        )}
      </div>

      {/* Status and Actions */}
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
        <span style={{
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          background: getStatusBg(apt.status, apt.appointmentStatus),
          color: getStatusColor(apt.status, apt.appointmentStatus),
          textTransform: 'capitalize'
        }}>
          {apt.appointmentStatus || apt.status}
        </span>
        
        {isCounselor && apt.appointmentStatus === 'pending' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleAccept(apt.id)}
              disabled={actionLoading === apt.id}
              style={{
                padding: '6px 12px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: actionLoading === apt.id ? 0.6 : 1,
              }}
            >
              <Icons.Check size={12} /> Accept
            </button>
            <button
              onClick={() => openRejectModal(apt)}
              disabled={actionLoading === apt.id}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: actionLoading === apt.id ? 0.6 : 1,
              }}
            >
              <Icons.X size={12} /> Reject
            </button>
          </div>
        )}

        {isCounselor && apt.appointmentStatus === 'accepted' && apt.status !== 'completed' && (
          <button
            onClick={() => handleComplete(apt.id)}
            disabled={actionLoading === apt.id}
            style={{
              padding: '6px 14px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
              opacity: actionLoading === apt.id ? 0.6 : 1,
            }}
          >
            Mark Completed
          </button>
        )}

        {isCounselor && (apt.appointmentStatus === 'pending' || apt.appointmentStatus === 'accepted') && apt.status !== 'completed' && (
          <button
            onClick={() => handleCancel(apt.id)}
            disabled={actionLoading === apt.id}
            style={{
              padding: '4px 10px',
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: actionLoading === apt.id ? 'not-allowed' : 'pointer',
              opacity: actionLoading === apt.id ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        )}
        
        {apt.appointmentStatus === 'rescheduled' && apt.newDate && (
          <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px' }}>
            New: {new Date(apt.newDate).toLocaleDateString()} at {apt.newTime}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px' }}>
      {/* Header with Role-Based Title */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '8px' 
          }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
              {userInfo.label}
            </h1>
            <span style={{
              padding: '4px 12px',
              background: isCounselor ? '#dbeafe' : isAdmin ? '#fce7f3' : isDeanStudents ? '#fef3c7' : '#e5e7eb',
              color: isCounselor ? '#1d4ed8' : isAdmin ? '#be185d' : isDeanStudents ? '#b45309' : '#4b5563',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {userInfo.badge}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            {userInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard 
          icon={Icons.Calendar} 
          label="Total Appointments" 
          value={stats.total} 
          color="#3b82f6" 
          bgColor="#dbeafe"
          trend={12}
        />
        <StatCard 
          icon={Icons.Clock} 
          label="Pending" 
          value={stats.pending} 
          color="#f59e0b" 
          bgColor="#fef3c7"
          trend={-5}
        />
        <StatCard 
          icon={Icons.CheckCircle} 
          label="Accepted" 
          value={stats.accepted} 
          color="#10b981" 
          bgColor="#d1fae5"
          trend={8}
        />
        <StatCard 
          icon={Icons.Users} 
          label="Completed" 
          value={stats.completed} 
          color="#8b5cf6" 
          bgColor="#f3e8ff"
          trend={15}
        />
      </div>

      {/* Toolbar */}
      <div style={{ 
        background: '#fff', 
        padding: '16px 20px', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: '#f8fafc',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          flex: 1,
          maxWidth: '400px'
        }}>
          <Icons.Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by student, counselor or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: '#1e293b',
              width: '100%'
            }}
          />
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: viewMode === 'list' ? '#fff' : 'transparent',
                color: viewMode === 'list' ? '#3b82f6' : '#64748b',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icons.List size={16} /> List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: viewMode === 'grid' ? '#fff' : 'transparent',
                color: viewMode === 'grid' ? '#3b82f6' : '#64748b',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icons.LayoutGrid size={16} /> Grid
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '10px 18px',
              background: filter === f.id ? '#3b82f6' : '#fff',
              color: filter === f.id ? '#fff' : '#64748b',
              cursor: 'pointer',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              border: filter === f.id ? 'none' : '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: filter === f.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            {f.label}
            <span style={{
              background: filter === f.id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '16px 20px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid #fecaca'
        }}>
          <Icons.AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Appointments Display */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px', 
          color: '#64748b',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'inline-block', 
            animation: 'spin 1s linear infinite', 
            marginRight: '8px',
            fontSize: '24px'
          }}>⟳</div>
          <div style={{ fontSize: '16px', marginTop: '12px' }}>Loading appointments...</div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ 
          background: '#fff', 
          padding: '80px', 
          borderRadius: '16px', 
          textAlign: 'center', 
          border: '1px solid #e5e7eb' 
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#f1f5f9', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px', 
            color: '#94a3b8' 
          }}>
            <Icons.Calendar size={36} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
            No appointments found
          </h3>
<p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'There are no counseling appointments scheduled yet.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredAppointments.map((apt, idx) => (
            <AppointmentCard key={apt.id || idx} apt={apt} />
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date}>
              <h3 style={{ 
                margin: '0 0 12px', 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#64748b', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Icons.Calendar size={14} />
                {date}
                <span style={{
                  background: '#e5e7eb',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  {dateAppointments.length}
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dateAppointments.map((apt, idx) => (
                  <AppointmentRow key={apt.id || idx} apt={apt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fee2e2',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <Icons.AlertCircle size={20} />
              </div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Reject Appointment
              </h2>
            </div>
            
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>
              Please provide a reason for rejecting this appointment:
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedAppointment(null)
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === selectedAppointment}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: !rejectReason.trim() || actionLoading === selectedAppointment ? 'not-allowed' : 'pointer',
                  opacity: !rejectReason.trim() || actionLoading === selectedAppointment ? 0.6 : 1,
                }}
              >
                {actionLoading === selectedAppointment ? 'Rejecting...' : 'Reject Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  )
}

export default Appointments

