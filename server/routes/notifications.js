const express = require('express');
const Notification = require('../models/Notification');
const { authenticateJWT } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { notificationListQuerySchema, markAllReadBodySchema, taskIdParamSchema } = require('../validation/schemas');

const router = express.Router();
router.use(authenticateJWT);

router.get('/', validateRequest({ query: notificationListQuerySchema }), async (req, res) => {
  try {
    const userId = req.query.userId || req.auth.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.put('/mark-all-read', validateRequest({ body: markAllReadBodySchema }), async (req, res) => {
  try {
    const userId = req.body.userId || req.auth.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.put('/:id/read', validateRequest({ params: taskIdParamSchema }), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
