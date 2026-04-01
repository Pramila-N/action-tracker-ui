const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const activityLogRoutes = require('./routes/activityLogs');
const forumRoutes = require('./routes/forum');

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '';

const defaultAllowedOrigins = [
  'https://action-tracker-ui.vercel.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

const configuredOrigins = CLIENT_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

const allowedOriginPatterns = [
  /^https:\/\/.*\.vercel\.app$/,
];

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const matchesPattern = origin
      ? allowedOriginPatterns.some((pattern) => pattern.test(origin))
      : false;

    if (!origin || allowedOrigins.includes(origin) || matchesPattern) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/forum', forumRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📌 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error && error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error('ℹ️ Stop the existing server process or use a different PORT in server/.env.');
        process.exit(1);
      }

      console.error('❌ Server start error:', error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB connection lost');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📍 Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected');
  process.exit(0);
});
