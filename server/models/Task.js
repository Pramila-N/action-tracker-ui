const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'overdue'],
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
    timeSpent: { type: Number, default: 0 }, // Kept for backward compatibility
    progress: { type: Number, default: 0 },
    
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
    review: {
      remarks: { type: String, default: null },
      reviewedAt: { type: Date, default: null },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
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
