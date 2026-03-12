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
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
  UserCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
  )
}

const DepartmentStaffDashboard = () => {
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const { loading, stats, feedbackList } = useDashboardData()
  const { department: userDepartment, role: userRole, isHOD } = useUser()
  const { notifications, unreadCount, loading: notifLoading, markAsRead } = useNotifications(20)
  const navigate = useNavigate()

  // Filter feedback by department
  const departmentFeedback = useMemo(() => {
    return feedbackList.filter(fb => 
      !userDepartment || fb.department?.name === userDepartment || fb.department === userDepartment
    )
  }, [feedbackList, userDepartment])

  // Escalated cases
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
    // { id: 'feedback', label: 'Feedback', icon: Icons.MessageSquare },
    { id: 'activity', label: 'Activity', icon: Icons.Activity },
    ...(isHOD ? [
      { id: 'escalations', label: 'Escalations', icon: Icons.AlertTriangle },
      { id: 'staff', label: 'Staff', icon: Icons.UserCheck },
    ] : []),
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

  // // Render Feedback Tab
  // const renderFeedback = () => (
  //   <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
  //     <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //       <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Recent Feedback</h3>
  //       <button style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
  //         + New Feedback
  //       </button>
  //     </div>
  //     {departmentFeedback.length > 0 ? (
  //       <div style={{ overflowX: 'auto' }}>
  //         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  //           <thead>
  //             <tr style={{ background: '#f8fafc' }}>
  //               <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
  //               <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
  //               <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</th>
  //               <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
  //               <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {departmentFeedback.slice(0, 8).map((item, idx) => (
  //               <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
  //                 onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
  //                 onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
  //               >
  //                 <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{item.title}</td>
  //                 <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{item.category}</td>
  //                 <td style={{ padding: '16px 20px' }}>
  //                   <span style={{ 
  //                     background: item.priority === 'high' ? '#fef2f2' : item.priority === 'medium' ? '#fffbeb' : '#f0fdf4', 
  //                     color: item.priority === 'high' ? '#dc2626' : item.priority === 'medium' ? '#d97706' : '#16a34a', 
  //                     padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize'
  //                   }}>
  //                     {item.priority}
  //                   </span>
  //                 </td>
  //                 <td style={{ padding: '16px 20px' }}>
  //                   <span style={{ 
  //                     background: item.status === 'resolved' || item.status === 'closed' ? '#f0fdf4' : '#e0f2fe', 
  //                     color: item.status === 'resolved' || item.status === 'closed' ? '#16a34a' : '#0284c7', 
  //                     padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize'
  //                   }}>
  //                     {item.status?.replace('_', ' ')}
  //                   </span>
  //                 </td>
  //                 <td style={{ padding: '16px 20px' }}>
  //                   <button onClick={() => setSelectedFeedback(item)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View Details</button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     ) : (
  //       <div style={{ padding: '60px 20px', textAlign: 'center' }}>
  //         <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
  //           <Icons.MessageSquare />
  //         </div>
  //         <p style={{ color: '#64748b', fontSize: '14px' }}>No feedback available</p>
  //       </div>
  //     )}
  //   </div>
  // )

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

  // Render Escalations Tab
  const renderEscalations = () => (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Escalation Panel</h3>
        <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
          {escalatedCases.length} Active
        </span>
      </div>
      {escalatedCases.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Title</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Category</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Priority</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Assigned To</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {escalatedCases.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{item.title}</td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>High</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{item.assignedTo?.name || item.assignedTo || 'Unassigned'}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <button onClick={() => navigate(`/dashboard/feedback/${item._id}`)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Icons.CheckCircle />
          </div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>No escalated cases</p>
        </div>
      )}
    </div>
  )

  // Render Staff Performance Tab
  const renderStaff = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* KPIs */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Department KPIs - {userDepartment}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', background: '#eef2ff', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#6366f1', marginBottom: '4px', fontWeight: '500' }}>Total Feedback</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#6366f1' }}>{departmentMetrics.total}</div>
          </div>
          <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '4px', fontWeight: '500' }}>Resolution Rate</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{departmentMetrics.resolutionRate}%</div>
          </div>
          <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '4px', fontWeight: '500' }}>High Priority</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>{departmentMetrics.highPriority}</div>
          </div>
          <div style={{ padding: '20px', background: '#fffbeb', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '4px', fontWeight: '500' }}>Pending</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{departmentMetrics.pending}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Monthly Trend</h3>
          <AreaChartWidget data={monthlyTrendData} areas={[{ dataKey: 'feedback', name: 'Received', color: '#6366f1' }, { dataKey: 'resolved', name: 'Resolved', color: '#10b981' }]} xAxisKey="name" title="" height={260} />
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>By Category</h3>
          <PieChartWidget data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1 }]} nameKey="name" valueKey="value" title="" height={260} />
        </div>
      </div>

      {/* Category Performance */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Category Resolution Rates</h3>
        {categoryPerformance.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryPerformance.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{cat.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{cat.rate}%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.rate}%`, height: '100%', background: cat.rate >= 80 ? '#10b981' : cat.rate >= 60 ? '#f59e0b' : '#ef4444', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No category data</p>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Main Content */}
      <div style={{ padding: '32px 32px 32px 39px', maxWidth: '1900px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Department Staff Dashboard</h1>
<p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Managing feedback for <span style={{ fontWeight: '600', color: '#6366f1' }}>{userDepartment || 'Computer Science'}</span></p>
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
            {/* {activeTab === 'feedback' && renderFeedback()} */}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'escalations' && isHOD && renderEscalations()}
            {activeTab === 'staff' && isHOD && renderStaff()}
          </>
        )}
      </div>

      {/* Modal */}
      {/* {selectedFeedback && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', maxWidth: '500px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{selectedFeedback.title}</h2>
              <button onClick={() => setSelectedFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <Icons.X />
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Category</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{selectedFeedback.category}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Priority</div>
                <span style={{ background: selectedFeedback.priority === 'high' ? '#fef2f2' : '#fffbeb', color: selectedFeedback.priority === 'high' ? '#dc2626' : '#d97706', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' }}>
                  {selectedFeedback.priority}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Status</div>
                <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' }}>
                  {selectedFeedback.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setSelectedFeedback(null)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                Close
              </button>
              <button style={{ flex: 1, background: '#6366f1', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                View Details
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default DepartmentStaffDashboard
