const express = require('express');
const router = express.Router();
const TaskSession = require('../models/TaskSession');
const Task = require('../models/Task');

/**
 * POST /api/task-sessions/start
 * Start a new time tracking session for a task
 * Body: { taskId, userId }
 */
router.post('/start', async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    if (!taskId || !userId) {
      return res.status(400).json({ message: 'taskId and userId are required.' });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Check for existing active session for this user and task
    const existingActiveSession = await TaskSession.findOne({
      taskId,
      userId,
      isActive: true,
    });

    if (existingActiveSession) {
      return res.status(400).json({ 
        message: 'An active session already exists for this task.',
        session: existingActiveSession,
      });
    }

    // Create new session
    const newSession = new TaskSession({
      taskId,
      userId,
      startTime: new Date(),
      isActive: true,
    });

    await newSession.save();

    // Update task status to in_progress if it's pending
    if (task.status === 'pending') {
      task.status = 'in_progress';
      await task.save();
    }

    return res.status(201).json({ 
      message: 'Session started successfully.',
      session: newSession,
    });
  } catch (error) {
    console.error('Start session error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * PUT /api/task-sessions/:sessionId/stop
 * Stop an active session and calculate duration
 */
router.put('/:sessionId/stop', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TaskSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (!session.isActive) {
      return res.status(400).json({ message: 'Session is already stopped.' });
    }

    // Set end time and calculate duration
    session.endTime = new Date();
    session.calculateDuration();
    await session.save();

    // Update task's cached timeSpent
    const totalDuration = await TaskSession.aggregate([
      { $match: { taskId: session.taskId, isActive: false } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);

    const totalTime = totalDuration.length > 0 ? totalDuration[0].total : 0;

    await Task.findByIdAndUpdate(session.taskId, {
      timeSpent: totalTime,
    });

    return res.json({ 
      message: 'Session stopped successfully.',
      session,
      totalTime,
    });
  } catch (error) {
    console.error('Stop session error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * GET /api/task-sessions/active
 * Get active session for a user and task
 * Query: userId, taskId
 */
router.get('/active', async (req, res) => {
  try {
    const { userId, taskId } = req.query;

    if (!userId || !taskId) {
      return res.status(400).json({ message: 'userId and taskId are required.' });
    }

    const activeSession = await TaskSession.findOne({
      userId,
      taskId,
      isActive: true,
    }).populate('taskId', 'title status');

    return res.json({ session: activeSession });
  } catch (error) {
    console.error('Get active session error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * GET /api/task-sessions
 * Get all sessions for a task
 * Query: taskId
 */
router.get('/', async (req, res) => {
  try {
    const { taskId, userId } = req.query;

    const filter = {};
    if (taskId) filter.taskId = taskId;
    if (userId) filter.userId = userId;

    const sessions = await TaskSession.find(filter)
      .sort({ startTime: -1 })
      .populate('userId', 'name email')
      .populate('taskId', 'title');

    // Calculate total duration
    const totalDuration = sessions
      .filter(s => !s.isActive)
      .reduce((sum, session) => sum + session.duration, 0);

    return res.json({ 
      sessions,
      totalDuration,
      sessionCount: sessions.length,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * GET /api/task-sessions/task/:taskId/total-time
 * Calculate total time spent on a task from all sessions
 */
router.get('/task/:taskId/total-time', async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await TaskSession.aggregate([
      { 
        $match: { 
          taskId: require('mongoose').Types.ObjectId(taskId),
          isActive: false,
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
        } 
      },
    ]);

    const totalTime = result.length > 0 ? result[0].totalTime : 0;
    const sessionCount = result.length > 0 ? result[0].sessionCount : 0;

    return res.json({ 
      taskId,
      totalTime,
      sessionCount,
    });
  } catch (error) {
    console.error('Get total time error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

/**
 * DELETE /api/task-sessions/:sessionId
 * Delete a session (admin/cleanup purposes)
 */
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TaskSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const taskId = session.taskId;
    await TaskSession.findByIdAndDelete(sessionId);

    // Recalculate task's total time
    const totalDuration = await TaskSession.aggregate([
      { $match: { taskId, isActive: false } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);

    const totalTime = totalDuration.length > 0 ? totalDuration[0].total : 0;

    await Task.findByIdAndUpdate(taskId, {
      timeSpent: totalTime,
    });

    return res.json({ 
      message: 'Session deleted successfully.',
      totalTime,
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
