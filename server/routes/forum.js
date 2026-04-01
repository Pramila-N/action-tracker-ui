const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const TaskForumMessage = require('../models/TaskForumMessage');
const Notification = require('../models/Notification');
const { authenticateJWT } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  forumTaskParamSchema,
  forumStatusQuerySchema,
  forumMessageBodySchema,
} = require('../validation/schemas');

const router = express.Router();
router.use(authenticateJWT);
const STUDENT_DAILY_LIMIT = 3;
const FINAL_TASK_STATUSES = new Set(['completed', 'completed_late_rework']);

const getForumStatusFromTask = (task) => {
  const fallbackExpiresAt = task.deadline
    ? new Date(task.deadline)
    : new Date(new Date(task.createdAt).getTime() + 48 * 60 * 60 * 1000);

  // Keep discussion open for active tasks, even if created earlier.
  const isOpen = !FINAL_TASK_STATUSES.has(task.status);

  return {
    isOpen,
    expiresAt: fallbackExpiresAt,
    message: isOpen ? 'Forum is open for this active task.' : 'This discussion forum is closed.',
  };
};

const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getTaskAndParticipant = async (taskId, userId) => {
  const [task, user] = await Promise.all([
    Task.findById(taskId).select('assignedTo createdBy createdAt deadline status taskGroupId title'),
    User.findById(userId).select('name email role'),
  ]);

  if (!task) {
    return { error: { status: 404, message: 'Task not found.' } };
  }

  if (!user) {
    return { error: { status: 404, message: 'User not found.' } };
  }

  const userIdText = user._id.toString();
  const isAssignedStudent = user.role === 'student' && task.assignedTo.toString() === userIdText;
  const isTaskFaculty = user.role === 'faculty' && task.createdBy.toString() === userIdText;

  // For taskGroupId tasks, also check if user is assigned to any task in the group
  let isGroupStudent = false;
  if (user.role === 'student' && task.taskGroupId) {
    const groupTask = await Task.findOne({
      taskGroupId: task.taskGroupId,
      assignedTo: user._id,
    });
    isGroupStudent = !!groupTask;
  }

  if (!isAssignedStudent && !isTaskFaculty && !isGroupStudent) {
    return {
      error: {
        status: 403,
        message: 'Access denied. Only the assigned student and task faculty can access this forum.',
      },
    };
  }

  return { task, user, isAssignedStudent, isTaskFaculty };
};

router.get('/messages/:taskId', validateRequest({ params: forumTaskParamSchema, query: forumStatusQuerySchema }), async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.query.userId || req.auth.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const participant = await getTaskAndParticipant(taskId, userId);
    if (participant.error) {
      return res.status(participant.error.status).json({ message: participant.error.message });
    }

    // Use taskGroupId if present (shared forum), otherwise taskId
    const forumId = participant.task.taskGroupId || taskId.toString();

    const messages = await TaskForumMessage.find({ taskId: forumId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email role');

    return res.json({ messages });
  } catch (error) {
    console.error('Fetch forum messages error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.get('/status/:taskId', validateRequest({ params: forumTaskParamSchema, query: forumStatusQuerySchema }), async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.query.userId || req.auth.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const participant = await getTaskAndParticipant(taskId, userId);
    if (participant.error) {
      return res.status(participant.error.status).json({ message: participant.error.message });
    }

    const forumStatus = getForumStatusFromTask(participant.task);

    // Use taskGroupId if present (shared forum), otherwise taskId
    const forumId = participant.task.taskGroupId || taskId.toString();

    let dailyMessagesSent = 0;
    if (participant.user.role === 'student') {
      const { start, end } = getDayBounds();
      dailyMessagesSent = await TaskForumMessage.countDocuments({
        taskId: forumId,
        senderId: participant.user._id,
        createdAt: { $gte: start, $lte: end },
      });
    }

    return res.json({
      taskId,
      forumId,
      isOpen: forumStatus.isOpen,
      expiresAt: forumStatus.expiresAt,
      message: forumStatus.message,
      userRole: participant.user.role,
      dailyMessageLimit: STUDENT_DAILY_LIMIT,
      dailyMessagesSent,
      dailyMessagesRemaining: participant.user.role === 'student'
        ? Math.max(0, STUDENT_DAILY_LIMIT - dailyMessagesSent)
        : null,
    });
  } catch (error) {
    console.error('Fetch forum status error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/message', validateRequest({ body: forumMessageBodySchema }), async (req, res) => {
  try {
    const { taskId, message } = req.body;
    const senderId = req.body.senderId || req.auth.userId;

    if (!taskId || !senderId || !message || !message.trim()) {
      return res.status(400).json({ message: 'taskId, senderId, and message are required.' });
    }

    const participant = await getTaskAndParticipant(taskId, senderId);
    if (participant.error) {
      return res.status(participant.error.status).json({ message: participant.error.message });
    }

    const forumStatus = getForumStatusFromTask(participant.task);
    if (!forumStatus.isOpen) {
      return res.status(403).json({ message: 'This discussion forum is closed. No new messages can be sent.' });
    }

    // Use taskGroupId if present (shared forum), otherwise taskId
    const forumId = participant.task.taskGroupId || taskId.toString();

    if (participant.user.role === 'student') {
      const { start, end } = getDayBounds();
      const sentToday = await TaskForumMessage.countDocuments({
        taskId: forumId,
        senderId: participant.user._id,
        createdAt: { $gte: start, $lte: end },
      });

      if (sentToday >= STUDENT_DAILY_LIMIT) {
        return res.status(429).json({
          message: 'Daily message limit reached. You can send more messages tomorrow.',
        });
      }
    }

    const createdMessage = await TaskForumMessage.create({
      taskId: forumId,
      senderId: participant.user._id,
      senderRole: participant.user.role,
      message: message.trim(),
    });

    const populatedMessage = await TaskForumMessage.findById(createdMessage._id)
      .populate('senderId', 'name email role');

    // Notify all participants in the forum (all students + faculty for taskGroup)
    const task = await Task.findById(taskId)
      .select('assignedTo createdBy title taskGroupId');

    if (task) {
      const recipientIds = new Set();

      // Always notify the task creator (faculty)
      if (participant.user.role === 'student') {
        recipientIds.add(task.createdBy.toString());
      }

      // If taskGroupId exists, notify all students in the group
      if (task.taskGroupId) {
        const groupTasks = await Task.find({ taskGroupId: task.taskGroupId })
          .select('assignedTo')
          .populate('assignedTo', '_id');
        
        groupTasks.forEach((gt) => {
          const studentId = gt.assignedTo._id.toString();
          if (studentId !== participant.user._id.toString()) {
            recipientIds.add(studentId);
          }
        });
      } else {
        // Single student task - notify the student if faculty sent message
        if (participant.user.role === 'faculty') {
          recipientIds.add(task.assignedTo.toString());
        }
      }

      // Create notifications for all recipients
      for (const recipientId of recipientIds) {
        try {
          await Notification.create({
            userId: recipientId,
            type: 'forum_message',
            message: `New message in "${task.title}": ${participant.user.name}`,
            taskId,
          });
        } catch (notifyError) {
          console.error('Failed to create notification:', notifyError);
        }
      }
    }

    return res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send forum message error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
