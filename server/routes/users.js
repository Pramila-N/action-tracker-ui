const express = require('express');
const User = require('../models/User');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { usersQuerySchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', authenticateJWT, authorizeRoles(['admin', 'faculty']), validateRequest({ query: usersQuerySchema }), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    if (req.auth.role === 'faculty') {
      filter.role = 'student';
    }

    const users = await User.find(filter).sort({ name: 1 });
    return res.json({ users: users.map((user) => user.toJSON()) });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
