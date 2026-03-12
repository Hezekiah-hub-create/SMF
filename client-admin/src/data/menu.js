// This function generates menu items based on user role
// It's meant to be used in the Sidebar component
export const getMenuForRole = (userRole) => {
  if (!userRole) return []

  const role = String(userRole).toLowerCase().trim()

  // Get the default dashboard path and label for the role
  const getDashboardConfig = () => {
    switch (role) {
      case 'admin':
        return { path: '/dashboard/system', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'dean_faculty':
        return { path: '/dashboard/faculty', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'dean_students':
        return { path: '/dashboard/students', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'src':
        // SRC (Student Representative) has their own dedicated dashboard
        return { path: '/dashboard/src', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'hod':
        return { path: '/dashboard/staff', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'lecturer':
        return { path: '/dashboard/staff', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'staff':
        return { path: '/dashboard/staff', label: 'Dashboard', icon: 'LayoutDashboard' }
      case 'admissions':
      case 'quality_assurance':
      case 'academic_affairs':
      case 'counseling':
        return { path: '/dashboard/admin', label: 'Dashboard', icon: 'LayoutDashboard' }
      default:
        return { path: '/dashboard/staff', label: 'Dashboard', icon: 'LayoutDashboard' }
    }
  }

  const dashboardConfig = getDashboardConfig()

  // Base menu for all users - with Dashboard as the FIRST element (except for SRC)
  const menu = []

  // Add dashboard only if label is not empty (SRC doesn't need it)
  if (dashboardConfig.label) {
    menu.push({ id: 'dashboard', label: dashboardConfig.label, icon: dashboardConfig.icon, path: dashboardConfig.path, roles: ['ALL'] })
  }

  // Add common menu items (filter out Feedback for admin role)
  const commonMenuItems = [
    { id: 'notifications', label: 'Notifications', icon: 'Bell', path: '/dashboard/notifications', roles: ['ALL'] },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/dashboard/analytics', roles: ['ALL'] }
  ]

  // Add Feedback only for non-admin roles
  if (role !== 'admin') {
    commonMenuItems.unshift({ id: 'feedback', label: 'Feedback', icon: 'MessageSquare', path: '/dashboard/feedback', roles: ['ALL'] })
  }

  menu.push(...commonMenuItems)

  // Add role-specific menu items
  switch (role) {
    case 'lecturer':
    case 'staff':
      menu.push(
        { id: 'my_feedback', label: 'My Feedback', icon: 'Inbox', path: '/dashboard/staff', roles: ['lecturer', 'staff'] }
      )
      break

    case 'hod':
      menu.push(
        { id: 'escalation_panel', label: 'Escalations', icon: 'AlertTriangle', path: '/dashboard/staff', roles: ['hod'] }
      )
      break

    case 'dean_faculty':
      menu.push(
        { id: 'dept_compare', label: 'Department Comparison', icon: 'Shuffle', path: '/dashboard/faculty', roles: ['dean_faculty'] },
        { id: 'escalated_cases', label: 'Escalated Cases', icon: 'AlertTriangle', path: '/dashboard/faculty', roles: ['dean_faculty'] }
      )
      break

    case 'dean_students':
      // For dean_students, replace Dashboard with Welfare Overview as first item
      menu[0] = { id: 'welfare_overview', label: 'Welfare Overview', icon: 'Heart', path: '/dashboard/students', roles: ['dean_students'] }
      menu.push(
        { id: 'confidential_cases', label: 'Confidential Cases', icon: 'Shield', path: '/dashboard/students', roles: ['dean_students'] },
        { id: 'referrals', label: 'Referrals', icon: 'ArrowRightCircle', path: '/dashboard/students', roles: ['dean_students'] },
        { id: 'appointments', label: 'Appointments', icon: 'Calendar', path: '/dashboard/appointments', roles: ['dean_students'] }
      )
      break

    case 'quality_assurance':
      menu.push(
        { id: 'university_overview', label: 'University Overview', icon: 'Map', path: '/dashboard/admin', roles: ['quality_assurance'] },
        { id: 'all_feedback', label: 'All Feedback', icon: 'Database', path: '/dashboard/admin', roles: ['quality_assurance'] },
        { id: 'performance_metrics', label: 'Performance Metrics', icon: 'Activity', path: '/dashboard/admin', roles: ['quality_assurance'] },
        { id: 'audit_logs', label: 'Audit Logs', icon: 'Clipboard', path: '/dashboard/admin', roles: ['quality_assurance'] }
      )
      break

    case 'admissions':
      menu.push(
        { id: 'admissions_complaints', label: 'Complaints', icon: 'AlertCircle', path: '/dashboard/admin', roles: ['admissions'] },
        { id: 'registration_issues', label: 'Registration Issues', icon: 'FileMinus', path: '/dashboard/admin', roles: ['admissions'] }
      )
      break

    case 'academic_affairs':
      menu.push(
        { id: 'policy_complaints', label: 'Policy Complaints', icon: 'FileText', path: '/dashboard/admin', roles: ['academic_affairs'] },
        { id: 'exam_issues', label: 'Exam Issues', icon: 'Edit', path: '/dashboard/admin', roles: ['academic_affairs'] }
      )
      break

    case 'counseling':
      menu.push(
        { id: 'confidential', label: 'Confidential Cases', icon: 'Lock', path: '/dashboard/admin', roles: ['counseling'] },
        { id: 'appointments', label: 'Appointments', icon: 'Calendar', path: '/dashboard/appointments', roles: ['counseling'] }
      )
      break

    case 'admin':
      menu.push(
        { id: 'roles_perms', label: 'Roles & Permissions', icon: 'Key', path: '/dashboard/settings/roles', roles: ['admin'] },
        { id: 'routing_cfg', label: 'Routing Config', icon: 'MapPin', path: '/dashboard/system?tab=routing', roles: ['admin'] },
        { id: 'system_logs', label: 'System Logs', icon: 'Terminal', path: '/dashboard/system?tab=logs', roles: ['admin'] }
      )
      break

    case 'src':
      // Prevent fall-through to default dashboard
      break

    default:
      // Default to staff dashboard for unknown roles
      menu.push(
        { id: 'default_dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard/staff', roles: ['ALL'] }
      )
  }

  return menu
}

// Legacy export for compatibility
const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', roles: ['ALL'] },
  { id: 'feedback', label: 'Feedback', icon: 'MessageSquare', path: '/dashboard/feedback', roles: ['ALL'] },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/dashboard/analytics', roles: ['ALL'] },
  { id: 'my_feedback', label: 'My Feedback', icon: 'Inbox', path: '/dashboard/staff', roles: ['lecturer', 'staff'] },
  { id: 'dept_overview', label: 'Department', icon: 'Grid', path: '/dashboard/staff', roles: ['lecturer', 'staff'] },
  { id: 'dept_dashboard', label: 'Department Dashboard', icon: 'Building', path: '/dashboard/staff', roles: ['hod'] },
  { id: 'escalation_panel', label: 'Escalations', icon: 'AlertTriangle', path: '/dashboard/staff', roles: ['hod'] },
  { id: 'faculty_overview', label: 'Faculty Overview', icon: 'Users', path: '/dashboard/faculty', roles: ['dean_faculty'] },
  { id: 'dept_compare', label: 'Department Comparison', icon: 'Shuffle', path: '/dashboard/faculty', roles: ['dean_faculty'] },
  { id: 'escalated_cases', label: 'Escalated Cases', icon: 'AlertTriangle', path: '/dashboard/faculty', roles: ['dean_faculty'] },
  { id: 'welfare_overview', label: 'Welfare Overview', icon: 'Heart', path: '/dashboard/students', roles: ['dean_students'] },
  { id: 'confidential_cases', label: 'Confidential Cases', icon: 'Shield', path: '/dashboard/students', roles: ['dean_students'] },
  { id: 'referrals', label: 'Referrals', icon: 'ArrowRightCircle', path: '/dashboard/students', roles: ['dean_students'] },
  { id: 'university_overview', label: 'University Overview', icon: 'Map', path: '/dashboard/admin', roles: ['quality_assurance'] },
  { id: 'all_feedback', label: 'All Feedback', icon: 'Database', path: '/dashboard/admin', roles: ['quality_assurance'] },
  { id: 'performance_metrics', label: 'Performance Metrics', icon: 'Activity', path: '/dashboard/admin', roles: ['quality_assurance'] },
  { id: 'audit_logs', label: 'Audit Logs', icon: 'Clipboard', path: '/dashboard/admin', roles: ['quality_assurance'] },
  { id: 'admissions_complaints', label: 'Complaints', icon: 'AlertCircle', path: '/dashboard/admin', roles: ['admissions'] },
  { id: 'registration_issues', label: 'Registration Issues', icon: 'FileMinus', path: '/dashboard/admin', roles: ['admissions'] },
  { id: 'policy_complaints', label: 'Policy Complaints', icon: 'FileText', path: '/dashboard/admin', roles: ['academic_affairs'] },
  { id: 'exam_issues', label: 'Exam Issues', icon: 'Edit', path: '/dashboard/admin', roles: ['academic_affairs'] },
  { id: 'confidential', label: 'Confidential Cases', icon: 'Lock', path: '/dashboard/admin', roles: ['counseling'] },
  { id: 'user_mgmt', label: 'User Management', icon: 'Users', path: '/dashboard/system', roles: ['admin'] },
  { id: 'roles_perms', label: 'Roles & Permissions', icon: 'Key', path: '/dashboard/system', roles: ['admin'] },
  { id: 'routing_cfg', label: 'Routing Config', icon: 'MapPin', path: '/dashboard/system?tab=routing', roles: ['admin'] },
  { id: 'system_logs', label: 'System Logs', icon: 'Terminal', path: '/dashboard/system?tab=logs', roles: ['admin'] },
]

export default MENU
