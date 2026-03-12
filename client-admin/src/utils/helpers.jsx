/**
 * Helper utilities for formatting data in the client-admin
 */

/**
 * Format status for display
 * @param {string} status - Raw status from API
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return '';
  const statusMap = {
    'new': 'New',
    'routed': 'Routed',
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed',
    'escalated': 'Escalated',
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

/**
 * Format priority for display
 * @param {string} priority - Raw priority from API
 * @returns {string} Formatted priority
 */
export const formatPriority = (priority) => {
  if (!priority) return '';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

/**
 * Format category for display
 * @param {string} category - Raw category from API
 * @returns {string} Formatted category
 */
export const formatCategory = (category) => {
  if (!category) return '';
  const categoryMap = {
    'course_related': 'Course Related',
    'faculty_wide': 'Faculty Wide',
    'welfare': 'Welfare',
    'admission': 'Admission',
    'quality': 'Quality',
    'mental_health': 'Mental Health',
  };
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
};

/**
 * Get status badge color
 * @param {string} status - Raw status from API
 * @returns {object} Background and text colors
 */
export const getStatusColors = (status) => {
  const colors = {
    'new': { bg: '#dbeafe', color: '#2563eb' },
    'routed': { bg: '#dbeafe', color: '#2563eb' },
    'in_progress': { bg: '#fef3c7', color: '#d97706' },
    'resolved': { bg: '#dcfce7', color: '#16a34a' },
    'closed': { bg: '#f3f4f6', color: '#6b7280' },
    'escalated': { bg: '#fee2e2', color: '#dc2626' },
  };
  return colors[status] || { bg: '#f3f4f6', color: '#6b7280' };
};

/**
 * Get priority badge color
 * @param {string} priority - Raw priority from API
 * @returns {object} Background and text colors
 */
export const getPriorityColors = (priority) => {
  const colors = {
    'low': { bg: '#dcfce7', color: '#16a34a' },
    'medium': { bg: '#fef3c7', color: '#d97706' },
    'high': { bg: '#fee2e2', color: '#dc2626' },
    'urgent': { bg: '#fee2e2', color: '#dc2626' },
  };
  return colors[priority] || { bg: '#f3f4f6', color: '#6b7280' };
};

/**
 * Format date for display
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format relative time
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};
