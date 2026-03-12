
import React, { useState, useEffect, useMemo } from 'react'
import feedbackService from '../../services/feedbackService'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { 
  FileText, Download, BarChart3, TrendingUp, 
  CheckCircle, AlertTriangle, Clock, X, PieChart as PieChartIcon,
  RefreshCw, ChevronDown, Calendar, FileBarChart
} from 'lucide-react'
import './Reports.css'

// Chart colors
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: '#fff', 
        padding: '12px', 
        border: '1px solid #e6e9ee', 
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0', color: entry.color, fontSize: '13px' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const Reports = () => {
  // State management
  const [reportType, setReportType] = useState('summary')
  const [dateRange, setDateRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [showCharts, setShowCharts] = useState(false)
  const [feedbackData, setFeedbackData] = useState([])
  const [reportData, setReportData] = useState({
    totalFeedback: 0,
    resolved: 0,
    pending: 0,
    escalated: 0,
    satisfaction: 0,
  })
  const [chartType, setChartType] = useState('bar')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  // Fetch data on mount and date range change
  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use feedbackService which is definitely available
      const [stats, feedbackList] = await Promise.all([
        feedbackService.getStats(),
        feedbackService.getAllFeedback()
      ])
      
      setFeedbackData(feedbackList || [])
      setReportData({
        totalFeedback: stats.total || 0,
        resolved: stats.resolved || 0,
        pending: (stats.new || 0) + (stats.inProgress || 0) + (stats.routed || 0),
        escalated: stats.escalated || 0,
        satisfaction: stats.resolutionRate || 0,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      setError('Failed to load report data. Please try again.')
      setFeedbackData([])
      setReportData({
        totalFeedback: 0,
        resolved: 0,
        pending: 0,
        escalated: 0,
        satisfaction: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Export to PDF (simplified - tables only)
  const exportToPDF = () => {
    if (exporting) return
    setExporting(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Header with branding
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, pageWidth, 35, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('Feedback Analytics Report', 14, 22)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Date Range: Last ${dateRange} days`, 14, 30)
      
      // Reset text color
      doc.setTextColor(30, 41, 59)
      
      // Summary Statistics Section
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary Statistics', 14, 50)
      
      // Create summary table
      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Value', 'Description']],
        body: [
          ['Total Feedback', reportData.totalFeedback.toString(), 'All feedback entries'],
          ['Resolved', reportData.resolved.toString(), 'Successfully resolved'],
          ['Pending', reportData.pending.toString(), 'Awaiting action'],
          ['Escalated', reportData.escalated.toString(), 'High priority items'],
          ['Resolution Rate', `${reportData.satisfaction}%`, 'Percentage resolved'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold', halign: 'center' }
        }
      })
      
      // Status Breakdown Section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Status Breakdown', 14, doc.lastAutoTable.finalY + 15)
      
      const statusTableData = [
        ['Resolved', reportData.resolved.toString(), `${reportData.totalFeedback > 0 ? Math.round((reportData.resolved / reportData.totalFeedback) * 100) : 0}%`],
        ['Pending', reportData.pending.toString(), `${reportData.totalFeedback > 0 ? Math.round((reportData.pending / reportData.totalFeedback) * 100) : 0}%`],
        ['Escalated', reportData.escalated.toString(), `${reportData.totalFeedback > 0 ? Math.round((reportData.escalated / reportData.totalFeedback) * 100) : 0}%`]
      ]
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Status', 'Count', 'Percentage']],
        body: statusTableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }
      })
      
      // Add trend data table on a new page
      doc.addPage()
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, pageWidth, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.text('Monthly Trends', 14, 17)
      
doc.setTextColor(30, 41, 59)
      
      // Monthly trends table
      const monthlyArray = Array.isArray(monthlyData) ? monthlyData : []
      const trendData = monthlyArray.map(item => [
        item.month || 'N/A',
        (item.count || 0).toString()
      ])
      
      autoTable(doc, {
        startY: 35,
        head: [['Month', 'Feedback Count']],
        body: trendData.length > 0 ? trendData : [['No data available', '-']],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }
      })
      
      // Recent Feedback Table
      doc.addPage()
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, pageWidth, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.text('Recent Feedback Details', 14, 17)
      
      doc.setTextColor(30, 41, 59)
      
      const safeFeedbackData = Array.isArray(feedbackData) ? feedbackData : []
      if (safeFeedbackData.length > 0) {
        const tableData = safeFeedbackData.slice(0, 15).map(item => [
          (item.title || 'N/A').substring(0, 30),
          item.status || 'N/A',
          item.category || 'N/A',
          item.priority || 'N/A',
          item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
        ])
        
        autoTable(doc, {
          startY: 35,
          head: [['Title', 'Status', 'Category', 'Priority', 'Date']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 8, cellPadding: 3 }
        })
      }
      
      // Footer with page numbers
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(100, 116, 139)
        doc.text(
          `Page ${i} of ${pageCount} | Feedback Analytics System`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }
      
      // Save the PDF
      doc.save(`feedback-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Export to Excel with multiple sheets
  const exportToExcel = () => {
    if (exporting) return
    setExporting(true)
    
    try {
      const wb = XLSX.utils.book_new()
      
      // Sheet 1: Summary
      const summaryData = [
        { Metric: 'Total Feedback', Value: reportData.totalFeedback, Notes: 'All feedback entries' },
        { Metric: 'Resolved', Value: reportData.resolved, Notes: 'Successfully resolved' },
        { Metric: 'Pending', Value: reportData.pending, Notes: 'Awaiting action' },
        { Metric: 'Escalated', Value: reportData.escalated, Notes: 'High priority items' },
        { Metric: 'Resolution Rate', Value: `${reportData.satisfaction}%`, Notes: 'Percentage resolved' },
        { Metric: 'Date Range', Value: `Last ${dateRange} days`, Notes: '' },
        { Metric: 'Generated On', Value: new Date().toLocaleString(), Notes: '' }
      ]
      
      const ws1 = XLSX.utils.json_to_sheet(summaryData)
      ws1['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 30 }]
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary')
      
      // Sheet 2: Status Breakdown
      const statusExportData = [
        { Status: 'Resolved', Count: reportData.resolved, Percentage: `${reportData.totalFeedback > 0 ? Math.round((reportData.resolved / reportData.totalFeedback) * 100) : 0}%` },
        { Status: 'Pending', Count: reportData.pending, Percentage: `${reportData.totalFeedback > 0 ? Math.round((reportData.pending / reportData.totalFeedback) * 100) : 0}%` },
        { Status: 'Escalated', Count: reportData.escalated, Percentage: `${reportData.totalFeedback > 0 ? Math.round((reportData.escalated / reportData.totalFeedback) * 100) : 0}%` }
      ]
      
      const ws2 = XLSX.utils.json_to_sheet(statusExportData)
      ws2['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, ws2, 'Status Breakdown')
      

      const feedbackTableData = (Array.isArray(feedbackData) ? feedbackData : []).map(item => ({
        Title: item.title || 'N/A',
        Description: (item.description || 'N/A').substring(0, 100),
        Status: item.status || 'N/A',
        Category: item.category || 'N/A',
        Priority: item.priority || 'N/A',
        Department: item.department?.name || item.department || 'N/A',
        SubmittedBy: item.submittedBy?.name || item.submittedBy || 'N/A',
        AssignedTo: item.assignedTo?.name || item.assignedTo || 'Unassigned',
        CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        UpdatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'
      }))
      
      if (feedbackTableData.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(feedbackTableData)
        ws3['!cols'] = [
          { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 15 }, 
          { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
          { wch: 12 }, { wch: 12 }
        ]
        XLSX.utils.book_append_sheet(wb, ws3, 'Feedback Details')
      }
      
      // Sheet 4: Category Breakdown
      const safeCategoryData = Array.isArray(categoryData) ? categoryData : []
      const categoryTableData = safeCategoryData.map((item, index) => ({
        Category: item.name,
        Count: item.value,
        Percentage: `${feedbackData.length > 0 ? Math.round((item.value / feedbackData.length) * 100) : 0}%`,
        Color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      
      if (categoryTableData.length > 0) {
        const ws4 = XLSX.utils.json_to_sheet(categoryTableData)
        ws4['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 }]
        XLSX.utils.book_append_sheet(wb, ws4, 'Categories')
      }
      
      // Sheet 5: Monthly Trends
      const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : []
      const trendTableData = safeMonthlyData.map(item => ({
        Month: item.month,
        FeedbackCount: item.count,
        Notes: ''
      }))
      
      const ws5 = XLSX.utils.json_to_sheet(trendTableData)
      ws5['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, ws5, 'Monthly Trends')
      
      // Save the file
      XLSX.writeFile(wb, `feedback-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export Excel. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Toggle charts view
  const toggleCharts = () => {
    setShowCharts(!showCharts)
  }

  // Chart data processing
  const statusData = [
    { name: 'Resolved', value: reportData.resolved, color: '#10b981' },
    { name: 'Pending', value: reportData.pending, color: '#f59e0b' },
    { name: 'Escalated', value: reportData.escalated, color: '#ef4444' },
  ].filter(item => item.value > 0)

  const categoryData = React.useMemo(() => {
    if (!feedbackData || !Array.isArray(feedbackData)) return []
    const categories = {}
    feedbackData.forEach(item => {
      const cat = item.category || 'Other'
      categories[cat] = (categories[cat] || 0) + 1
    })
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [feedbackData])

  const monthlyData = React.useMemo(() => {
    if (!feedbackData || !Array.isArray(feedbackData)) return []
    const months = {}
    feedbackData.forEach(item => {
      if (item.createdAt) {
        const date = new Date(item.createdAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        months[key] = (months[key] || 0) + 1
      }
    })
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }))
  }, [feedbackData])

  // Report types configuration
  const reportTypes = [
    { id: 'summary', label: 'Summary Report' },
    { id: 'detailed', label: 'Detailed Report' },
    { id: 'trends', label: 'Trends Report' },
    { id: 'department', label: 'Department Report' },
  ]

  // Export cards configuration
  const exportCards = [
    { 
      id: 'pdf', 
      label: 'Export PDF', 
      desc: 'Download report as PDF', 
      icon: Download, 
      color: '#ef4444', 
      bg: '#fef2f2', 
      action: exportToPDF,
      className: 'export-card-pdf'
    },
    { 
      id: 'excel', 
      label: 'Export Excel', 
      desc: 'Download raw data', 
      icon: FileText, 
      color: '#10b981', 
      bg: '#ecfdf5', 
      action: exportToExcel,
      className: 'export-card-excel'
    },
    { 
      id: 'charts', 
      label: 'View Charts', 
      desc: 'Interactive visualizations', 
      icon: BarChart3, 
      color: '#6366f1', 
      bg: '#eef2ff', 
      action: toggleCharts,
      className: 'export-card-charts'
    },
  ]

  // Stat cards configuration
  const statCards = [
    { label: 'Total Feedback', value: reportData.totalFeedback, icon: FileText, color: '#6366f1', bg: '#eef2ff', className: 'stat-total' },
    { label: 'Resolved', value: reportData.resolved, icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', className: 'stat-resolved' },
    { label: 'Pending', value: reportData.pending, icon: Clock, color: '#f59e0b', bg: '#fffbeb', className: 'stat-pending' },
    { label: 'Escalated', value: reportData.escalated, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', className: 'stat-escalated' },
    { label: 'Resolution Rate', value: `${reportData.satisfaction}%`, icon: TrendingUp, color: '#3b82f6', bg: '#dbeafe', className: 'stat-rate' },
  ]

  // Chart type buttons
  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: TrendingUp },
    { id: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  ]

  // Render chart based on selected type
  const renderStatusChart = () => {
    const commonProps = {
      data: statusData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="Count" />
            </LineChart>
          </ResponsiveContainer>
        )
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" name="Count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  const renderCategoryChart = () => {
    const commonProps = {
      data: categoryData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="Count" />
            </LineChart>
          </ResponsiveContainer>
        )
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" name="Count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="reports-container">
      <div className="reports-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Generate and view feedback reports</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-card">
            <label className="filter-label">Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="filter-select"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-card">
            <label className="filter-label">Date Range</label>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <button 
            onClick={fetchReportData}
            className="generate-btn"
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>

        {/* Export Cards */}
        <div className="export-cards-grid">
          {exportCards.map(card => (
            <button 
              key={card.id}
              onClick={card.action}
              className={`export-card ${card.className}`}
              disabled={exporting}
            >
              <div className="export-card-icon" style={{ background: card.bg, color: card.color }}>
                <card.icon size={24} />
              </div>
              <div className="export-card-content">
                <h3>{card.label}</h3>
                <p>{card.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Charts Section */}
        {showCharts && (
          <div className="charts-section">
            {/* Chart Type Selector */}
            <div className="chart-type-selector">
              {chartTypes.map(type => (
                <button
                  key={type.id}
                  className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
                  onClick={() => setChartType(type.id)}
                >
                  <type.icon size={14} style={{ marginRight: 6 }} />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Status Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <h2 className="chart-card-title">Feedback by Status</h2>
                <button onClick={() => setShowCharts(false)} className="chart-close-btn">
                  <X size={20} />
                </button>
              </div>
              <div className="chart-container">
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                    Loading chart data...
                  </div>
                ) : statusData.length > 0 ? renderStatusChart() : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                    No status data available
                  </div>
                )}
              </div>
            </div>

            {/* Category Chart */}
            <div className="chart-card">
              <h2 className="chart-card-title">Feedback by Category</h2>
              <div className="chart-container">
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                    Loading chart data...
                  </div>
                ) : categoryData.length > 0 ? renderCategoryChart() : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                    No category data available
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trends Chart */}
            {monthlyData.length > 0 && (
              <div className="chart-card">
                <h2 className="chart-card-title">Monthly Trends</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} name="Feedback Count" dot={{ fill: '#6366f1', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report Summary */}
        <div className="report-summary">
          <h2 className="report-summary-title">Report Summary</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading report data...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : (
            <div className="stats-grid">
              {statCards.map((stat, idx) => (
                <div key={idx} className={`stat-card ${stat.className}`} style={{ background: stat.bg }}>
                  <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports

