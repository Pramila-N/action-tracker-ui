const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: [
        'task_created', 
        'task_updated', 
        'task_deleted', 
        'work_submitted', 
        'review_submitted',
        'task_submitted',
        'task_accepted',
        'task_rejected',
        'deadline_reminder'
      ], 
      required: true 
    },
    message: { type: String, required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

notificationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

// Index to help with duplicate prevention queries
notificationSchema.index({ userId: 1, taskId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
