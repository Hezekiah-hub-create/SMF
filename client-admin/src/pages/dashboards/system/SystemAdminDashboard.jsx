import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import {
  BarChartWidget, PieChartWidget, LineChartWidget,
  AreaChartWidget, DonutChartWidget, ProgressCircle
} from '../../../components/dashboard/Charts'
import userService from '../../../services/userService'
import analyticsService from '../../../services/analyticsService'
import CustomSelect from '../../../components/ui/CustomSelect'
import { formatRelativeTime } from '../../../utils/helpers'
import '../../../components/ui/CustomSelect.css'

// Modern Icons - using inline SVGs to match other dashboards
const Icons = {
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  ),
  Building2: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M9 21v-6h6v6" /></svg>
  ),
  Route: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>
  ),
  ClipboardList: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
  ),
  BarChart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
  ),
  UserCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
  ),
  Filter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  ),
  RefreshCw: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  Trash2: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
  ),
}

// Department options for routing
const departmentOptions = [
  { value: 'facilities', label: 'Facilities', category: 'facility' },
  { value: 'academic', label: 'Academic', category: 'course_related' },
  { value: 'student_affairs', label: 'Student Affairs', category: 'welfare' },
  { value: 'it', label: 'IT Services', category: 'it_services' },
  { value: 'library', label: 'Library', category: 'facility' },
  { value: 'sports', label: 'Sports & Recreation', category: 'facility' },
  { value: 'admissions', label: 'Admissions', category: 'admission' },
  { value: 'academic_affairs', label: 'Academic Affairs', category: 'academic_affairs' },
  { value: 'counseling', label: 'Counseling', category: 'mental_health' },
  { value: 'quality_assurance', label: 'Quality Assurance', category: 'quality' },
]

// Role options for user creation
const roleOptions = [
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'hod', label: 'Head of Department' },
  { value: 'dean_faculty', label: 'Dean of Faculty' },
  { value: 'admin', label: 'System Administrator' },
  { value: 'dean_students', label: 'Dean of Students' },
  { value: 'quality_assurance', label: 'Quality Assurance' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'academic_affairs', label: 'Academic Affairs' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'staff', label: 'Staff' },
  { value: 'src', label: 'Student Representative' },
  { value: 'student', label: 'Student' },
  { value: 'finance', label: 'Finance' },
]

// Status options
const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

// Role permissions definition
const rolePermissions = {
  admin: {
    name: 'System Administrator',
    description: 'Full system access and control',
    permissions: ['manage_users', 'manage_roles', 'view_all_feedback', 'manage_routing', 'view_logs', 'system_settings', 'reports']
  },
  hod: {
    name: 'Head of Department',
    description: 'Department-level management',
    permissions: ['view_department_feedback', 'assign_feedback', 'respond_feedback', 'escalate_feedback', 'view_reports']
  },
  lecturer: {
    name: 'Lecturer',
    description: 'Course-related feedback handling',
    permissions: ['view_assigned_feedback', 'respond_feedback', 'view_own_reports']
  },
  dean_faculty: {
    name: 'Dean of Faculty',
    description: 'Faculty-wide oversight',
    permissions: ['view_faculty_feedback', 'assign_feedback', 'respond_feedback', 'escalate_feedback', 'view_reports', 'compare_departments']
  },
  dean_students: {
    name: 'Dean of Students',
    description: 'Student welfare management',
    permissions: ['view_welfare_feedback', 'respond_feedback', 'view_referrals', 'manage_appointments']
  },
  src: {
    name: 'Student Representative',
    description: 'Student voice representation',
    permissions: ['view_own_feedback', 'submit_feedback', 'view_reports']
  },
  quality_assurance: {
    name: 'Quality Assurance',
    description: 'University-wide quality monitoring',
    permissions: ['view_all_feedback', 'view_reports', 'view_audit_logs', 'export_data']
  },
  admissions: {
    name: 'Admissions',
    description: 'Admission-related feedback',
    permissions: ['view_admission_feedback', 'respond_feedback', 'view_reports']
  },
  academic_affairs: {
    name: 'Academic Affairs',
    description: 'Academic policy feedback',
    permissions: ['view_academic_feedback', 'respond_feedback', 'view_reports']
  },
  counseling: {
    name: 'Counseling',
    description: 'Mental health support',
    permissions: ['view_counseling_feedback', 'respond_feedback', 'view_appointments', 'confidential_cases']
  },
  staff: {
    name: 'Staff',
    description: 'General staff access',
    permissions: ['view_assigned_feedback', 'respond_feedback']
  },
  student: {
    name: 'Student',
    description: 'Student user access',
    permissions: ['submit_feedback', 'view_own_feedback']
  },
  finance: {
    name: 'Finance',
    description: 'Finance department access',
    permissions: ['view_finance_dashboard', 'view_reports']
  }
}

// Log action options
const logActionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'LOGIN_FAILED', label: 'Login Failed' },
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'USER_UPDATED', label: 'User Updated' },
  { value: 'USER_DELETED', label: 'User Deleted' },
  { value: 'USER_ACTIVATED', label: 'User Activated' },
  { value: 'USER_DEACTIVATED', label: 'User Deactivated' },
  { value: 'ROLE_CHANGED', label: 'Role Changed' },
  { value: 'FEEDBACK_SUBMITTED', label: 'Feedback Submitted' },
  { value: 'FEEDBACK_ROUTED', label: 'Feedback Routed' },
  { value: 'FEEDBACK_ESCALATED', label: 'Feedback Escalated' },
  { value: 'FEEDBACK_RESOLVED', label: 'Feedback Resolved' },
  { value: 'ROUTING_RULE_CREATED', label: 'Routing Rule Created' },
  { value: 'ROUTING_RULE_UPDATED', label: 'Routing Rule Updated' },
  { value: 'ROUTING_RULE_DELETED', label: 'Routing Rule Deleted' },
  { value: 'SETTINGS_CHANGED', label: 'Settings Changed' },
]

// Severity options
const severityOptions = [
  { value: '', label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'critical', label: 'Critical' },
]

// Color constants
const colors = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
}

const iconBgColors = {
  primary: '#eef2ff',
  success: '#ecfdf5',
  warning: '#fffbeb',
  danger: '#fef2f2',
  info: '#cffafe',
  purple: '#f3e8ff',
}

const SystemAdminDashboard = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tabParam = queryParams.get('tab')

  const [activeTab, setActiveTab] = useState(tabParam || 'overview')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const [showUserForm, setShowUserForm] = useState(false)
  const [showRoutingForm, setShowRoutingForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', role: 'lecturer', email: '', status: 'Active', department: '' })
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [routingKeyword, setRoutingKeyword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemUptime: 0,
    resolutionRate: 0,
    totalFeedback: 0,
    escalatedCases: 0,
  })
  const [users, setUsers] = useState([])
  const [faculties, setFaculties] = useState([])
  const [routingRules, setRoutingRules] = useState([
    { id: 1, keyword: 'lab', department: 'Academic', departmentId: 'academic' },
    { id: 2, keyword: 'equipment', department: 'Facilities', departmentId: 'facilities' },
    { id: 3, keyword: 'grade', department: 'Academic Affairs', departmentId: 'academic_affairs' },
    { id: 4, keyword: 'wifi', department: 'IT Services', departmentId: 'it' },
    { id: 5, keyword: 'admission', department: 'Admissions', departmentId: 'admissions' },
  ])
  const [feedbackByStatus, setFeedbackByStatus] = useState([])
  const [feedbackByRole, setFeedbackByRole] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // System logs state
  const [logsLoading, setLogsLoading] = useState(false)
  const [systemLogs, setSystemLogs] = useState([])
  const [logFilters, setLogFilters] = useState({
    action: '',
    severity: '',
    search: '',
    from: '',
    to: ''
  })
  const [logPagination, setLogPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Organization data state
  const [orgData, setOrgData] = useState(null)
  const [orgLoading, setOrgLoading] = useState(false)
  const [orgSubTab, setOrgSubTab] = useState('faculties')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Fetch routing rules when routing tab is active
  useEffect(() => {
    if (activeTab === 'routing') {
      fetchRoutingRules()
    }
  }, [activeTab])

  // Fetch organization data when organization tab is active
  useEffect(() => {
    if (activeTab === 'organization' && !orgData) {
      fetchOrgData()
    }
  }, [activeTab, orgData])

  const fetchOrgData = async () => {
    try {
      setOrgLoading(true)
      const data = await analyticsService.getOrganizationalStructure()
      setOrgData(data)
    } catch (error) {
      console.error('Failed to fetch organization data:', error)
    } finally {
      setOrgLoading(false)
    }
  }

  const fetchRoutingRules = async () => {
    try {
      const response = await analyticsService.getRoutingRules()
      if (response.rules && Array.isArray(response.rules)) {
        setRoutingRules(response.rules)
      }
    } catch (error) {
      console.warn('Could not fetch routing rules:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const systemData = await analyticsService.getSystemOverview()

      let usersArray = []
      try {
        const usersData = await userService.getUsers()
        if (Array.isArray(usersData)) {
          usersArray = usersData
        } else if (usersData && Array.isArray(usersData.data)) {
          usersArray = usersData.data
        } else if (usersData && usersData.users && Array.isArray(usersData.users)) {
          usersArray = usersData.users
        }
      } catch (userError) {
        console.warn('Could not fetch users:', userError)
        usersArray = []
      }

      setSystemMetrics({
        totalUsers: systemData?.users?.total || usersArray.length || 0,
        activeUsers: systemData?.users?.active || usersArray.filter(u => u.isActive).length || 0,
        systemUptime: 99.9,
        resolutionRate: systemData?.feedback?.resolutionRate || 0,
        totalFeedback: systemData?.feedback?.total || 0,
        escalatedCases: systemData?.feedback?.escalated || 0,
      })

      setUsers(Array.isArray(usersArray) ? usersArray : [])

      const facultyMap = {}
      usersArray.forEach(user => {
        if (user.faculty) {
          if (!facultyMap[user.faculty]) {
            facultyMap[user.faculty] = {
              name: user.faculty,
              departments: new Set(),
              staff: 0,
              feedback: 0
            }
          }
          facultyMap[user.faculty].staff++
          if (user.department) {
            facultyMap[user.faculty].departments.add(user.department)
          }
        }
      })

      const facultyList = Object.values(facultyMap).map(f => ({
        name: f.name,
        departments: f.departments.size,
        staff: f.staff,
        feedback: f.feedback
      }))

      setFaculties(facultyList)

      // Use real data from API for feedback by status
      if (systemData?.feedback) {
        setFeedbackByStatus([
          { name: 'New', value: systemData.feedback.new || 0, color: colors.primary },
          { name: 'In Progress', value: systemData.feedback.inProgress || 0, color: colors.warning },
          { name: 'Resolved', value: systemData.feedback.resolved || 0, color: colors.success },
          { name: 'Escalated', value: systemData.feedback.escalated || 0, color: colors.danger },
        ])
      }

      // Use real data from API for feedback by role
      if (systemData?.feedbackByRole) {
        const roleColors = [colors.primary, colors.success, colors.warning, colors.purple, colors.info];
        setFeedbackByRole(
          systemData.feedbackByRole.map((item, idx) => ({
            name: item._id || 'Unknown',
            value: item.count || 0,
            color: roleColors[idx % roleColors.length],
          }))
        )
      }

      // Use real data from API for recent activity
      if (systemData?.recentActivity) {
        setRecentActivity(
          systemData.recentActivity.map((item, idx) => ({
            id: item._id || idx,
            action: item.title || 'New feedback',
            user: item.submittedBy?.name || 'Unknown',
            role: item.submittedBy?.role || 'User',
            time: formatRelativeTime(item.createdAt),
            type: item.status === 'escalated' ? 'escalation' : 'feedback',
          }))
        )
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      await userService.createUser(newUser)
      alert('User created successfully!')
      setShowUserForm(false)
      setNewUser({ name: '', role: 'lecturer', email: '', status: 'Active', department: '' })
      fetchDashboardData()
    } catch (error) {
      alert(`Error creating user: ${error.message}`)
    }
  }

  const handleToggleUserStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId)
      fetchDashboardData()
    } catch (error) {
      alert(`Error updating user status: ${error.message}`)
    }
  }

  const handleAddRoutingRule = () => {
    if (!routingKeyword || !selectedDepartment) {
      alert('Please fill in all fields')
      return
    }
    const newRule = {
      id: routingRules.length + 1,
      keyword: routingKeyword,
      department: departmentOptions.find(d => d.value === selectedDepartment)?.label || selectedDepartment,
      departmentId: selectedDepartment,
    }
    setRoutingRules([...routingRules, newRule])
    setRoutingKeyword('')
    setSelectedDepartment('')
    setShowRoutingForm(false)
  }

  const handleDeleteRoutingRule = (id) => {
    setRoutingRules(routingRules.filter(r => r.id !== id))
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = !roleFilter || user.role === roleFilter
      const matchesStatus = !statusFilter ||
        (statusFilter === 'Active' ? user.isActive : !user.isActive)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const userStats = useMemo(() => {
    const total = users.length
    const active = users.filter(u => u.isActive).length
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})
    return { total, active, inactive: total - active, byRole }
  }, [users])

  // Fetch system logs when logs tab is active
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchSystemLogs()
    }
  }, [activeTab, logFilters, logPagination.page])

  const fetchSystemLogs = async () => {
    try {
      setLogsLoading(true)
      const params = {
        page: logPagination.page,
        limit: logPagination.limit,
        ...logFilters
      }
      const response = await analyticsService.getSystemLogs(params)
      setSystemLogs(response.logs || [])
      setLogPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Error fetching system logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleLogFilterChange = (key, value) => {
    setLogFilters(prev => ({ ...prev, [key]: value }))
    setLogPagination(prev => ({ ...prev, page: 1 }))
  }

  // Render Roles & Permissions Tab
  const renderRoles = () => (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Roles & Permissions</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>View all system roles and their associated permissions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {Object.entries(rolePermissions).map(([roleKey, roleData]) => {
          const roleColor = roleKey === 'admin' ? colors.danger :
            roleKey.includes('dean') ? colors.purple :
              roleKey === 'hod' ? colors.warning : colors.primary
          return (
            <div key={roleKey} style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: roleColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Key />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{roleData.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{roleData.description}</div>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Permissions</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {roleData.permissions.map((perm, idx) => (
                    <span key={idx} style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(99, 102, 241, 0.1)', color: colors.primary, borderRadius: '4px', fontWeight: '500' }}>
                      {perm.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Render System Logs Tab
  const renderLogs = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Icons.Filter />
          <span style={{ fontWeight: '600', color: '#1e293b' }}>Filters</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Search</label>
            <input
              type="text"
              placeholder="Search logs..."
              value={logFilters.search}
              onChange={(e) => handleLogFilterChange('search', e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Action Type</label>
            <CustomSelect
              value={logFilters.action}
              onChange={(value) => handleLogFilterChange('action', value)}
              options={logActionOptions}
              placeholder="All Actions"
              clearable={true}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Severity</label>
            <CustomSelect
              value={logFilters.severity}
              onChange={(value) => handleLogFilterChange('severity', value)}
              options={severityOptions}
              placeholder="All Severities"
              clearable={true}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Date From</label>
            <input
              type="date"
              value={logFilters.from}
              onChange={(e) => handleLogFilterChange('from', e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Date To</label>
            <input
              type="date"
              value={logFilters.to}
              onChange={(e) => handleLogFilterChange('to', e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>System Logs</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {systemLogs.length} of {logPagination.total} logs
            </span>
            <button onClick={fetchSystemLogs} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
              <Icons.RefreshCw /> Refresh
            </button>
          </div>
        </div>

        {logsLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading logs...</div>
        ) : systemLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No logs found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log, idx) => {
                  const severityColor = log.severity === 'error' || log.severity === 'critical' ? colors.danger :
                    log.severity === 'warning' ? colors.warning : colors.info
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '13px' }}>{log.userName || 'System'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{log.userRole || 'system'}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: colors.primary, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                          {log.action?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', maxWidth: '300px' }}>
                        {log.description || 'No description'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: `${severityColor}20`, color: severityColor, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize' }}>
                          {log.severity || 'info'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {logPagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
            <button
              onClick={() => setLogPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={logPagination.page === 1}
              style={{ padding: '8px 16px', background: logPagination.page === 1 ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: logPagination.page === 1 ? 'not-allowed' : 'pointer', color: logPagination.page === 1 ? '#94a3b8' : '#475569' }}
            >
              Previous
            </button>
            <span style={{ padding: '8px 16px', fontSize: '13px', color: '#64748b' }}>
              Page {logPagination.page} of {logPagination.pages}
            </span>
            <button
              onClick={() => setLogPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={logPagination.page >= logPagination.pages}
              style={{ padding: '8px 16px', background: logPagination.page >= logPagination.pages ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: logPagination.page >= logPagination.pages ? 'not-allowed' : 'pointer', color: logPagination.page >= logPagination.pages ? '#94a3b8' : '#475569' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
  const dynamicStats = [
    { title: 'Total Users', value: systemMetrics.totalUsers, icon: 'Users', color: '#6366f1', bg: '#eef2ff' },
    { title: 'Active Users', value: systemMetrics.activeUsers, icon: 'Activity', color: '#10b981', bg: '#ecfdf5' },
    { title: 'Resolution Rate', value: `${systemMetrics.resolutionRate}%`, icon: 'CheckCircle', color: '#8b5cf6', bg: '#f3e8ff' },
    { title: 'Escalated', value: systemMetrics.escalatedCases, icon: 'AlertTriangle', color: '#ef4444', bg: '#fef2f2' },
  ]

  // Pagination state for users
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Icons.BarChart },
    { id: 'users', label: 'Users', icon: Icons.Users },
    { id: 'organization', label: 'Organization', icon: Icons.Building2 },
    { id: 'routing', label: 'Routing Config', icon: Icons.Route },
    { id: 'logs', label: 'System Logs', icon: Icons.ClipboardList },
  ]

  // Render Overview Tab
  const renderOverview = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {dynamicStats.map((stat, idx) => {
          const IconComponent = Icons[stat.icon] || Icons.Users
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
          <PieChartWidget data={feedbackByStatus.length > 0 ? feedbackByStatus : [{ name: 'No Data', value: 1 }]} nameKey="name" valueKey="value" title="" height={280} />
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Feedback by Role</h3>
          <DonutChartWidget data={feedbackByRole.length > 0 ? feedbackByRole : [{ name: 'No Data', value: 1 }]} nameKey="name" valueKey="value" title="" height={280} />
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={() => { setActiveTab('users'); setShowUserForm(true); }} style={{ padding: '16px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>
              <Icons.Plus /> Add User
            </button>
            <button onClick={() => setActiveTab('routing')} style={{ padding: '16px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>
              <Icons.Route /> Routing
            </button>
            <button onClick={() => setActiveTab('users')} style={{ padding: '16px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>
              <Icons.Users /> Manage Users
            </button>
            <button style={{ padding: '16px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontWeight: '500', fontSize: '14px' }}>
              <Icons.BarChart /> Reports
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.slice(0, 5).map((activity, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activity.type === 'escalation' ? colors.danger : colors.primary }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{activity.action}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>by {activity.user} ({activity.role})</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )

  // Update filtered users with pagination
  const paginatedUsers = useMemo(() => {
    const start = (userPagination.page - 1) * userPagination.limit
    const end = start + userPagination.limit
    return filteredUsers.slice(start, end)
  }, [filteredUsers, userPagination.page, userPagination.limit])

  // Update filteredUserStats with pagination
  const filteredUserStats = useMemo(() => {
    const total = filteredUsers.length
    const active = filteredUsers.filter(u => u.isActive).length
    const pages = Math.ceil(total / userPagination.limit)
    return {
      total,
      active,
      inactive: total - active,
      pages
    }
  }, [filteredUsers, userPagination.limit])

  // Handle user pagination
  const handleUserPageChange = (newPage) => {
    setUserPagination(prev => ({ ...prev, page: newPage }))
  }

  // Render Users Tab
  const renderUsers = () => (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>User Management</h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{filteredUserStats.total} total users</p>
        </div>
        <button onClick={() => setShowUserForm(true)} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          + Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1.5', minWidth: '280px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setUserPagination(prev => ({ ...prev, page: 1 })); }}
              style={{ padding: '14px 14px 14px 48px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', width: '100%', outline: 'none', background: '#f8fafc' }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ minWidth: '180px' }}>
            <CustomSelect
              value={roleFilter}
              onChange={(value) => { setRoleFilter(value); setUserPagination(prev => ({ ...prev, page: 1 })); }}
              options={roleOptions}
              placeholder="All Roles"
              clearable={true}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '160px' }}>
            <CustomSelect
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); setUserPagination(prev => ({ ...prev, page: 1 })); }}
              options={statusOptions}
              placeholder="All Status"
              clearable={true}
            />
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '24px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Total:</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{filteredUserStats.total}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Active:</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{filteredUserStats.active}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Inactive:</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{filteredUserStats.inactive}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
      ) : paginatedUsers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No users found</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user._id || user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' }}>
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{user.email}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: colors.primary, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{user.department || 'N/A'}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ background: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.isActive ? colors.success : colors.danger, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '13px', fontWeight: '500', marginRight: '12px' }}>Edit</button>
                    <button onClick={() => handleToggleUserStatus(user._id || user.id)} style={{ background: 'none', border: 'none', color: user.isActive ? colors.danger : colors.success, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredUserStats.pages > 1 && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {((userPagination.page - 1) * userPagination.limit) + 1} to {Math.min(userPagination.page * userPagination.limit, filteredUserStats.total)} of {filteredUserStats.total} users
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleUserPageChange(userPagination.page - 1)}
              disabled={userPagination.page === 1}
              style={{ padding: '8px 16px', background: userPagination.page === 1 ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: userPagination.page === 1 ? 'not-allowed' : 'pointer', color: userPagination.page === 1 ? '#94a3b8' : '#475569', fontSize: '13px' }}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, filteredUserStats.pages) }, (_, i) => {
              let pageNum;
              if (filteredUserStats.pages <= 5) {
                pageNum = i + 1;
              } else if (userPagination.page <= 3) {
                pageNum = i + 1;
              } else if (userPagination.page >= filteredUserStats.pages - 2) {
                pageNum = filteredUserStats.pages - 4 + i;
              } else {
                pageNum = userPagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handleUserPageChange(pageNum)}
                  style={{ padding: '8px 14px', background: userPagination.page === pageNum ? colors.primary : '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: userPagination.page === pageNum ? '#fff' : '#475569', fontSize: '13px', fontWeight: userPagination.page === pageNum ? '600' : '400' }}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => handleUserPageChange(userPagination.page + 1)}
              disabled={userPagination.page >= filteredUserStats.pages}
              style={{ padding: '8px 16px', background: userPagination.page >= filteredUserStats.pages ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: userPagination.page >= filteredUserStats.pages ? 'not-allowed' : 'pointer', color: userPagination.page >= filteredUserStats.pages ? '#94a3b8' : '#475569', fontSize: '13px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Render Organization Tab
  const renderOrganization = () => {
    if (orgLoading) {
      return <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading organization data...</div>
    }
    if (!orgData) {
      return <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No organization data available</div>
    }
    return (
      <div>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>{orgData.summary?.totalFaculties || 0}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Faculties</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{orgData.summary?.totalDepartments || 0}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Departments</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{orgData.summary?.totalHODs || 0}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>HODs</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{orgData.summary?.totalLecturers || 0}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Lecturers</div>
          </div>
        </div>

        {/* Sub-tab Navigation for Organization */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <button onClick={() => setOrgSubTab('faculties')} style={{ padding: '10px 16px', border: 'none', background: orgSubTab === 'faculties' ? '#6366f1' : 'transparent', color: orgSubTab === 'faculties' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: orgSubTab === 'faculties' ? '600' : '400', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap' }}>
            Faculties & Departments
          </button>
          <button onClick={() => setOrgSubTab('hods')} style={{ padding: '10px 16px', border: 'none', background: orgSubTab === 'hods' ? '#6366f1' : 'transparent', color: orgSubTab === 'hods' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: orgSubTab === 'hods' ? '600' : '400', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap' }}>
            All HODs ({orgData.hods?.length || 0})
          </button>
          <button onClick={() => setOrgSubTab('lecturers')} style={{ padding: '10px 16px', border: 'none', background: orgSubTab === 'lecturers' ? '#6366f1' : 'transparent', color: orgSubTab === 'lecturers' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: orgSubTab === 'lecturers' ? '600' : '400', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap' }}>
            All Lecturers ({orgData.lecturers?.length || 0})
          </button>
        </div>

        {/* Sub-tab Content */}
        {orgSubTab === 'faculties' && (
          /* Faculty/Department List */
          orgData.faculties?.map((faculty, fIdx) => (
            <div key={fIdx} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ background: '#6366f1', padding: '16px 20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>{faculty.name} ({faculty.code})</h3>
                {faculty.dean && (
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Dean: {faculty.dean.name} ({faculty.dean.staffId})</p>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Departments ({faculty.departments?.length || 0})</h4>
                {faculty.departments?.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Code</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Department</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>HOD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculty.departments.map((dept, dIdx) => (
                        <tr key={dIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontSize: '13px', color: '#64748b' }}>{dept.code}</td>
                          <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b' }}>{dept.name}</td>
                          <td style={{ padding: '10px', fontSize: '13px', color: '#1e293b' }}>{dept.hod?.name || 'Not Assigned'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>No departments</p>
                )}
              </div>
            </div>
          ))
        )}

        {orgSubTab === 'hods' && (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>All Heads of Department (HODs)</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>List of all HODs across the university</p>
            </div>
            {orgData.hods?.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Staff ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Department</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {orgData.hods.map((hod, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{hod.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{hod.staffId || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{hod.department?.name || 'Not Assigned'}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6366f1' }}>{hod.email}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{hod.position || 'HOD'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No HODs found</div>
            )}
          </div>
        )}

        {orgSubTab === 'lecturers' && (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>All Lecturers</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>List of all lecturers across the university</p>
            </div>
            {orgData.lecturers?.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Staff ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Department</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Faculty</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {orgData.lecturers.map((lecturer, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{lecturer.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{lecturer.staffId || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{lecturer.department?.name || 'Not Assigned'}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{lecturer.faculty?.name || 'Not Assigned'}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6366f1' }}>{lecturer.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No lecturers found</div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render Routing Tab
  const renderRouting = () => (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Routing Rules Configuration</h3>
        <button onClick={() => setShowRoutingForm(true)} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          + Add Rule
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {routingRules.map(rule => (
          <div key={rule.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', gap: '16px' }}>
            <div style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: colors.primary, fontFamily: 'monospace' }}>
              {rule.keyword}
            </div>
            <span style={{ color: '#64748b' }}>→</span>
            <div style={{ flex: 1, fontWeight: '500', color: '#1e293b' }}>{rule.department}</div>
            <button onClick={() => handleDeleteRoutingRule(rule.id)} style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {showRoutingForm && (
        <div style={{ marginTop: '24px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Add New Routing Rule</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Keyword Pattern</label>
              <input type="text" placeholder="e.g., lab, equipment" value={routingKeyword} onChange={(e) => setRoutingKeyword(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Route To Department</label>
              <CustomSelect value={selectedDepartment} onChange={setSelectedDepartment} options={departmentOptions} placeholder="Select Department" searchable={true} clearable={true} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAddRoutingRule} style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Save Rule</button>
            <button onClick={() => setShowRoutingForm(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
          </div>
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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>System Administrator Panel</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Full control over system configuration and user management</p>
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
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'organization' && renderOrganization()}
            {activeTab === 'routing' && renderRouting()}
            {activeTab === 'logs' && renderLogs()}
          </>
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', maxWidth: '480px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Create New User</h2>
              <button onClick={() => setShowUserForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <Icons.X />
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Full Name</div>
                <input type="text" placeholder="Enter full name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</div>
                <input type="email" placeholder="Enter email address" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Role</div>
                <CustomSelect value={newUser.role} onChange={(value) => setNewUser({ ...newUser, role: value })} options={roleOptions} placeholder="Select Role" clearable={false} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Department</div>
                <input type="text" placeholder="Enter department" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={handleAddUser} style={{ flex: 1, background: '#6366f1', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Create User</button>
              <button onClick={() => setShowUserForm(false)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemAdminDashboard

