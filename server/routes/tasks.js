const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const TaskForumMessage = require('../models/TaskForumMessage');

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

    // Generate taskGroupId for multi-student tasks to share forum
    const taskGroupId = uniqueAssignedList.length > 1 ? crypto.randomUUID() : null;

    const tasks = await Task.create(
      uniqueAssignedList.map((studentId) => ({
        title,
        description,
        assignedTo: studentId,
        priority,
        deadline,
        createdBy,
        taskGroupId,
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

    // Create notification only if there are actual changes
    if (Object.keys(updates).length > 0) {
      // Check if notification already exists for this task and type to prevent duplicates
      const existingNotif = await Notification.findOne({
        userId: task.assignedTo._id,
        taskId: task._id,
        type: 'task_updated',
        createdAt: { $gte: new Date(Date.now() - 60000) }, // Within last minute
      });

      if (!existingNotif) {
        await Notification.create({
          userId: task.assignedTo._id,
          type: 'task_updated',
          message: `Task updated: "${task.title}"`,
          taskId: task._id,
        });
      }
    }

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

    try {
      await ActivityLog.create({
        taskId: task._id,
        userId: userId || task.assignedTo._id,
        action,
        description: logDescription,
        changes,
      });
      console.log(`✅ Activity logged: ${action} for task ${task._id}`);
    } catch (logError) {
      console.error('❌ Failed to create activity log:', logError);
    }

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
    await TaskForumMessage.deleteMany({ taskId: task._id });

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

    if ((task.progress || 0) < 100) {
      return res.status(400).json({ message: 'Task progress must be 100% before uploading work.' });
    }

    task.submission = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };
    task.review = { remarks: null, reviewedAt: null, reviewedBy: null, status: null };

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    // Check if notification already exists to prevent duplicates
    const existingSubmissionNotif = await Notification.findOne({
      userId: task.createdBy._id,
      taskId: task._id,
      type: 'work_submitted',
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Within last minute
    });

    if (!existingSubmissionNotif) {
      await Notification.create({
        userId: task.createdBy._id,
        type: 'work_submitted',
        message: `Submission received for task "${task.title}"`,
        taskId: task._id,
      });
    }

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

    // Check if notification already exists to prevent duplicates
    const existingReviewNotif = await Notification.findOne({
      userId: task.assignedTo._id,
      taskId: task._id,
      type: 'review_submitted',
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Within last minute
    });

    if (!existingReviewNotif) {
      await Notification.create({
        userId: task.assignedTo._id,
        type: 'review_submitted',
        message: `Faculty left remarks for task "${task.title}"`,
        taskId: task._id,
      });
    }

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

// ===== NEW ENDPOINTS FOR TASK SUBMISSION & REVIEW =====

// Student submits task when progress reaches 100%
router.post('/:id/submit', async (req, res) => {
  try {
    const { userId, progress } = req.body;
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const requestedProgress = Number(progress) || 0;
    const effectiveProgress = Math.max(task.progress || 0, requestedProgress);

    if (effectiveProgress < 100) {
      return res.status(400).json({ message: 'Task progress must be 100% to submit.' });
    }

    if (!task.submission || !task.submission.fileName) {
      return res.status(400).json({ message: 'Please upload a file before submitting for review.' });
    }

    if (task.status === 'submitted' || task.status === 'completed' || task.status === 'completed_late_rework') {
      return res.status(400).json({ message: 'Task is already submitted or finalized.' });
    }

    task.progress = 100;

    // Determine if submission is early or late
    const submissionTime = new Date();
    const deadline = new Date(task.deadline);
    task.isLate = submissionTime > deadline;
    task.isEarly = submissionTime < deadline;

    // Auto-calculate time spent from assignment to submission.
    task.timeSpent = Math.max(0, Math.floor((submissionTime.getTime() - new Date(task.createdAt).getTime()) / 1000));
    task.totalElapsedTime = task.timeSpent;
    task.isRunning = false;
    task.currentStartTime = null;

    // Change status to submitted
    task.status = 'submitted';
    task.submittedAt = submissionTime;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    // Notify faculty about submission
    await Notification.create({
      userId: task.createdBy._id,
      type: 'task_submitted',
      message: `Task submitted: "${task.title}" by ${task.assignedTo.name}`,
      taskId: task._id,
    });

    try {
      await ActivityLog.create({
        taskId: task._id,
        userId: userId || task.assignedTo._id,
        action: 'task_submitted',
        description: `Task "${task.title}" submitted for review`,
        changes: { status: { from: 'in_progress', to: 'submitted' } },
      });
      console.log(`✅ Activity logged: task_submitted for task ${task._id}`);
    } catch (logError) {
      console.error('❌ Failed to create activity log:', logError);
    }

    return res.json({ task: populatedTask });
  } catch (error) {
    console.error('Submit task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Faculty accepts task submission
router.post('/:id/review/accept', async (req, res) => {
  try {
    const { reviewedBy } = req.body;
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.status !== 'submitted' && task.status !== 'rework_required' && task.status !== 'late_rework_required') {
      return res.status(400).json({ message: 'Task is not in a reviewable state.' });
    }

    // Capture old status before changing
    const oldStatus = task.status;

    // Update review status
    task.review = {
      remarks: 'Accepted',
      reviewedAt: new Date(),
      reviewedBy,
      status: 'accepted',
    };

    // Set final status based on submission timing
    const newStatus = task.status === 'late_rework_required' ? 'completed_late_rework' : 'completed';
    task.status = newStatus;

    // Calculate and update productivity score
    const student = await User.findById(task.assignedTo._id);
    if (student) {
      let scorePoints = 0;
      if (task.isEarly) {
        scorePoints = 7; // Early completion
      } else if (!task.isLate) {
        scorePoints = 5; // On-time completion
      } else if (task.isLate && task.rejectionCount === 0) {
        scorePoints = -2; // Late submission first time
      }
      
      student.productivityScore = (student.productivityScore || 0) + scorePoints;
      await student.save();
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    // Notify student about acceptance
    await Notification.create({
      userId: task.assignedTo._id,
      type: 'task_accepted',
      message: `Task "${task.title}" has been accepted by faculty`,
      taskId: task._id,
    });

    try {
      await ActivityLog.create({
        taskId: task._id,
        userId: reviewedBy,
        action: 'task_accepted',
        description: `Task "${task.title}" accepted by faculty`,
        changes: { status: { from: oldStatus, to: newStatus } },
      });
      console.log(`✅ Activity logged: task_accepted for task ${task._id}`);
    } catch (logError) {
      console.error('❌ Failed to create activity log:', logError);
    }

    return res.json({ task: populatedTask });
  } catch (error) {
    console.error('Accept task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Faculty rejects task submission
router.post('/:id/review/reject', async (req, res) => {
  try {
    const { reviewedBy, remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ message: 'Remarks are required for rejection.' });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.status !== 'submitted' && task.status !== 'rework_required' && task.status !== 'late_rework_required') {
      return res.status(400).json({ message: 'Task is not in a reviewable state.' });
    }

    // Capture old status before changing
    const oldStatus = task.status;

    // Update review status
    task.review = {
      remarks,
      reviewedAt: new Date(),
      reviewedBy,
      status: 'rejected',
    };

    // Increment rejection count
    task.rejectionCount = (task.rejectionCount || 0) + 1;

    // Determine rejection status
    const deadline = new Date(task.deadline);
    const now = new Date();
    
    const newStatus = now > deadline ? 'late_rework_required' : 'rework_required';
    task.status = newStatus;

    // Deduct points for rejection
    const student = await User.findById(task.assignedTo._id);
    if (student) {
      student.productivityScore = Math.max(0, (student.productivityScore || 0) - 1); // -1 for rejection
      await student.save();
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    // Notify student about rejection
    const rejectionMessage = now > deadline 
      ? `Task "${task.title}" has been rejected (after deadline). Please review the remarks and resubmit.`
      : `Task "${task.title}" has been rejected. Please review the remarks and resubmit.`;

    await Notification.create({
      userId: task.assignedTo._id,
      type: 'task_rejected',
      message: rejectionMessage,
      taskId: task._id,
    });

    try {
      await ActivityLog.create({
        taskId: task._id,
        userId: reviewedBy,
        action: 'task_rejected',
        description: `Task "${task.title}" rejected by faculty: ${remarks}`,
        changes: { 
          status: { from: oldStatus, to: newStatus }, 
          review: { remarks } 
        },
      });
      console.log(`✅ Activity logged: task_rejected for task ${task._id}`);
    } catch (logError) {
      console.error('❌ Failed to create activity log:', logError);
    }

    return res.json({ task: populatedTask });
  } catch (error) {
    console.error('Reject task error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Get student productivity score
router.get('/productivity/student/:studentId', async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const completedTasks = await Task.countDocuments({
      assignedTo: student._id,
      status: { $in: ['completed', 'completed_late_rework'] },
    });

    return res.json({
      studentId: student._id,
      studentName: student.name,
      productivityScore: student.productivityScore || 0,
      completedTasks,
    });
  } catch (error) {
    console.error('Get productivity error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Get top 5 performing students (for a faculty member)
router.get('/productivity/leaderboard', async (req, res) => {
  try {
    const { createdBy } = req.query;

    if (!createdBy) {
      return res.status(400).json({ message: 'createdBy is required.' });
    }

    // Get all unique students assigned to this faculty member's tasks
    const tasks = await Task.find({ createdBy })
      .select('assignedTo')
      .populate('assignedTo', 'name email productivityScore');

    const studentsMap = new Map();
    tasks.forEach((task) => {
      const studentId = task.assignedTo._id.toString();
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          id: studentId,
          name: task.assignedTo.name,
          productivityScore: task.assignedTo.productivityScore || 0,
          completedTasks: 0,
        });
      }
    });

    // Count completed tasks for each student
    for (const student of studentsMap.values()) {
      const completedCount = await Task.countDocuments({
        assignedTo: student.id,
        status: { $in: ['completed', 'completed_late_rework'] },
        createdBy,
      });
      student.completedTasks = completedCount;
    }

    // Sort by productivity score and get top 5
    const leaderboard = Array.from(studentsMap.values())
      .sort((a, b) => b.productivityScore - a.productivityScore)
      .slice(0, 5)
      .map((student, index) => ({
        rank: index + 1,
        ...student,
      }));

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Get all students global leaderboard (for student view)
router.get('/productivity/leaderboard/all', async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' }).select('id name email productivityScore');

    // Get completed task count for each student
    const leaderboardData = await Promise.all(
      students.map(async (student) => {
        const completedCount = await Task.countDocuments({
          assignedTo: student._id,
          status: { $in: ['completed', 'completed_late_rework'] },
        });

        return {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          productivityScore: student.productivityScore || 0,
          completedTasks: completedCount,
        };
      })
    );

    // Sort by productivity score
    const leaderboard = leaderboardData
      .sort((a, b) => b.productivityScore - a.productivityScore)
      .map((student, index) => ({
        rank: index + 1,
        ...student,
      }));

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Check and send deadline notifications
router.post('/:id/check-deadline-notifications', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    const timeUntilDeadline = deadline.getTime() - now.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);

    const notifications = task.notifications || {};
    let notificationSent = false;
    let message = '';

    // 24 hours before deadline
    if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 2 && !notifications.twentyFourHoursBefore) {
      message = `Reminder: Task "${task.title}" is due in 24 hours`;
      notifications.twentyFourHoursBefore = true;
      notificationSent = true;
    }
    // 2 hours before deadline
    else if (hoursUntilDeadline <= 2 && hoursUntilDeadline > 0 && !notifications.twoHoursBefore) {
      message = `Urgent: Task "${task.title}" is due in 2 hours`;
      notifications.twoHoursBefore = true;
      notificationSent = true;
    }
    // After deadline
    else if (hoursUntilDeadline <= 0 && !notifications.afterDeadline) {
      message = `Deadline passed: Task "${task.title}" is overdue`;
      notifications.afterDeadline = true;
      notificationSent = true;
      
      // Update status to overdue if not already completed
      if (task.status !== 'completed' && task.status !== 'completed_late_rework') {
        task.status = 'overdue';
      }
    }

    if (notificationSent) {
      task.notifications = notifications;
      await task.save();

      const assignedUserId = task.assignedTo && task.assignedTo._id ? task.assignedTo._id : task.assignedTo;
      if (assignedUserId) {
        await Notification.create({
          userId: assignedUserId,
          type: 'deadline_reminder',
          message,
          taskId: task._id,
        });
      }
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('review.reviewedBy', 'name email role');

    return res.json({ 
      task: populatedTask, 
      notificationSent, 
      message 
    });
  } catch (error) {
    console.error('Check deadline notifications error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
