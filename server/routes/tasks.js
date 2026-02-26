const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Download file route - MUST BE BEFORE /:id routes
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    console.log('Download request:', { 
      filename, 
      filePath, 
      uploadDir,
      exists: fs.existsSync(filePath),
      filesInDir: fs.readdirSync(uploadDir)
    });

    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found', filename, uploadDir });
    }

    const stat = fs.statSync(filePath);
    console.log('File stats:', { size: stat.size, isFile: stat.isFile() });

    // Send file directly (will display PDF in browser)
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Send file error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error sending file' });
        }
      } else {
        console.log('File sent successfully:', filename);
      }
    });
  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}_${safeName}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF or DOCX files are allowed.'));
    }

    return cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, createdBy } = req.body;

    const assignedList = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const uniqueAssignedList = [...new Set(assignedList.filter(Boolean))];

    if (!title || !description || uniqueAssignedList.length === 0 || !priority || !deadline || !createdBy) {
      return res.status(400).json({ message: 'Title, description, assignedTo, priority, deadline, and createdBy are required.' });
    }

    const [assignedUsers, createdUser] = await Promise.all([
      User.find({ _id: { $in: uniqueAssignedList } }),
      User.findById(createdBy),
    ]);

    if (!createdUser || createdUser.role !== 'faculty') {
      return res.status(400).json({ message: 'Created by must be a faculty user.' });
    }

    const studentUsers = assignedUsers.filter((user) => user.role === 'student');
    if (studentUsers.length !== uniqueAssignedList.length) {
      return res.status(400).json({ message: 'Assigned users must all be students.' });
    }

    const tasks = await Task.create(
      uniqueAssignedList.map((studentId) => ({
        title,
        description,
        assignedTo: studentId,
        priority,
        deadline,
        createdBy,
      }))
    );

    const populatedTasks = await Task.find({ _id: { $in: tasks.map((task) => task._id) } })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    const studentNameById = studentUsers.reduce((acc, student) => {
      acc[student._id.toString()] = student.name;
      return acc;
    }, {});

    await Promise.all(
      populatedTasks.map((task) =>
        Notification.create({
          userId: task.assignedTo._id,
          type: 'task_created',
          message: `New task assigned: "${task.title}"`,
          taskId: task._id,
        })
      )
    );

    await Promise.all(
      populatedTasks.map((task) =>
        ActivityLog.create({
          taskId: task._id,
          userId: createdBy,
          action: 'task_created',
          description: `Task "${task.title}" created and assigned to ${studentNameById[task.assignedTo._id.toString()] || 'student'}`,
          changes: { status: 'pending', priority, deadline },
        })
      )
    );

    if (populatedTasks.length === 1) {
      return res.status(201).json({ task: populatedTasks[0] });
    }

    return res.status(201).json({ tasks: populatedTasks });
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

    console.log('📊 Tasks GET request with filter:', filter);

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    console.log(`📊 Found ${tasks.length} tasks`);
    if (tasks.length > 0) {
      console.log('📊 Sample task:', {
        id: tasks[0]._id,
        title: tasks[0].title,
        assignedTo: tasks[0].assignedTo,
        createdBy: tasks[0].createdBy,
      });
    }

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
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

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
    const { title, description, assignedTo, priority, deadline, status, progress, timeSpent, userId } = req.body;

    // Get old task for change tracking
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const updates = {};
    const changes = {};
    
    if (title) { updates.title = title; changes.title = { from: oldTask.title, to: title }; }
    if (description) { updates.description = description; changes.description = { from: oldTask.description, to: description }; }
    if (priority) { updates.priority = priority; changes.priority = { from: oldTask.priority, to: priority }; }
    if (deadline) { updates.deadline = deadline; changes.deadline = { from: oldTask.deadline, to: deadline }; }
    if (status) { updates.status = status; changes.status = { from: oldTask.status, to: status }; }
    if (typeof progress === 'number') { 
      updates.progress = progress; 
      changes.progress = { from: oldTask.progress, to: progress };
    }
    if (typeof timeSpent === 'number') { updates.timeSpent = timeSpent; }
    if (assignedTo) { updates.assignedTo = assignedTo; }

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
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Create notification
    await Notification.create({
      userId: task.assignedTo._id,
      type: 'task_updated',
      message: `Task updated: "${task.title}"`,
      taskId: task._id,
    });

    // Log activity with detailed changes
    let action = 'task_updated';
    let logDescription = `Task "${task.title}" updated`;

    if (typeof progress === 'number' && progress !== oldTask.progress) {
      action = 'progress_updated';
      logDescription = `Progress updated from ${oldTask.progress}% to ${progress}%`;
    } else if (status && status !== oldTask.status) {
      action = 'status_changed';
      logDescription = `Status changed from ${oldTask.status} to ${status}`;
    }

    if (status === 'completed' && oldTask.status !== 'completed') {
      action = 'task_completed';
      logDescription = `Task "${task.title}" marked as completed`;
    }

    await ActivityLog.create({
      taskId: task._id,
      userId: userId || task.assignedTo._id,
      action,
      description: logDescription,
      changes,
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

// Timer endpoints
router.post('/:id/timer/start', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.isRunning) {
      return res.status(400).json({ message: 'Timer is already running for this task.' });
    }

    // Start the timer
    task.currentStartTime = new Date();
    task.isRunning = true;
    
    // Update status to in_progress if it's pending
    if (task.status === 'pending') {
      task.status = 'in_progress';
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    // Log timer start activity
    await ActivityLog.create({
      taskId: task._id,
      userId: task.assignedTo,
      action: 'timer_started',
      description: `Timer started for task "${populatedTask.title}"`,
      changes: { isRunning: { from: false, to: true }, currentStartTime: new Date() },
    });

    return res.json({ 
      message: 'Timer started successfully.',
      task: populatedTask,
    });
  } catch (error) {
    console.error('Start timer error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/:id/timer/stop', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (!task.isRunning) {
      return res.status(400).json({ message: 'Timer is not running for this task.' });
    }

    // Calculate session time
    const sessionTime = Math.floor((Date.now() - task.currentStartTime.getTime()) / 1000);
    
    // Add session time to total elapsed time
    task.totalElapsedTime += sessionTime;
    task.currentStartTime = null;
    task.isRunning = false;
    
    // Keep timeSpent in sync for backward compatibility
    task.timeSpent = task.totalElapsedTime;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    // Log timer stop activity
    await ActivityLog.create({
      taskId: task._id,
      userId: task.assignedTo,
      action: 'timer_stopped',
      description: `Timer stopped for task "${populatedTask.title}" (Session: ${Math.floor(sessionTime / 60)} min ${sessionTime % 60} sec)`,
      changes: { 
        isRunning: { from: true, to: false }, 
        totalElapsedTime: { from: task.totalElapsedTime - sessionTime, to: task.totalElapsedTime },
        sessionTime,
      },
    });

    return res.json({ 
      message: 'Timer stopped successfully.',
      task: populatedTask,
      sessionTime,
    });
  } catch (error) {
    console.error('Stop timer error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/:id/submission', upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF or DOCX file.' });
    }

    console.log('File uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname
    });

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({ message: 'Please complete the task before submitting work.' });
    }

    task.submission = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };
    task.review = { remarks: null, reviewedAt: null, reviewedBy: null };

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    await Notification.create({
      userId: task.createdBy._id,
      type: 'work_submitted',
      message: `Submission received for task "${task.title}"`,
      taskId: task._id,
    });

    await ActivityLog.create({
      taskId: task._id,
      userId: userId || task.assignedTo._id,
      action: 'work_submitted',
      description: `Work submitted for task "${task.title}"`,
      changes: { submission: { to: req.file.originalname } },
    });

    return res.json({ task: populatedTask });
  } catch (error) {
    console.error('Submit work error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.put('/:id/remarks', async (req, res) => {
  try {
    const { remarks, reviewedBy } = req.body;

    if (!remarks || !reviewedBy) {
      return res.status(400).json({ message: 'Remarks and reviewedBy are required.' });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (!task.submission || !task.submission.fileName) {
      return res.status(400).json({ message: 'No submission found for this task.' });
    }

    task.review = {
      remarks,
      reviewedAt: new Date(),
      reviewedBy,
    };

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    await Notification.create({
      userId: task.assignedTo._id,
      type: 'review_submitted',
      message: `Faculty left remarks for task "${task.title}"`,
      taskId: task._id,
    });

    await ActivityLog.create({
      taskId: task._id,
      userId: reviewedBy,
      action: 'review_submitted',
      description: `Remarks added for task "${task.title}"`,
      changes: { review: { to: remarks } },
    });

    return res.json({ task: populatedTask });
  } catch (error) {
    console.error('Submit remarks error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
