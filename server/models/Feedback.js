const mongoose = require('mongoose');

/**
 * Feedback categories map directly to DFD P2 routing:
 *  course_related  → Department (Lecturer / HOD)
 *  faculty_wide    → Faculty (Dean of Faculty)
 *  welfare         → Dean of Students
 *  admission       → Admissions Office
 *  quality         → QA Unit
 *  mental_health   → Counseling Unit
 */
const CATEGORIES = [
  'course_related',
  'faculty_wide',
  'welfare',
  'admission',
  'quality',
  'mental_health',
];

const STATUSES = [
  'new',          // P1 — just submitted
  'routed',       // P2 — auto-routed to target unit
  'in_progress',  // P3 — target unit is investigating
  'resolved',     // P4 — response sent, case closed
  'escalated',    // P5 — unresolved, escalated to faculty
  'closed',       // Manually closed by admin
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// Routing targets aligned with User.role enum
const ROUTED_TO_ROLES = [
  'lecturer',
  'hod',
  'dean_faculty',
  'dean_students',
  'admissions',
  'quality_assurance',
  'counseling',
  'academic_affairs',
  'admin',
];

const feedbackSchema = new mongoose.Schema(
  {
    // ── Core content ──────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // ── DFD P2 routing category ───────────────────────────────────
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },

    // ── Submission (P1) ───────────────────────────────────────────
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null when anonymous
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // ── Organisational context ────────────────────────────────────
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },

    // ── DFD P2 — Routing ─────────────────────────────────────────
    routedTo: {
      type: String,
      enum: ROUTED_TO_ROLES,
      default: null,
    },
    assignedTo: {
      // Specific staff member assigned to handle this
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    routedAt: {
      type: Date,
      default: null,
    },

    // ── Status & Priority ─────────────────────────────────────────
    status: {
      type: String,
      enum: STATUSES,
      default: 'new',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'medium',
    },

    // ── DFD P5 — Escalation ───────────────────────────────────────
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0, // 0 = not escalated, 1 = HOD, 2 = Dean of Faculty
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── DFD P4 — Resolution ───────────────────────────────────────
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
    },

    // ── Notifications sent flag ───────────────────────────────────
    notificationSent: {
      type: Boolean,
      default: false,
    },

    // ── Optional metadata ────────────────────────────────────────
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    // ── Audit trail ───────────────────────────────────────────────
    statusHistory: [
      {
        status: { type: String, enum: STATUSES },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ routedTo: 1 });
feedbackSchema.index({ submittedBy: 1 });
feedbackSchema.index({ department: 1 });
feedbackSchema.index({ faculty: 1 });
feedbackSchema.index({ isEscalated: 1 });
feedbackSchema.index({ createdAt: -1 });

// ── Virtuals ─────────────────────────────────────────────────────
feedbackSchema.virtual('responses', {
  ref: 'Response',
  localField: '_id',
  foreignField: 'feedback',
});

// ── Pre-save: push status change to history ───────────────────────
feedbackSchema.pre('save', function () {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
});

// ── Statics ───────────────────────────────────────────────────────
feedbackSchema.statics.CATEGORIES = CATEGORIES;
feedbackSchema.statics.STATUSES = STATUSES;
feedbackSchema.statics.PRIORITIES = PRIORITIES;

module.exports = mongoose.model('Feedback', feedbackSchema);
