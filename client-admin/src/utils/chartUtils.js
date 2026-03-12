/**
 * Chart data utility functions
 * Reusable functions for generating chart data from feedback lists
 */

/**
 * Get status distribution for charts
 * @param {array} feedbackList - Array of feedback items
 * @param {object} options - Configuration options
 * @param {string} options.statusField - Field name for status (default: 'status')
 * @returns {array} Chart data array
 */
export const getStatusChartData = (feedbackList, options = {}) => {
  const { statusField = 'status' } = options
  return [
    { name: 'Resolved', value: feedbackList.filter(f => f[statusField] === 'resolved' || f[statusField] === 'closed').length },
    { name: 'In Progress', value: feedbackList.filter(f => f[statusField] === 'in_progress').length },
    { name: 'Pending', value: feedbackList.filter(f => f[statusField] === 'new' || f[statusField] === 'routed' || f[statusField] === 'pending').length },
    { name: 'Escalated', value: feedbackList.filter(f => f[statusField] === 'escalated').length },
  ]
}

/**
 * Get category distribution for charts
 * @param {array} feedbackList - Array of feedback items
 * @returns {array} Chart data array
 */
export const getCategoryChartData = (feedbackList) => {
  const categories = {}
  feedbackList.forEach(fb => {
    const cat = fb.category || 'Other'
    categories[cat] = (categories[cat] || 0) + 1
  })
  return Object.entries(categories).map(([name, value]) => ({ name, value }))
}

/**
 * Get priority distribution for charts
 * @param {array} feedbackList - Array of feedback items
 * @returns {array} Chart data array
 */
export const getPriorityChartData = (feedbackList) => [
  { name: 'High', value: feedbackList.filter(f => f.priority === 'high' || f.priority === 'urgent').length },
  { name: 'Medium', value: feedbackList.filter(f => f.priority === 'medium').length },
  { name: 'Low', value: feedbackList.filter(f => f.priority === 'low').length },
]

/**
 * Get weekly trend data
 * @param {array} feedbackList - Array of feedback items
 * @returns {array} Chart data array
 */
export const getWeeklyTrendData = (feedbackList) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayData = {}
  feedbackList.forEach(fb => {
    const date = new Date(fb.createdAt)
    const day = days[date.getDay()]
    if (!dayData[day]) dayData[day] = { name: day, feedback: 0, resolved: 0 }
    dayData[day].feedback++
    if (fb.status === 'resolved' || fb.status === 'closed') dayData[day].resolved++
  })
  return days.map(d => dayData[d] || { name: d, feedback: 0, resolved: 0 })
}

/**
 * Get monthly trend data
 * @param {array} feedbackList - Array of feedback items
 * @param {number} monthsToShow - Number of months to show (default: 6)
 * @returns {array} Chart data array
 */
export const getMonthlyTrendData = (feedbackList, monthsToShow = 6) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthData = {}
  feedbackList.forEach(fb => {
    const date = new Date(fb.createdAt)
    const month = months[date.getMonth()]
    if (!monthData[month]) monthData[month] = { name: month, feedback: 0, resolved: 0, escalated: 0 }
    monthData[month].feedback++
    if (fb.status === 'resolved' || fb.status === 'closed') monthData[month].resolved++
    if (fb.status === 'escalated') monthData[month].escalated++
  })
  return months.slice(0, monthsToShow).map(m => monthData[m] || { name: m, feedback: 0, resolved: 0, escalated: 0 })
}

/**
 * Get department metrics
 * @param {array} feedbackList - Array of feedback items
 * @returns {array} Chart data array
 */
export const getDepartmentMetrics = (feedbackList) => {
  const deptMap = {}
  feedbackList.forEach(fb => {
    const deptName = fb.department?.name || fb.department || 'Other'
    if (!deptMap[deptName]) {
      deptMap[deptName] = { name: deptName, total: 0, resolved: 0, pending: 0 }
    }
    deptMap[deptName].total++
    if (fb.status === 'resolved' || fb.status === 'closed') deptMap[deptName].resolved++
    else if (fb.status !== 'closed') deptMap[deptName].pending++
  })
  return Object.values(deptMap).map(d => ({
    ...d,
    rate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0
  }))
}

/**
 * Get resolution metrics
 * @param {array} feedbackList - Array of feedback items
 * @returns {object} Metrics object
 */
export const getResolutionMetrics = (feedbackList) => {
  const total = feedbackList.length
  const resolved = feedbackList.filter(f => f.status === 'resolved' || f.status === 'closed').length
  const pending = feedbackList.filter(f => f.status === 'new' || f.status === 'routed' || f.status === 'pending').length
  const inProgress = feedbackList.filter(f => f.status === 'in_progress').length
  const escalated = feedbackList.filter(f => f.status === 'escalated').length
  const highPriority = feedbackList.filter(f => f.priority === 'high' || f.priority === 'urgent').length

  return {
    total,
    resolved,
    pending,
    inProgress,
    escalated,
    highPriority,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
  }
}
