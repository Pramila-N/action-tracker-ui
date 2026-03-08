const mongoose = require('mongoose');

const taskForumMessageSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'faculty'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

taskForumMessageSchema.index({ taskId: 1, senderId: 1, createdAt: 1 });

taskForumMessageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;

    if (ret.senderId && typeof ret.senderId !== 'string' && ret.senderId._id) {
      ret.sender = {
        id: ret.senderId._id.toString(),
        name: ret.senderId.name,
        email: ret.senderId.email,
        role: ret.senderId.role,
      };
      ret.senderId = ret.senderId._id.toString();
    } else if (ret.senderId && typeof ret.senderId !== 'string') {
      ret.senderId = ret.senderId.toString();
    }

    return ret;
  },
});

module.exports = mongoose.model('TaskForumMessage', taskForumMessageSchema);
