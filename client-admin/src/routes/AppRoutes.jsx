import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardHome from '../pages/dashboard/DashboardHome';
import DepartmentStaffDashboard from '../pages/dashboards/staff/DepartmentStaffDashboard';
import FacultyDashboard from '../pages/dashboards/faculty/FacultyDashboard';
import DeanOfStudentsDashboard from '../pages/dashboards/students/DeanOfStudentsDashboard';
import AdminDashboard from '../pages/dashboards/admin/AdminDashboard';
import SystemAdminDashboard from '../pages/dashboards/system/SystemAdminDashboard';
import FinanceDashboard from '../pages/dashboards/finance/FinanceDashboard';
import SRCDashboard from '../pages/dashboards/src/SRCDashboard';
import AssignedFeedback from '../pages/feedback/AssignedFeedback';
import FeedbackDetail from '../pages/feedback/FeedbackDetail';
import Reports from '../pages/analytics/Reports';
import Notifications from '../pages/notifications/Notifications';
import Appointments from '../pages/appointments/Appointments';
import Profile from '../pages/settings/Profile';
import AccountSettings from '../pages/settings/AccountSettings';
import ChangePassword from '../pages/settings/ChangePassword';
import Help from '../pages/settings/Help';
import RolesPermissions from '../pages/settings/RolesPermissions';

// Helper function to get role-based dashboard path
const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/dashboard/system';
    case 'dean_faculty':
      return '/dashboard/faculty';
    case 'dean_students':
      return '/dashboard/students';
    case 'src':
      // SRC (Student Representative) gets their own dedicated dashboard
      return '/dashboard/src';
    case 'hod':
    case 'lecturer':
    case 'staff':
      return '/dashboard/staff';
    case 'finance':
      // Finance officers have their own dedicated dashboard
      return '/dashboard/finance';
    case 'admissions':
    case 'quality_assurance':
    case 'academic_affairs':
    case 'counseling':
      return '/dashboard/admin';
    default:
      return '/dashboard/staff';
  }
};

// Loading Spinner Component (shared)
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but user data is still loading, show spinner
  // This prevents infinite redirect when user is authenticated but user object is null
  if (!user) {
    return <LoadingSpinner />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading, token } = useAuth();

  // Show loading only when verifying an existing token
  if (loading && token) {
    return <LoadingSpinner />;
  }

  // Only redirect to dashboard if we have both authenticated state AND user data
  if (isAuthenticated && user) {
    const dashboardPath = getRoleDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Role-based redirect component for /dashboard root
const DashboardRootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    const dashboardPath = getRoleDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      
      {/* Dashboard Routes with Layout (Sidebar + Topbar) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff', 'finance', 'lecturer', 'hod', 'dean_faculty', 'dean_students', 'admissions', 'quality_assurance', 'academic_affairs', 'counseling', 'src']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Root dashboard redirects to role-specific dashboard */}
        <Route index element={<DashboardRootRedirect />} />
        
        {/* Role-specific dashboards */}
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'hod', 'staff']}>
              <DepartmentStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="src"
          element={
            <ProtectedRoute allowedRoles={['src']}>
              <SRCDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="faculty"
          element={
            <ProtectedRoute allowedRoles={['dean_faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="students" 
          element={
            <ProtectedRoute allowedRoles={['dean_students']}>
              <DeanOfStudentsDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin" 
          element={
            <ProtectedRoute allowedRoles={['admissions', 'quality_assurance', 'academic_affairs', 'counseling']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="system" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SystemAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="finance" 
          element={
            <ProtectedRoute allowedRoles={['finance']}>
              <FinanceDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Common pages accessible to all */}
        <Route path="feedback" element={<AssignedFeedback />} />
        <Route path="feedback/:id" element={<FeedbackDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="analytics" element={<Reports />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="settings" element={<Profile />} />
        <Route path="settings/profile" element={<Profile />} />
        <Route path="settings/account" element={<AccountSettings />} />
        <Route path="settings/password" element={<ChangePassword />} />
        <Route path="settings/roles" element={<RolesPermissions />} />
        <Route path="help" element={<Help />} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes
