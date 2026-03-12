import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatsCard, DashboardHeader } from '../../../components/dashboard/DashboardComponents'
import { BarChartWidget, LineChartWidget, PieChartWidget, HorizontalBarChart, AreaChartWidget } from '../../../components/dashboard/Charts'
import { useDashboardData } from '../../../hooks/useDashboardData'
import { useUser } from '../../../hooks/useUser'
import { getStatusChartData, getCategoryChartData, getWeeklyTrendData, getMonthlyTrendData, getDepartmentMetrics, getResolutionMetrics } from '../../../utils/chartUtils'

// Icons
const Icons = {
  BarChart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  TrendingUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  AlertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
}

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const { loading, stats, feedbackList } = useDashboardData({ limit: 50 })
  const { faculty: userFaculty } = useUser()
  const navigate = useNavigate()

  const departmentStats = getDepartmentMetrics(feedbackList)
  const escalatedCases = feedbackList.filter(f => f.priority === 'high' || f.isEscalated)
  
  const tabs = [
    { id: 'overview', label: 'Faculty Overview' },
    { id: 'departments', label: 'Department Comparison' },
    { id: 'escalated', label: 'Escalated Cases' },
    { id: 'trends', label: 'Trends' },
  ]

  const departmentChartData = departmentStats.map(d => ({
    name: d.name,
    total: d.total,
    resolved: d.resolved,
    pending: d.pending,
    rate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
  }))

  const statusChartData = getStatusChartData(feedbackList)
  const categoryChartData = getCategoryChartData(feedbackList)
  const monthlyTrendData = getMonthlyTrendData(feedbackList)
  const weeklyData = getWeeklyTrendData(feedbackList)

  const dynamicStats = stats ? [
    { title: 'Total Feedback', value: stats.total || 0, icon: 'bar-chart' },
    { title: 'Resolution Rate', value: `${stats.resolutionRate || 0}%`, icon: 'trending-up' },
    { title: 'Avg Response', value: stats.avgResolutionHours ? `${stats.avgResolutionHours} hrs` : 'N/A', icon: 'timer' },
    { title: 'Escalated', value: stats.escalated || 0, icon: 'arrow-up' },
  ] : [
    { title: 'Total Feedback', value: '0', icon: 'bar-chart' },
    { title: 'Resolution Rate', value: '0%', icon: 'trending-up' },
    { title: 'Avg Response', value: 'N/A', icon: 'timer' },
    { title: 'Escalated', value: '0', icon: 'arrow-up' },
  ]

  // Modern stat cards with icons
  const statCards = [
    { title: 'Total Feedback', value: stats?.total || 0, icon: Icons.BarChart, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, icon: Icons.TrendingUp, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Avg Response', value: stats?.avgResolutionHours ? `${stats.avgResolutionHours} hrs` : 'N/A', icon: Icons.Clock, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Escalated', value: stats?.escalated || 0, icon: Icons.AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
    { title: 'Departments', value: departmentStats.length, icon: Icons.Users, color: '#3b82f6', bg: '#dbeafe' },
  ]

  const renderOverview = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {departmentStats.length > 0 ? departmentStats.map((dept, idx) => {
          const resolutionRate = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0
          return (
            <div key={idx} style={{ 
              background: '#fff', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{dept.name}</h3>
                <span style={{ 
                  background: resolutionRate >= 80 ? '#dcfce7' : '#fef3c7', 
                  color: resolutionRate >= 80 ? '#16a34a' : '#d97706', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {resolutionRate}%
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Total</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{dept.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Resolved</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{dept.resolved}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Pending</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{dept.pending}</div>
                </div>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${resolutionRate}%`, height: '100%', background: '#6366f1', borderRadius: '3px' }} />
              </div>
            </div>
          )
        }) : (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No department data available
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <PieChartWidget data={statusChartData} nameKey="name" valueKey="value" title="Feedback by Status" height={300} />
        <PieChartWidget data={categoryChartData} nameKey="name" valueKey="value" title="Feedback by Category" height={300} />
      </div>
    </>
  )

  const renderDepartments = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      <HorizontalBarChart data={departmentChartData} bars={[{ dataKey: 'total', name: 'Total Feedback', color: '#6366f1' }]} title="Feedback Volume by Department" height={300} />
      <HorizontalBarChart data={departmentChartData} bars={[{ dataKey: 'rate', name: 'Resolution Rate %', color: '#10b981' }]} title="Resolution Rate by Department" height={300} />
      <BarChartWidget data={departmentChartData} dataKey="resolved" xAxisKey="name" title="Resolved Feedback by Department" height={300} />
      <BarChartWidget data={departmentChartData} dataKey="pending" xAxisKey="name" title="Pending Feedback by Department" height={300} />
    </div>
  )

  const renderEscalated = () => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Escalated Cases</h2>
        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
          {escalatedCases.length} Active
        </span>
      </div>
      {escalatedCases.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Priority</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {escalatedCases.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{item.title}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{item.category}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{item.priority}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{item.status}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => navigate(`/dashboard/feedback/${item._id}`)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>View</button>
                  <button style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px' }}>Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No escalated cases</div>
      )}
    </div>
  )

  const renderTrends = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      <AreaChartWidget data={monthlyTrendData} areas={[{ dataKey: 'feedback', name: 'Feedback Received', color: '#6366f1' }, { dataKey: 'resolved', name: 'Feedback Resolved', color: '#10b981' }]} xAxisKey="name" title="Monthly Feedback Trend" height={300} />
      <LineChartWidget data={weeklyData} lines={[{ dataKey: 'feedback', name: 'Received', color: '#6366f1' }, { dataKey: 'resolved', name: 'Resolved', color: '#10b981' }]} xAxisKey="name" title="Weekly Feedback Trend" height={300} />
      <BarChartWidget data={monthlyTrendData} dataKey="feedback" xAxisKey="name" title="Monthly Feedback Volume" height={300} />
      <BarChartWidget data={monthlyTrendData} dataKey="resolved" xAxisKey="name" title="Monthly Resolved Feedback" height={300} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
<div style={{ padding: '32px 32px 32px 32px', maxWidth: '1900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Faculty Dean Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Oversight of all departments and feedback metrics</p>
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
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#6366f1' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                borderRadius: '8px 8px 0 0',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'departments' && renderDepartments()}
        {activeTab === 'escalated' && renderEscalated()}
        {activeTab === 'trends' && renderTrends()}
      </div>
    </div>
  )
}

export default FacultyDashboard
