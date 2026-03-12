/**
 * Analytics Controller
 * Provides role-scoped statistics and reports for all dashboards.
 */

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Response = require('../models/Response');
const SystemLog = require('../models/SystemLog');

// In-memory storage for routing rules (can be moved to DB later)
let routingRules = [
  { id: 1, keyword: 'lab', department: 'Academic', departmentId: 'academic', category: 'course_related' },
  { id: 2, keyword: 'equipment', department: 'Facilities', departmentId: 'facilities', category: 'facility' },
  { id: 3, keyword: 'grade', department: 'Academic Affairs', departmentId: 'academic_affairs', category: 'academic_affairs' },
  { id: 4, keyword: 'wifi', department: 'IT Services', departmentId: 'it', category: 'it_services' },
  { id: 5, keyword: 'admission', department: 'Admissions', departmentId: 'admissions', category: 'admission' },
  { id: 6, keyword: 'counseling', department: 'Counseling', departmentId: 'counseling', category: 'mental_health' },
  { id: 7, keyword: 'hostel', department: 'Student Affairs', departmentId: 'student_affairs', category: 'welfare' },
  { id: 8, keyword: 'exam', department: 'Academic Affairs', departmentId: 'academic_affairs', category: 'academic_affairs' },
];

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Build a base filter scoped to the requesting user's role.
 */
const buildScopeFilter = (user) => {
  const { role, department, faculty } = user;
  switch (role) {
    case 'lecturer':
      return { category: 'course_related', department: department || null };
    case 'hod':
      return { $or: [{ routedTo: 'hod' }, { department: department || null }] };
    case 'dean_faculty':
      return { $or: [{ routedTo: 'dean_faculty' }, { faculty: faculty || null }] };
    case 'dean_students':
      return { routedTo: 'dean_students' };
    case 'admissions':
      return { routedTo: 'admissions' };
    case 'quality_assurance':
    case 'admin':
    case 'src':
      return {}; // university-wide
    case 'academic_affairs':
      return { routedTo: 'academic_affairs' };
    case 'counseling':
      return { routedTo: 'counseling' };
    default:
      return { submittedBy: user._id };
  }
};

// ─────────────────────────────────────────────────────────────────
// Dashboard Stats
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get dashboard analytics summary
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const filter = buildScopeFilter(req.user);

    const [
      total,
      statusBreakdown,
      categoryBreakdown,
      priorityBreakdown,
      escalatedCount,
      resolvedThisMonth,
      totalThisMonth,
      avgResolutionData,
    ] = await Promise.all([
      // Total feedback in scope
      Feedback.countDocuments(filter),

      // By status
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // By category
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),

      // By priority
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Escalated count
      Feedback.countDocuments({ ...filter, isEscalated: true }),

      // Resolved this month
      Feedback.countDocuments({
        ...filter,
        status: 'resolved',
        resolvedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),

      // Total submitted this month
      Feedback.countDocuments({
        ...filter,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),

      // Average resolution time (in hours) for resolved feedback
      Feedback.aggregate([
        {
          $match: {
            ...filter,
            status: 'resolved',
            resolvedAt: { $ne: null },
          },
        },
        {
          $project: {
            resolutionHours: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60, // ms → hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: '$resolutionHours' },
          },
        },
      ]),
    ]);

    // Flatten arrays to maps
    const statusMap = {};
    statusBreakdown.forEach(({ _id, count }) => { statusMap[_id] = count; });

    const categoryMap = {};
    categoryBreakdown.forEach(({ _id, count }) => { categoryMap[_id] = count; });

    const priorityMap = {};
    priorityBreakdown.forEach(({ _id, count }) => { priorityMap[_id] = count; });

    const resolved = statusMap['resolved'] || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgResolutionHours =
      avgResolutionData.length > 0
        ? Math.round(avgResolutionData[0].avgHours * 10) / 10
        : null;

    res.json({
      total,
      new: statusMap['new'] || 0,
      routed: statusMap['routed'] || 0,
      inProgress: statusMap['in_progress'] || 0,
      resolved,
      escalated: escalatedCount,
      closed: statusMap['closed'] || 0,
      resolutionRate,
      avgResolutionHours,
      thisMonth: {
        total: totalThisMonth,
        resolved: resolvedThisMonth,
      },
      byStatus: statusMap,
      byCategory: categoryMap,
      byPriority: priorityMap,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get detailed reports
 * @route   GET /api/analytics/reports
 * @access  Private
 */
const getReports = async (req, res) => {
  try {
    const { from, to, groupBy = 'month' } = req.query;
    const filter = buildScopeFilter(req.user);

    // Date range filter
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // Group by month or week
    const dateGroupExpr =
      groupBy === 'week'
        ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
        : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };

    const [trendData, departmentBreakdown, routingBreakdown, topCategories] =
      await Promise.all([
        // Trend over time
        Feedback.aggregate([
          { $match: filter },
          {
            $group: {
              _id: dateGroupExpr,
              total: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
              },
              escalated: {
                $sum: { $cond: ['$isEscalated', 1, 0] },
              },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
        ]),

        // By department (admin/QA only)
        ['admin', 'quality_assurance'].includes(req.user.role)
          ? Feedback.aggregate([
              { $match: filter },
              {
                $lookup: {
                  from: 'departments',
                  localField: 'department',
                  foreignField: '_id',
                  as: 'deptInfo',
                },
              },
              { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: '$deptInfo.name',
                  total: { $sum: 1 },
                  resolved: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
                  },
                },
              },
              { $sort: { total: -1 } },
              { $limit: 10 },
            ])
          : Promise.resolve([]),

        // By routing target
        Feedback.aggregate([
          { $match: filter },
          { $group: { _id: '$routedTo', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Top categories
        Feedback.aggregate([
          { $match: filter },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    res.json({
      trend: trendData,
      byDepartment: departmentBreakdown,
      byRoutingTarget: routingBreakdown,
      byCategory: topCategories,
    });
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Feedback Statistics (summary for widgets)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get feedback statistics summary
 * @route   GET /api/analytics/feedback-stats
 * @access  Private
 */
const getFeedbackStats = async (req, res) => {
  try {
    const filter = buildScopeFilter(req.user);

    const [total, resolved, escalated, inProgress, newCount] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.countDocuments({ ...filter, status: 'resolved' }),
      Feedback.countDocuments({ ...filter, isEscalated: true }),
      Feedback.countDocuments({ ...filter, status: 'in_progress' }),
      Feedback.countDocuments({ ...filter, status: 'new' }),
    ]);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      total,
      new: newCount,
      inProgress,
      resolved,
      escalated,
      resolutionRate,
    });
  } catch (error) {
    console.error('getFeedbackStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// System-wide overview (admin / QA only)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get system-wide overview metrics
 * @route   GET /api/analytics/system
 * @access  Private (admin, quality_assurance)
 */
const getSystemOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalFeedback,
      resolvedFeedback,
      escalatedFeedback,
      feedbackByRole,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'resolved' }),
      Feedback.countDocuments({ isEscalated: true }),
      // Feedback count per routing target
      Feedback.aggregate([
        { $group: { _id: '$routedTo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Last 10 feedback items
      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('submittedBy', 'name role')
        .populate('assignedTo', 'name role')
        .select('title category status priority createdAt routedTo'),
    ]);

    const resolutionRate =
      totalFeedback > 0 ? Math.round((resolvedFeedback / totalFeedback) * 100) : 0;

    res.json({
      users: { total: totalUsers, active: activeUsers },
      feedback: {
        total: totalFeedback,
        resolved: resolvedFeedback,
        escalated: escalatedFeedback,
        resolutionRate,
      },
      feedbackByRole,
      recentActivity,
    });
  } catch (error) {
    console.error('getSystemOverview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Routing Rules Management (Admin only)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get routing rules configuration
 * @route   GET /api/analytics/routing-rules
 * @access  Private (admin)
 */
const getRoutingRules = async (req, res) => {
  try {
    res.json({ rules: routingRules });
  } catch (error) {
    console.error('getRoutingRules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update routing rules configuration
 * @route   PUT /api/analytics/routing-rules
 * @access  Private (admin)
 */
const updateRoutingRules = async (req, res) => {
  try {
    const { rules } = req.body;
    
    if (!Array.isArray(rules)) {
      return res.status(400).json({ message: 'Rules must be an array' });
    }
    
    // Validate each rule
    const validatedRules = rules.map((rule, index) => ({
      id: rule.id || index + 1,
      keyword: rule.keyword?.toLowerCase().trim(),
      department: rule.department,
      departmentId: rule.departmentId,
      category: rule.category
    })).filter(rule => rule.keyword && rule.department);
    
    routingRules = validatedRules;
    
    // Log the action
    await SystemLog.log({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ROUTING_RULE_UPDATED',
      description: `Updated routing rules configuration (${validatedRules.length} rules)`,
      resourceType: 'routing',
      status: 'success',
      severity: 'info'
    });
    
    res.json({ 
      message: 'Routing rules updated successfully',
      rules: routingRules 
    });
  } catch (error) {
    console.error('updateRoutingRules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// System Logs (Admin only)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get system logs with filters
 * @route   GET /api/analytics/system-logs
 * @access  Private (admin)
 */
const getSystemLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      resourceType, 
      severity,
      userId,
      from,
      to,
      search 
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (action) {
      filter.action = action;
    }
    
    if (resourceType) {
      filter.resourceType = resourceType;
    }
    
    if (severity) {
      filter.severity = severity;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      SystemLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SystemLog.countDocuments(filter)
    ]);
    
    // Get statistics
    const [statsByAction, statsBySeverity] = await Promise.all([
      SystemLog.aggregate([
        { $match: filter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      SystemLog.aggregate([
        { $match: filter },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        byAction: statsByAction,
        bySeverity: statsBySeverity
      }
    });
  } catch (error) {
    console.error('getSystemLogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Organizational Structure (Admin only)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get faculties, departments, HODs and lecturers
 * @route   GET /api/analytics/organizational-structure
 * @access  Private (admin, quality_assurance)
 */
const getOrganizationalStructure = async (req, res) => {
  try {
    const Faculty = require('../models/Faculty');
    const Department = require('../models/Department');
    
    // Get all faculties with their deans
    const faculties = await Faculty.find({ isActive: true })
      .populate('dean', 'name email staffId')
      .sort({ name: 1 });
    
    // Get all departments with their HODs
    const departments = await Department.find({ isActive: true })
      .populate('hod', 'name email staffId')
      .populate('faculty', 'name code')
      .sort({ name: 1 });
    
    // Get all HODs
    const hods = await User.find({ role: 'hod', isActive: true })
      .select('name email staffId department position')
      .populate('department', 'name code')
      .sort({ name: 1 });
    
    // Get all Lecturers
    const lecturers = await User.find({ role: 'lecturer', isActive: true })
      .select('name email staffId department faculty position')
      .populate('department', 'name code')
      .populate('faculty', 'name code')
      .sort({ name: 1 });
    
    // Group departments by faculty
    const departmentsByFaculty = {};
    departments.forEach(dept => {
      const facultyName = dept.faculty?.name || 'Unknown Faculty';
      if (!departmentsByFaculty[facultyName]) {
        departmentsByFaculty[facultyName] = [];
      }
      departmentsByFaculty[facultyName].push({
        id: dept._id,
        name: dept.name,
        code: dept.code,
        hod: dept.hod
      });
    });
    
    // Build response structure
    const facultyData = faculties.map(faculty => ({
      id: faculty._id,
      name: faculty.name,
      code: faculty.code,
      dean: faculty.dean,
      departments: departmentsByFaculty[faculty.name] || []
    }));
    
    res.json({
      summary: {
        totalFaculties: faculties.length,
        totalDepartments: departments.length,
        totalHODs: hods.length,
        totalLecturers: lecturers.length
      },
      faculties: facultyData,
      hods: hods,
      lecturers: lecturers
    });
  } catch (error) {
    console.error('getOrganizationalStructure error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export all functions - moved AFTER all function definitions
module.exports = {
  getDashboardStats,
  getReports,
  getFeedbackStats,
  getSystemOverview,
  getRoutingRules,
  updateRoutingRules,
  getSystemLogs,
  getOrganizationalStructure,
};
