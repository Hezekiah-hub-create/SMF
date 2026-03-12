const mongoose = require('mongoose');

/**
 * Response model — DFD P3 (Target Unit Processing) & P4 (Response & Resolution)
 * Each response is a message from a staff member on a feedback item.
 * The final response that resolves the feedback is flagged with isResolution = true.
 */
const responseSchema = new mongoose.Schema(
  {
    // ── Link to feedback ──────────────────────────────────────────
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: [true, 'Feedback reference is required'],
    },

    // ── Who responded ─────────────────────────────────────────────
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Responder is required'],
    },

    // ── Response content ──────────────────────────────────────────
    message: {
      type: String,
      required: [true, 'Response message is required'],
      trim: true,
      maxlength: [3000, 'Response cannot exceed 3000 characters'],
    },

    // ── P4: Is this the final resolution response? ────────────────
    isResolution: {
      type: Boolean,
      default: false,
    },

    // ── Internal note (not visible to student) ────────────────────
    isInternal: {
      type: Boolean,
      default: false,
    },

    // ── Status at time of response ────────────────────────────────
    statusAtResponse: {
      type: String,
      enum: ['new', 'routed', 'in_progress', 'resolved', 'escalated', 'closed'],
      default: 'in_progress',
    },

    // ── Attachments (future use) ──────────────────────────────────
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
responseSchema.index({ feedback: 1 });
responseSchema.index({ respondedBy: 1 });
responseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Response', responseSchema);
