/**
 * User Controller
 * Handles user management for the System Admin dashboard.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────
// Helper: resolve department & faculty names from stored ObjectId strings
// ─────────────────────────────────────────────────────────────────
const resolveOrgNames = async (departmentId, facultyId) => {
  let departmentName = null;
  let facultyName = null;

  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    const dept = await Department.findById(departmentId).select('name code');
    if (dept) departmentName = dept.name;
  } else if (departmentId) {
    // Already a plain string name
    departmentName = departmentId;
  }

  if (facultyId && mongoose.Types.ObjectId.isValid(facultyId)) {
    const fac = await Faculty.findById(facultyId).select('name code');
    if (fac) facultyName = fac.name;
  } else if (facultyId) {
    facultyName = facultyId;
  }

  return { departmentName, facultyName };
};

// ─────────────────────────────────────────────────────────────────
// GET all users
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get all users (with optional role/department filter)
 * @route   GET /api/users
 * @access  Private (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, department, faculty, isActive, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (faculty) filter.faculty = faculty;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    // Resolve department and faculty names for each user
    const usersWithResolvedNames = await Promise.all(
      users.map(async (user) => {
        const { departmentName, facultyName } = await resolveOrgNames(
          user.department,
          user.faculty
        );
        return {
          ...user.toObject(),
          department: departmentName || user.department,
          faculty: facultyName || user.faculty,
        };
      })
    );

    res.json({
      users: usersWithResolvedNames,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET user by ID
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (admin only)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Resolve department and faculty names
    const { departmentName, facultyName } = await resolveOrgNames(
      user.department,
      user.faculty
    );

    res.json({
      ...user.toObject(),
      department: departmentName || user.department,
      faculty: facultyName || user.faculty,
    });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// CREATE user (admin)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new user (admin action)
 * @route   POST /api/users
 * @access  Private (admin only)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, username, password, role, staffId, department, faculty, phone, position } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username: username || null }] });
    if (existing) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const user = await User.create({
      name,
      email,
      username: username || undefined,
      password,
      role,
      staffId: staffId || undefined,
      department: department || null,
      faculty: faculty || null,
      phone: phone || null,
      position: position || null,
      isActive: true,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        department: user.department,
        faculty: user.faculty,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// UPDATE user
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Update user details
 * @route   PUT /api/users/:id
 * @access  Private (admin only)
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, faculty, phone, position, staffId, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (faculty !== undefined) user.faculty = faculty;
    if (phone !== undefined) user.phone = phone;
    if (position !== undefined) user.position = position;
    if (staffId !== undefined) user.staffId = staffId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        faculty: user.faculty,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// DEACTIVATE / ACTIVATE user
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Toggle user active status
 * @route   PUT /api/users/:id/toggle-status
 * @access  Private (admin only)
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, name: user.name, isActive: user.isActive },
    });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE user (hard delete — admin only)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET users by role (utility for dropdowns)
// ─────────────────────────────────────────────────────────────────

/**
 * @desc    Get users grouped by role (for admin dropdowns)
 * @route   GET /api/users/by-role
 * @access  Private (admin only)
 */
const getUsersByRole = async (req, res) => {
  try {
    const roles = [
      'admin', 'lecturer', 'hod', 'dean_faculty', 'dean_students',
      'admissions', 'quality_assurance', 'academic_affairs', 'counseling', 'src', 'student',
    ];

    const grouped = {};
    await Promise.all(
      roles.map(async (role) => {
        const users = await User.find({ role, isActive: true }).select('name email department faculty');
        
        // Resolve department and faculty names for each user
        const usersWithResolvedNames = await Promise.all(
          users.map(async (user) => {
            const { departmentName, facultyName } = await resolveOrgNames(
              user.department,
              user.faculty
            );
            return {
              ...user.toObject(),
              department: departmentName || user.department,
              faculty: facultyName || user.faculty,
            };
          })
        );
        
        grouped[role] = usersWithResolvedNames;
      })
    );

    res.json(grouped);
  } catch (error) {
    console.error('getUsersByRole error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Reset user password (admin action)
 * @route   PUT /api/users/:id/reset-password
 * @access  Private (admin only)
 */
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('resetUserPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update user's push notification token (for mobile app)
 * @route   PUT /api/users/push-token
 * @access  Private (authenticated user)
 */
const updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    
    if (!pushToken) {
      return res.status(400).json({ message: 'Push token is required' });
    }

    // Update the current user's push token
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pushToken = pushToken;
    await user.save();

    res.json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('updatePushToken error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUsersByRole,
  resetUserPassword,
  updatePushToken,
};
