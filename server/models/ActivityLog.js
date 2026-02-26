const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: [
      'task_created',
      'task_updated',
      'task_deleted',
      'progress_updated',
      'status_changed',
      'timer_started',
      'timer_stopped',
      'task_completed',
      'work_submitted',
      'review_submitted',
    ],
    required: true,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Stores what changed (e.g., { progress: { from: 20, to: 40 } })
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
activityLogSchema.index({ taskId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });

activityLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
