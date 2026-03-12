const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────
// Multer configuration for profile pictures
// ─────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/ID and password' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Optional role validation
    const validRoles = [
      'admin', 'lecturer', 'hod', 'dean_faculty', 'dean_students',
      'src', 'quality_assurance', 'admissions', 'academic_affairs', 'counseling', 'student',
    ];
    if (role && !validRoles.includes(role)) {
      return res.status(403).json({ message: 'Invalid role' });
    }

    // Resolve human-readable department & faculty names
    const { departmentName, facultyName } = await resolveOrgNames(
      user.department,
      user.faculty
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        staffId: user.staffId,
        position: user.position,
        phone: user.phone,
        department: departmentName,
        departmentId: user.department,
        faculty: facultyName,
        facultyId: user.faculty,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { role, fullName, email, phone, username, password, staffId, department } = req.body;

    if (!fullName || !email || !username || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check for existing email / username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken',
      });
    }

    const user = await User.create({
      name: fullName,
      email,
      username,
      password,
      role: role || 'student',
      phone: phone || null,
      staffId: staffId || null,
      department: department || null,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        faculty: user.faculty,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Resolve human-readable department & faculty names
    const { departmentName, facultyName } = await resolveOrgNames(
      user.department,
      user.faculty
    );

    // Fetch real feedback stats for this user
    const Feedback = require('../models/Feedback');
    const [feedbackCount, resolvedCount] = await Promise.all([
      Feedback.countDocuments({ submittedBy: user._id }),
      Feedback.countDocuments({ submittedBy: user._id, status: 'resolved' }),
    ]);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      role: user.role,
      staffId: user.staffId,
      position: user.position,
      department: departmentName,
      departmentId: user.department,
      faculty: facultyName,
      facultyId: user.faculty,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      feedbackCount,
      resolvedCount,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, username } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check username uniqueness if changing
    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } });
      if (taken) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    const { departmentName, facultyName } = await resolveOrgNames(
      user.department,
      user.faculty
    );

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      role: user.role,
      staffId: user.staffId,
      position: user.position,
      department: departmentName,
      departmentId: user.department,
      faculty: facultyName,
      facultyId: user.faculty,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    }

    const resetToken = generateToken(user._id, user.role, '1h');

    res.json({
      message: 'If the email exists, a reset link will be sent',
      resetToken, // Remove in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Upload profile picture
// @route   POST /api/auth/profile-picture
// @access  Private
// ─────────────────────────────────────────────────────────────────
const uploadProfilePicture = async (req, res) => {
  try {
    // Use the upload middleware
    upload.single('profilePicture')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image file' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update user's profile picture path
      // Store relative path for serving via static middleware
      const relativePath = `/uploads/profile-pictures/${req.file.filename}`;
      user.profilePicture = relativePath;
      await user.save();

      res.json({
        message: 'Profile picture updated successfully',
        profilePicture: relativePath
      });
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export upload middleware and controllers
module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  upload
};
