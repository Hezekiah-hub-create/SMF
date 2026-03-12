import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatsCard, DashboardHeader } from '../../../components/dashboard/DashboardComponents'
import { BarChartWidget, LineChartWidget, PieChartWidget, HorizontalBarChart, AreaChartWidget, ProgressCircle, DonutChartWidget } from '../../../components/dashboard/Charts'
import { useDashboardData } from '../../../hooks/useDashboardData'
import { useUser } from '../../../hooks/useUser'
import { getStatusChartData, getCategoryChartData, getPriorityChartData, getWeeklyTrendData, getMonthlyTrendData, getResolutionMetrics } from '../../../utils/chartUtils'
import analyticsService from '../../../services/analyticsService'

// Icons
const Icons = {
  Heart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  AlertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  TrendingUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  GraduationCap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  DollarSign: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Pulse: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Briefcase: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  RefreshCw: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
}

// Welfare categories specific to Dean of Students
const welfareCategories = [
  { id: 'welfare', name: 'General Welfare', icon: Icons.Heart, color: '#ec4899', bg: '#fce7f3' },
  { id: 'accommodation', name: 'Accommodation', icon: Icons.Home, color: '#f59e0b', bg: '#fef3c7' },
  { id: 'mental_health', name: 'Mental Health', icon: Icons.Heart, color: '#ec4899', bg: '#fce7f3' },
  { id: 'student_services', name: 'Student Services', icon: Icons.Users, color: '#3b82f6', bg: '#dbeafe' },
  { id: 'campus_life', name: 'Campus Life', icon: Icons.Activity, color: '#10b981', bg: '#d1fae5' },
  { id: 'financial_aid', name: 'Financial Aid', icon: Icons.DollarSign, color: '#8b5cf6', bg: '#f3e8ff' },
  { id: 'health_services', name: 'Health Services', icon: Icons.Shield, color: '#ef4444', bg: '#fee2e2' },
]

const DeanOfStudentsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('month')
  const { loading, stats, feedbackList } = useDashboardData({ limit: 100 })
  const { user } = useUser()
  const navigate = useNavigate()

  // Filter welfare-related feedback
  const welfareFeedback = useMemo(() => {
    const welfareCategoryIds = welfareCategories.map(c => c.id)
    return feedbackList.filter(fb => fb.category && welfareCategoryIds.includes(fb.category.toLowerCase()))
  }, [feedbackList])

  const urgentFeedback = welfareFeedback.filter(f => f.priority === 'high' || f.priority === 'urgent')
  const confidentialCases = welfareFeedback.filter(fb => fb.category === 'mental_health' || fb.priority === 'high' || fb.priority === 'urgent')
  const referrals = welfareFeedback.filter(fb => fb.status === 'escalated' || fb.routedTo)

  // Calculate resolution metrics
  const resolutionMetrics = useMemo(() => getResolutionMetrics(welfareFeedback), [welfareFeedback])

  // Chart data
  const statusChartData = getStatusChartData(welfareFeedback)
  const categoryChartData = getCategoryChartData(welfareFeedback)
  const priorityChartData = getPriorityChartData(welfareFeedback)
  const monthlyTrendData = getMonthlyTrendData(welfareFeedback, 6)
  const weeklyData = getWeeklyTrendData(welfareFeedback)

  // Calculate category-specific metrics
  const categoryMetrics = useMemo(() => {
    return welfareCategories.map(cat => {
      const catFeedback = welfareFeedback.filter(f => f.category?.toLowerCase() === cat.id)
      const resolved = catFeedback.filter(f => f.status === 'resolved' || f.status === 'closed').length
      return {
        ...cat,
        total: catFeedback.length,
        resolved,
        pending: catFeedback.filter(f => f.status === 'new' || f.status === 'routed' || f.status === 'pending').length,
        inProgress: catFeedback.filter(f => f.status === 'in_progress').length,
        rate: catFeedback.length > 0 ? Math.round((resolved / catFeedback.length) * 100) : 0
      }
    })
  }, [welfareFeedback])

  // Recent activity (last 10 items)
  const recentActivity = useMemo(() => {
    return [...welfareFeedback]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
  }, [welfareFeedback])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'categories', label: 'Welfare Categories' },
    { id: 'trends', label: 'Trends & Analytics' },
    { id: 'urgent', label: 'Urgent Cases' },
    { id: 'referrals', label: 'Referrals' },
  ]

  // Enhanced stat cards with trends
  const statCards = [
    { title: 'Total Welfare Cases', value: welfareFeedback.length, icon: Icons.Heart, color: '#ec4899', bg: '#fce7f3', trend: 12 },
    { title: 'Resolution Rate', value: `${resolutionMetrics.resolutionRate}%`, icon: Icons.CheckCircle, color: '#10b981', bg: '#d1fae5', trend: 5 },
    { title: 'Urgent Cases', value: urgentFeedback.length, icon: Icons.AlertTriangle, color: '#ef4444', bg: '#fee2e2', trend: -3 },
    { title: 'Active Referrals', value: referrals.length, icon: Icons.Send, color: '#3b82f6', bg: '#dbeafe', trend: 8 },
    { title: 'Avg Response Time', value: stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : 'N/A', icon: Icons.Clock, color: '#f59e0b', bg: '#fef3c7' },
  ]

  const renderOverview = () => (
    <>
      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {categoryMetrics.filter(c => c.total > 0).map((cat, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            onClick={() => setActiveTab('categories')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: cat.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                  <cat.icon />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{cat.name}</span>
              </div>
              <span style={{
                background: cat.rate >= 70 ? '#d1fae5' : cat.rate >= 40 ? '#fef3c7' : '#fee2e2',
                color: cat.rate >= 70 ? '#059669' : cat.rate >= 40 ? '#d97706' : '#dc2626',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {cat.rate}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{cat.total}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Total</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{cat.resolved}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Resolved</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{cat.pending}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Pending</div>
              </div>
            </div>
            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${cat.rate}%`, height: '100', background: cat.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <AreaChartWidget 
          data={monthlyTrendData} 
          areas={[
            { dataKey: 'feedback', name: 'New Cases', color: '#ec4899' }, 
            { dataKey: 'resolved', name: 'Resolved', color: '#10b981' }
          ]} 
          xAxisKey="name" 
          title="Monthly Welfare Trend" 
          height={300} 
        />
        <DonutChartWidget 
          data={statusChartData.length > 0 ? statusChartData : [{ name: 'No Data', value: 1 }]} 
          nameKey="name" 
          valueKey="value" 
          title="Case Status Distribution" 
          height={300} 
        />
      </div>

      {/* Resolution Metrics & Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Resolution Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <ProgressCircle percentage={resolutionMetrics.resolutionRate} color="#10b981" title="Overall Rate" />
            <ProgressCircle percentage={resolutionMetrics.total > 0 ? Math.round((resolutionMetrics.resolved / resolutionMetrics.total) * 100) : 0} color="#ec4899" title="This Month" />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Priority Distribution</h3>
          <PieChartWidget data={priorityChartData} nameKey="name" valueKey="value" height={200} />
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Recent Activity</h3>
          <button style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentActivity.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: item.status === 'resolved' || item.status === 'closed' ? '#10b981' : 
                           item.status === 'in_progress' ? '#3b82f6' : 
                           item.priority === 'high' || item.priority === 'urgent' ? '#ef4444' : '#f59e0b',
                flexShrink: 0 
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                background: item.status === 'resolved' || item.status === 'closed' ? '#d1fae5' : 
                           item.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                color: item.status === 'resolved' || item.status === 'closed' ? '#059669' : 
                      item.status === 'in_progress' ? '#2563eb' : '#d97706'
              }}>
                {item.status}
              </span>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No recent activity</div>
          )}
        </div>
      </div>
    </>
  )

  const renderCategories = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      <PieChartWidget 
        data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1 }]} 
        nameKey="name" 
        valueKey="value" 
        title="Welfare Categories Distribution" 
        height={320} 
      />
      <BarChartWidget 
        data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1 }]} 
        dataKey="value" 
        xAxisKey="name" 
        title="Cases by Category" 
        height={320} 
      />
      <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Category Resolution Rates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {categoryMetrics.map((cat, idx) => (
            <div key={idx} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{cat.name}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: cat.color }}>{cat.rate}%</span>
              </div>
              <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${cat.rate}%`, height: '100%', background: cat.color, borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                <span>{cat.resolved} resolved</span>
                <span>{cat.total - cat.resolved} pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTrends = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      <AreaChartWidget 
        data={monthlyTrendData} 
        areas={[
          { dataKey: 'feedback', name: 'New Cases', color: '#ec4899' }, 
          { dataKey: 'resolved', name: 'Resolved', color: '#10b981' },
          { dataKey: 'escalated', name: 'Escalated', color: '#ef4444' }
        ]} 
        xAxisKey="name" 
        title="6-Month Trend Analysis" 
        height={320} 
      />
      <LineChartWidget 
        data={weeklyData} 
        lines={[
          { dataKey: 'feedback', name: 'Received', color: '#ec4899' }, 
          { dataKey: 'resolved', name: 'Resolved', color: '#10b981' }
        ]} 
        xAxisKey="name" 
        title="Weekly Pattern" 
        height={320} 
      />
      <BarChartWidget 
        data={monthlyTrendData} 
        dataKey="feedback" 
        xAxisKey="name" 
        title="Monthly Volume" 
        height={280} 
      />
      <HorizontalBarChart 
        data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'No Data', value: 1 }]} 
        bars={[{ dataKey: 'value', name: 'Cases', color: '#ec4899' }]} 
        title="Category Comparison" 
        height={280} 
      />
    </div>
  )

  const renderUrgent = () => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Urgent Cases</h2>
        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
          {urgentFeedback.length} Active
        </span>
      </div>
      {urgentFeedback.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Title</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Priority</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urgentFeedback.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{item.title}</td>
                  <td style={{ padding: '14px', fontSize: '13px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ 
                      background: item.priority === 'urgent' ? '#fee2e2' : '#fef3c7', 
                      color: item.priority === 'urgent' ? '#dc2626' : '#d97706', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {item.priority}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ 
                      background: item.status === 'escalated' ? '#fee2e2' : '#dbeafe', 
                      color: item.status === 'escalated' ? '#dc2626' : '#2563eb', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontSize: '12px', color: '#64748b' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <button 
                      onClick={() => navigate(`/dashboard/feedback/${item._id}`)}
                      style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px', fontSize: '14px' }}>
          No urgent cases at this time
        </div>
      )}
    </div>
  )

  const renderReferrals = () => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Referral Tracking</h2>
        <span style={{ background: '#dbeafe', color: '#2563eb', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
          {referrals.length} Referrals
        </span>
      </div>
      {referrals.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Referred To</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontSize: '13px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '14px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{item.routedTo?.name || 'Not specified'}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ 
                      background: item.status === 'resolved' ? '#dcfce7' : item.status === 'escalated' ? '#fee2e2' : '#fef3c7', 
                      color: item.status === 'resolved' ? '#16a34a' : item.status === 'escalated' ? '#dc2626' : '#d97706', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontSize: '12px', color: '#64748b' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <button 
                      onClick={() => navigate(`/dashboard/feedback/${item._id}`)}
                      style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px', fontSize: '14px' }}>
          No referrals at this time
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ padding: '32px 32px 32px 32px', maxWidth: '1900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' }}>Dean of Students Dashboard</h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>Monitor student welfare, accommodation, and cross-departmental issues</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  color: '#374151',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards with Trends */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {statCards.map((stat, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: '#fff', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: '48px', height: '48px', background: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '26px', fontWeight: '700', color: stat.color, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {stat.value}
                  {stat.trend !== undefined && (
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600',
                      color: stat.trend > 0 ? '#10b981' : '#ef4444',
                      background: stat.trend > 0 ? '#d1fae5' : '#fee2e2',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', paddingBottom: '0' }}>
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                padding: '14px 24px', 
                border: 'none', 
                background: activeTab === tab.id ? '#ec4899' : 'transparent', 
                color: activeTab === tab.id ? '#fff' : '#64748b', 
                cursor: 'pointer', 
                fontSize: '14px', 
                fontWeight: activeTab === tab.id ? '600' : '500', 
                borderRadius: '10px 10px 0 0', 
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                position: 'relative',
                top: '1px',
                borderBottom: activeTab === tab.id ? 'none' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '60px', fontSize: '16px' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>⟳</div>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'trends' && renderTrends()}
            {activeTab === 'urgent' && renderUrgent()}
            {activeTab === 'referrals' && renderReferrals()}
          </>
        )}
      </div>
    </div>
  )
}

export default DeanOfStudentsDashboard

