import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import analyticsService from '../../../services/analyticsService'
import feedbackService from '../../../services/feedbackService'

// Icons
const Icons = {
  BarChart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  TrendingUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  AlertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
}

const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || 'quality_assurance'
  } catch { return 'quality_assurance' }
}

const roleTabs = {
  quality_assurance: [
    { id: 'overview', label: 'University Overview' },
    { id: 'feedback', label: 'All Feedback' },
    { id: 'metrics', label: 'Performance Metrics' },
    { id: 'audit', label: 'Audit Logs' },
  ],
  admissions: [
    { id: 'complaints', label: 'Admission Complaints' },
    { id: 'registration', label: 'Registration Issues' },
    { id: 'status', label: 'Application Status' },
  ],
  academic_affairs: [
    { id: 'policy', label: 'Policy Complaints' },
    { id: 'exams', label: 'Exam Issues' },
    { id: 'curriculum', label: 'Curriculum Feedback' },
  ],
  counseling: [
    { id: 'confidential', label: 'Confidential Cases' },
    { id: 'welfare', label: 'Welfare Issues' },
    { id: 'referrals', label: 'Referrals' },
  ],
}

const roleInfo = {
  quality_assurance: { title: 'Quality Assurance Dashboard', subtitle: 'University-wide feedback monitoring and quality metrics' },
  admissions: { title: 'Admissions Dashboard', subtitle: 'Manage admission complaints and registration issues' },
  academic_affairs: { title: 'Academic Affairs Dashboard', subtitle: 'Policy and exam-related feedback management' },
  counseling: { title: 'Counseling Services Dashboard', subtitle: 'Confidential student welfare and counseling cases' },
}

const roleCategories = {
  admissions: ['admission'],
  academic_affairs: ['course_related', 'faculty_wide'],
  counseling: ['mental_health', 'welfare'],
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [orgSubTab, setOrgSubTab] = useState('faculties') // 'faculties', 'hods', 'lecturers'
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [feedbackList, setFeedbackList] = useState([])
  const [sysLogs, setSysLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const navigate = useNavigate()
  
  const userRole = getUserRole()
  const roleConfig = roleInfo[userRole] || roleInfo.quality_assurance
  const tabs = roleTabs[userRole] || roleTabs.quality_assurance
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, feedbackData] = await Promise.all([
          analyticsService.getDashboardStats(),
          feedbackService.getFeedback({ limit: 100 })
        ])
        setStats(statsData)
        setFeedbackList(Array.isArray(feedbackData) ? feedbackData : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setFeedbackList([])
      } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  // Fetch System Logs when audit tab is active
  useEffect(() => {
    if (activeTab === 'audit' && sysLogs.length === 0) {
      const fetchLogs = async () => {
        setLogsLoading(true)
        try {
          const res = await analyticsService.getSystemLogs({ limit: 50 })
          setSysLogs(res.logs || [])
        } catch (error) {
          console.error('Failed to fetch audit logs:', error)
          setSysLogs([])
        } finally {
          setLogsLoading(false)
        }
      }
      fetchLogs()
    }
  }, [activeTab, sysLogs.length])

  const roleFilteredFeedback = useMemo(() => {
    const categories = roleCategories[userRole]
    if (!categories) return feedbackList
    return feedbackList.filter(fb => fb.category && categories.includes(fb.category.toLowerCase()))
  }, [feedbackList, userRole])

  const roleStats = useMemo(() => {
    const total = roleFilteredFeedback.length
    const resolved = roleFilteredFeedback.filter(f => f.status === 'resolved' || f.status === 'closed').length
    const pending = roleFilteredFeedback.filter(f => f.status === 'new' || f.status === 'routed').length
    const inProgress = roleFilteredFeedback.filter(f => f.status === 'in_progress' || f.status === 'escalated').length
    return { total, resolved, pending, inProgress, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 }
  }, [roleFilteredFeedback])

  const statusChartData = useMemo(() => [
    { name: 'Resolved', value: roleFilteredFeedback.filter(f => f.status === 'resolved' || f.status === 'closed').length || 0 },
    { name: 'In Progress', value: roleFilteredFeedback.filter(f => f.status === 'in_progress').length || 0 },
    { name: 'Pending', value: roleFilteredFeedback.filter(f => f.status === 'new' || f.status === 'routed').length || 0 },
    { name: 'Escalated', value: roleFilteredFeedback.filter(f => f.status === 'escalated').length || 0 },
  ], [roleFilteredFeedback])

  const categoryChartData = useMemo(() => {
    const catCounts = {}
    roleFilteredFeedback.forEach(fb => {
      const cat = fb.category || 'Other'
      if (!catCounts[cat]) catCounts[cat] = { name: cat, value: 0 }
      catCounts[cat].value++
    })
    return Object.values(catCounts)
  }, [roleFilteredFeedback])

  const filteredData = roleFilteredFeedback.length > 0 ? roleFilteredFeedback : []

  // Modern stat cards
  const statCards = [
    { title: 'Total Feedback', value: stats?.total || roleStats.total || 0, icon: Icons.BarChart, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Resolution Rate', value: `${stats?.resolutionRate || roleStats.resolutionRate || 0}%`, icon: Icons.TrendingUp, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Pending', value: roleStats.pending || 0, icon: Icons.Clock, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'In Progress', value: roleStats.inProgress || 0, icon: Icons.AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
  ]

  const renderFeedbackTable = (data) => (
    <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      {data.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No feedback found</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>ID</th>
              <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Title</th>
              <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Category</th>
              <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Priority</th>
              <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Status</th>
              <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px', fontSize: '13px', color: '#1e293b' }}>{item.trackingId || item._id?.slice(-6) || idx + 1}</td>
                <td style={{ padding: '14px', fontSize: '13px', color: '#1e293b' }}>{item.title}</td>
                <td style={{ padding: '14px', fontSize: '13px', color: '#64748b' }}>{item.category || 'N/A'}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ background: item.priority === 'high' || item.priority === 'urgent' ? '#fee2e2' : item.priority === 'medium' ? '#fef3c7' : '#dbeafe', color: item.priority === 'high' || item.priority === 'urgent' ? '#dc2626' : item.priority === 'medium' ? '#d97706' : '#2563eb', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{item.priority || 'Normal'}</span>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{ background: item.status === 'resolved' || item.status === 'closed' ? '#dcfce7' : item.status === 'escalated' ? '#fee2e2' : item.status === 'in_progress' ? '#dbeafe' : '#fef3c7', color: item.status === 'resolved' || item.status === 'closed' ? '#16a34a' : item.status === 'escalated' ? '#dc2626' : item.status === 'in_progress' ? '#2563eb' : '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{item.status?.replace('_', ' ') || 'New'}</span>
                </td>
                <td style={{ padding: '14px' }}>
                  <button onClick={() => navigate(`/dashboard/feedback/${item._id || item.id}`)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>View</button>
                  <button style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px' }}>Respond</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (userRole) {
      case 'quality_assurance': return renderQAContent()
      case 'admissions': return renderAdmissionsContent()
      case 'academic_affairs': return renderAcademicContent()
      case 'counseling': return renderCounselingContent()
      default: return renderQAContent()
    }
  }

  const renderQAContent = () => {
    if (activeTab === 'overview') {
      return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Monthly Trend</h2>
              <div style={{ display: 'flex', gap: '24px', paddingTop: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Received</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>{stats?.total || 0}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Resolved</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats?.resolved || 0}</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Status Distribution</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {statusChartData.map((item, idx) => (
                  <div key={idx} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', minWidth: '100px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{item.value}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {renderFeedbackTable(filteredData.slice(0, 10))}
        </>
      )
    }

    if (activeTab === 'metrics') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Resolution Metrics</h2>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Average Resolution Time</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>{stats?.avgResolutionHours ? `${stats.avgResolutionHours} hrs` : 'N/A'}</div>
              </div>
              <Icons.Clock />
            </div>
            <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '4px' }}>Resolution Rate</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>{stats?.resolutionRate || roleStats.resolutionRate || 0}%</div>
              </div>
              <Icons.TrendingUp />
            </div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Feedback Volume by Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryChartData.map((cat, idx) => {
                const maxVal = Math.max(...categoryChartData.map(c => c.value), 1)
                const pct = Math.round((cat.value / maxVal) * 100)
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: '#475569', fontWeight: '500' }}>{cat.name.replace('_', ' ')}</span>
                      <span style={{ color: '#6366f1', fontWeight: '600' }}>{cat.value}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'audit') {
      return (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>System Audit Logs</h2>
            <button style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>Export CSV</button>
          </div>
          
          {logsLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading audit logs...</div>
          ) : sysLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No logs found for the selected period.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sysLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{log.userId?.name || log.userId?.email || 'System'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                          background: log.severity === 'high' ? '#fee2e2' : log.severity === 'medium' ? '#fef3c7' : '#f1f5f9',
                          color: log.severity === 'high' ? '#dc2626' : log.severity === 'medium' ? '#d97706' : '#475569'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>{log.resourceType}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details ? Object.keys(log.details).map(k => `${k}: ${log.details[k]}`).join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'feedback') {
      return renderFeedbackTable(filteredData)
    }
    return null
  }

  const renderAdmissionsContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{roleStats.total}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Total</div></div>
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>{roleStats.pending}</div><div style={{ fontSize: '12px', color: '#d97706' }}>Pending</div></div>
          <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{roleStats.inProgress}</div><div style={{ fontSize: '12px', color: '#2563eb' }}>In Progress</div></div>
          <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{roleStats.resolved}</div><div style={{ fontSize: '12px', color: '#16a34a' }}>Resolved</div></div>
        </div>
      </div>
      {renderFeedbackTable(filteredData)}
    </div>
  )

  const renderAcademicContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Academic Affairs Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{roleStats.total}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Total</div></div>
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{roleStats.resolutionRate}%</div><div style={{ fontSize: '12px', color: '#10b981' }}>Resolution</div></div>
        </div>
      </div>
      {renderFeedbackTable(filteredData)}
    </div>
  )

  const renderCounselingContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Counseling Cases</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{roleStats.inProgress}</div><div style={{ fontSize: '12px', color: '#ef4444' }}>Active</div></div>
          <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{roleStats.resolved}</div><div style={{ fontSize: '12px', color: '#10b981' }}>Resolved</div></div>
        </div>
      </div>
      {renderFeedbackTable(filteredData)}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
<div style={{ padding: '32px 32px 32px 32px', maxWidth: '1900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{roleConfig.title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>{roleConfig.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {statCards.map((stat, idx) => (
            <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 20px', border: 'none', background: activeTab === tab.id ? '#6366f1' : 'transparent', color: activeTab === tab.id ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab.id ? '600' : '400', borderRadius: '8px 8px 0 0', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading...</div> : renderTabContent()}
      </div>
    </div>
  )
}

export default AdminDashboard
