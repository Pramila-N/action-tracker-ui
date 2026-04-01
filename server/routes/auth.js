const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const { validateRequest } = require('../middleware/validateRequest');
const { JWT_SECRET } = require('../middleware/auth');
const { loginBodySchema, registerBodySchema } = require('../validation/schemas');
const router = express.Router();

const buildToken = (user) => jwt.sign(
  {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name,
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

router.post('/login', validateRequest({ body: loginBodySchema }), async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    const token = buildToken(user);
    return res.json({ token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/register', validateRequest({ body: registerBodySchema }), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    const token = buildToken(user);
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
