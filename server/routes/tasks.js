const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, createdBy } = req.body;

    if (!title || !description || !assignedTo || !priority || !deadline || !createdBy) {
      return res.status(400).json({ message: 'Title, description, assignedTo, priority, deadline, and createdBy are required.' });
    }

    const [assignedUser, createdUser] = await Promise.all([
      User.findById(assignedTo),
      User.findById(createdBy),
    ]);

    if (!assignedUser || assignedUser.role !== 'student') {
      return res.status(400).json({ message: 'Assigned user must be a student.' });
    }

    if (!createdUser || createdUser.role !== 'faculty') {
      return res.status(400).json({ message: 'Created by must be a faculty user.' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority,
      deadline,
      createdBy,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    await Notification.create({
      userId: assignedTo,
      type: 'task_created',
      message: `New task assigned: "${title}"`,
      taskId: task._id,
    });

    return res.status(201).json({ task: populatedTask });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { assignedTo, createdBy } = req.query;
    const filter = {};

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return res.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Fetch task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, status, progress, timeSpent } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (priority) updates.priority = priority;
    if (deadline) updates.deadline = deadline;
    if (status) updates.status = status;
    if (typeof progress === 'number') updates.progress = progress;
    if (typeof timeSpent === 'number') updates.timeSpent = timeSpent;
    if (assignedTo) updates.assignedTo = assignedTo;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided.' });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'student') {
        return res.status(400).json({ message: 'Assigned user must be a student.' });
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await Notification.create({
      userId: task.assignedTo._id,
      type: 'task_updated',
      message: `Task updated: "${task.title}"`,
      taskId: task._id,
    });

    return res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await Notification.create({
      userId: task.assignedTo._id,
      type: 'task_deleted',
      message: `Task deleted: "${task.title}"`,
      taskId: task._id,
    });

    await Task.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
