import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChartWidget, LineChartWidget, PieChartWidget, ProgressCircle, AreaChartWidget } from '../../../components/dashboard/Charts'
import { useDashboardData } from '../../../hooks/useDashboardData'
import { useUser } from '../../../hooks/useUser'
import { useNotifications } from '../../../hooks/useNotifications'
import { getStatusChartData, getCategoryChartData, getPriorityChartData, getWeeklyTrendData, getMonthlyTrendData, getResolutionMetrics } from '../../../utils/chartUtils'

// Modern Icons
const Icons = {
  MessageSquare: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  BarChart2: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  UserCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
  )
}

const SRCDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const { loading, stats, feedbackList } = useDashboardData()
  const { department: userDepartment, name: userName } = useUser()
  const { notifications, unreadCount } = useNotifications(20)
  const navigate = useNavigate()

  // Filter feedback by SRC's department
  const departmentFeedback = useMemo(() => {
    return feedbackList.filter(fb => 
      !userDepartment || fb.department?.name === userDepartment || fb.department === userDepartment
    )
  }, [feedbackList, userDepartment])

  // Escalated cases in the department
  const escalatedCases = useMemo(() => {
    return departmentFeedback.filter(fb => fb.priority === 'high' || fb.isEscalated || fb.status === 'escalated')
  }, [departmentFeedback])

  // Chart data using utility functions
  const statusChartData = getStatusChartData(departmentFeedback)
  const categoryChartData = getCategoryChartData(departmentFeedback)
  const priorityData = getPriorityChartData(departmentFeedback)
  const weeklyTrendData = getWeeklyTrendData(departmentFeedback)
  const monthlyTrendData = getMonthlyTrendData(departmentFeedback)
  const departmentMetrics = getResolutionMetrics(departmentFeedback)

  // Category performance
  const categoryPerformance = useMemo(() => {
    const categories = {}
    departmentFeedback.forEach(fb => {
      const cat = fb.category || 'Other'
      if (!categories[cat]) categories[cat] = { total: 0, resolved: 0 }
      categories[cat].total++
      if (fb.status === 'resolved' || fb.status === 'closed') categories[cat].resolved++
    })
    return Object.entries(categories).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved,
      rate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0
    }))
  }, [departmentFeedback])

  // Dynamic stats
  const dynamicStats = [
    { title: 'Total Feedback', value: departmentMetrics.total, icon: 'MessageSquare', color: '#6366f1', bg: '#eef2ff' },
    { title: 'In Progress', value: departmentMetrics.inProgress, icon: 'Clock', color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Resolved', value: departmentMetrics.resolved, icon: 'CheckCircle', color: '#10b981', bg: '#ecfdf5' },
    { title: 'Escalated', value: escalatedCases.length, icon: 'AlertTriangle', color: '#ef4444', bg: '#fef2f2' },
  ]

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Icons.BarChart2 },
    { id: 'activity', label: 'Activity', icon: Icons.Activity },
  ]

  // Render Overview Tab
  const renderOverview = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {dynamicStats.map((stat, idx) => {
          const IconComponent = Icons[stat.icon] || Icons.MessageSquare
          return (
            <div key={idx} style={{ 
              background: '#fff', 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  background: stat.bg, 
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color
                }}>
                  <IconComponent />
                </div>
                <span style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>{stat.title}</div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Feedback by Status</h3>
          <PieChartWidget data={statusChartData.length > 0 ? statusChartData : [{ name: 'No Data', value: 1 }]} nameKey="name" valueKey="value" title="" height={280} />
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Feedback by Category</h3>
          <PieChartWidget data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1 }]} nameKey="name" valueKey="value" title="" height={280} />
        </div>
      </div>

      {/* Trend Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Weekly Trend</h3>
          <LineChartWidget data={weeklyTrendData} lines={[{ dataKey: 'feedback', name: 'Received', color: '#6366f1' }, { dataKey: 'resolved', name: 'Resolved', color: '#10b981' }]} xAxisKey="name" title="" height={260} />
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>By Priority</h3>
          <BarChartWidget data={priorityData.length > 0 ? priorityData : [{ name: 'No Data', value: 1 }]} dataKey="value" xAxisKey="name" title="" height={260} />
        </div>
      </div>

      {/* Resolution Progress */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Performance Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'center' }}>
          <ProgressCircle percentage={departmentMetrics.resolutionRate} title="Resolution Rate" color="#6366f1" size={160} />
          <ProgressCircle percentage={Math.round((departmentMetrics.resolved / (departmentMetrics.total || 1)) * 100)} title="Completion Rate" color="#10b981" size={160} />
        </div>
      </div>
    </div>
  )

  // Render Activity Tab
  const renderActivity = () => (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Recent Activity</h3>
      </div>
      {departmentFeedback.length > 0 ? (
        <div style={{ padding: '8px 0' }}>
          {departmentFeedback.slice(0, 6).map((item, idx) => (
            <div key={idx} style={{ 
              padding: '16px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              borderBottom: idx < 5 ? '1px solid #f1f5f9' : 'none',
              transition: 'background 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ 
                width: '10px', height: '10px', 
                borderRadius: '50%', 
                background: item.status === 'resolved' ? '#10b981' : item.status === 'in_progress' ? '#f59e0b' : '#6366f1',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.category} • {item.status?.replace('_', ' ')}</div>
              </div>
              <Icons.ChevronRight />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '14px' }}>No recent activity</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Main Content */}
      <div style={{ padding: '32px 32px 32px 39px', maxWidth: '1900px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Student Representative Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Welcome, <span style={{ fontWeight: '600', color: '#6366f1' }}>{userName || 'Student Representative'}</span> - 
            Managing feedback for <span style={{ fontWeight: '600', color: '#6366f1' }}>{userDepartment || 'Your Department'}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 'fit-content' }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === tab.id ? '#6366f1' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <IconComponent />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'activity' && renderActivity()}
          </>
        )}
      </div>
    </div>
  )
}

export default SRCDashboard

