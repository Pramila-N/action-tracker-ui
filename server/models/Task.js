const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'rework_required', 'late_rework_required', 'completed', 'completed_late_rework', 'overdue'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    deadline: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskGroupId: { type: String, default: null }, // Links tasks assigned to multiple students
    timeSpent: { type: Number, default: 0 }, // Kept for backward compatibility
    progress: { type: Number, default: 0 }, // 0-100
    
    // Timer fields
    totalElapsedTime: { type: Number, default: 0 }, // Total time in seconds
    currentStartTime: { type: Date, default: null }, // When current session started
    isRunning: { type: Boolean, default: false }, // Is timer currently running

    submission: {
      fileName: { type: String, default: null },
      originalName: { type: String, default: null },
      mimeType: { type: String, default: null },
      size: { type: Number, default: null },
      uploadedAt: { type: Date, default: null },
    },
    
    // Time spent calculation (Submission Time - Task Assigned Time)
    submittedAt: { type: Date, default: null }, // When student submitted the task

    review: {
      remarks: { type: String, default: null },
      reviewedAt: { type: Date, default: null },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      status: { type: String, enum: ['accepted', 'rejected', null], default: null }, // Added review status
    },

    // Deadline notification tracking
    notifications: {
      twentyFourHoursBefore: { type: Boolean, default: false },
      twoHoursBefore: { type: Boolean, default: false },
      afterDeadline: { type: Boolean, default: false },
    },

    // Productivity score tracking
    isLate: { type: Boolean, default: false }, // Was the submission late?
    isEarly: { type: Boolean, default: false }, // Was the submission early?
    rejectionCount: { type: Number, default: 0 }, // Number of times rejected
  },
  { versionKey: false }
);

// Method to calculate current elapsed time including active session
taskSchema.methods.getCurrentElapsedTime = function() {
  if (this.isRunning && this.currentStartTime) {
    const sessionTime = Math.floor((Date.now() - this.currentStartTime.getTime()) / 1000);
    return this.totalElapsedTime + sessionTime;
  }
  return this.totalElapsedTime;
};

taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    
    // Add computed currentElapsedTime to response
    if (doc.isRunning && doc.currentStartTime) {
      const sessionTime = Math.floor((Date.now() - doc.currentStartTime.getTime()) / 1000);
      ret.currentElapsedTime = doc.totalElapsedTime + sessionTime;
    } else {
      ret.currentElapsedTime = doc.totalElapsedTime;
    }
    
    // Keep timeSpent in sync with totalElapsedTime for backward compatibility
    ret.timeSpent = ret.currentElapsedTime;
    
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
