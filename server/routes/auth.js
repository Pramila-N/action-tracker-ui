const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

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

    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

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

    return res.status(201).json({ user: user.toJSON() });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
