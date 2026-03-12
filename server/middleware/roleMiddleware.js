/**
 * Role Middleware
 * Provides authorize(...roles) to restrict routes to specific user roles.
 * Must be used AFTER the protect middleware (authMiddleware.js).
 */

/**
 * Authorize one or more roles.
 * Usage: router.get('/route', protect, authorize('admin', 'hod'), handler)
 *
 * @param {...string} roles  Allowed role strings
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not permitted to access this resource.`,
        requiredRoles: roles,
      });
    }

    next();
  };
};

/**
 * Convenience role groups aligned with the DFD hierarchy.
 */
const ROLES = {
  SYSTEM_ADMIN: ['admin'],
  FACULTY_LEVEL: ['dean_faculty', 'admin'],
  DEPARTMENT_LEVEL: ['hod', 'lecturer', 'dean_faculty', 'admin'],
  ADMIN_UNITS: ['admissions', 'quality_assurance', 'academic_affairs', 'counseling', 'admin'],
  WELFARE: ['dean_students', 'admin'],
  ALL_STAFF: [
    'admin', 'lecturer', 'hod', 'dean_faculty', 'dean_students',
    'admissions', 'quality_assurance', 'academic_affairs', 'counseling', 'src',
  ],
  STUDENT: ['student'],
};

module.exports = { authorize, ROLES };
