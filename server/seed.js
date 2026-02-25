const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

const PASSWORD = 'Password@123';

const users = [
  {
    name: 'Admin User',
    email: 'admin@tracker.edu',
    role: 'admin',
  },
  { name: 'Dr. Alan Smith', email: 'faculty1@tracker.edu', role: 'faculty' },
  { name: 'Dr. Priya Nair', email: 'faculty2@tracker.edu', role: 'faculty' },
  { name: 'Prof. Michael Lee', email: 'faculty3@tracker.edu', role: 'faculty' },
  { name: 'Dr. Sara Khan', email: 'faculty4@tracker.edu', role: 'faculty' },
  { name: 'Prof. Rohan Iyer', email: 'faculty5@tracker.edu', role: 'faculty' },
  { name: 'Student Arjun Rao', email: 'student1@tracker.edu', role: 'student' },
  { name: 'Student Meera Das', email: 'student2@tracker.edu', role: 'student' },
  { name: 'Student Karthik Menon', email: 'student3@tracker.edu', role: 'student' },
  { name: 'Student Ananya Singh', email: 'student4@tracker.edu', role: 'student' },
  { name: 'Student Neha Patel', email: 'student5@tracker.edu', role: 'student' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const operations = users.map((user) => ({
      updateOne: {
        filter: { email: user.email.toLowerCase() },
        update: {
          $set: {
            ...user,
            email: user.email.toLowerCase(),
            passwordHash,
          },
        },
        upsert: true,
      },
    }));

    await User.bulkWrite(operations);

    console.log('✅ Seed completed.');
    console.log(`Default password for all seeded users: ${PASSWORD}`);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
