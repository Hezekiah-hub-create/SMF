const mongoose = require('mongoose');

/**
 * Department model
 * Each department belongs to a Faculty and is headed by an HOD.
 * University hierarchy: Student → Department → Faculty
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
    },
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

departmentSchema.index({ faculty: 1 });

module.exports = mongoose.model('Department', departmentSchema);
