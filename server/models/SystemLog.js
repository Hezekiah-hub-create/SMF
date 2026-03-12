/**
 * SystemLog Model
 * Tracks user actions and system events for audit purposes.
 */

const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system-generated events
  },
  userName: {
    type: String,
    default: 'System'
  },
  userRole: {
    type: String,
    default: 'system'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_ACTIVATED',
      'USER_DEACTIVATED',
      'ROLE_CHANGED',
      'FEEDBACK_SUBMITTED',
      'FEEDBACK_ASSIGNED',
      'FEEDBACK_ROUTED',
      'FEEDBACK_ESCALATED',
      'FEEDBACK_RESOLVED',
      'FEEDBACK_REOPENED',
      'FEEDBACK_DELETED',
      'ROUTING_RULE_CREATED',
      'ROUTING_RULE_UPDATED',
      'ROUTING_RULE_DELETED',
      'SYSTEM_ERROR',
      'BACKUP_CREATED',
      'SETTINGS_CHANGED',
      'PERMISSION_CHANGED',
      'REPORT_GENERATED',
      'EXPORT_PERFORMED'
    ]
  },
  resourceType: {
    type: String,
    enum: ['user', 'feedback', 'routing', 'system', 'report', 'settings', 'auth'],
    default: 'system'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'warning'],
    default: 'success'
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ userId: 1, createdAt: -1 });
systemLogSchema.index({ action: 1, createdAt: -1 });
systemLogSchema.index({ resourceType: 1, createdAt: -1 });
systemLogSchema.index({ severity: 1, createdAt: -1 });

// Static method to create log entry
systemLogSchema.statics.log = async function(data) {
  try {
    const logEntry = await this.create(data);
    return logEntry;
  } catch (error) {
    console.error('Failed to create system log:', error.message);
    // Don't throw - logging failure shouldn't break the main operation
    return null;
  }
};

// Static method to log user action
systemLogSchema.statics.logUserAction = async function(user, action, description, metadata = {}) {
  return this.log({
    userId: user._id || user.id,
    userName: user.name,
    userRole: user.role,
    action,
    description,
    metadata,
    resourceType: 'user',
    status: 'success'
  });
};

module.exports = mongoose.model('SystemLog', systemLogSchema);

