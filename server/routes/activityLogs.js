const express = require('express');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

/**
 * GET /api/activity-logs
 * Get activity logs with optional filters
 * Query params: taskId, userId, action, limit
 */
router.get('/', async (req, res) => {
  try {
    const { taskId, userId, action, limit = 50 } = req.query;
    
    const filter = {};
    if (taskId) filter.taskId = taskId;
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email role')
      .populate('taskId', 'title status');

    return res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * GET /api/activity-logs/task/:taskId
 * Get all activity logs for a specific task
 */
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const logs = await ActivityLog.find({ taskId })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email role');

    return res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Fetch task activity logs error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * GET /api/activity-logs/user/:userId
 * Get all activity logs for a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const logs = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('taskId', 'title status');

    return res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Fetch user activity logs error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
