const mongoose = require('mongoose');

/**
 * Faculty model
 * Top of the university hierarchy: Faculty → Department → Student
 * Each faculty is headed by a Dean of Faculty.
 */
const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Faculty code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    dean: {
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

facultySchema.index({ faculty: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
