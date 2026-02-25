const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
