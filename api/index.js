const mongoose = require('mongoose');
const express = require('express');
const app = express();

// Allow the app to read JSON data
app.use(express.json());

// 1. Connect to MongoDB
// We check if it's already connected to stop it from connecting twice
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB error:', err));
}

// 2. Define the "User" model
// This tells MongoDB what a user looks like
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String, // We will store plain text for now to keep it simple
  isAdmin: { type: Boolean, default: false }
});

// Reuse existing model if it exists, otherwise create new one
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 3. Define the "TimeEntry" model
const TimeEntrySchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  clockIn: Date,
  clockOut: Date,
  date: String,
  status: String,
  hoursWorked: String
});

const TimeEntry = mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);

// 4. API Routes (The "Phone Lines")

// LOGIN Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // Check database for this user
  const user = await User.findOne({ username, password });
  
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// SIGNUP Route
app.post('/api/signup', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: 'User created!' });
  } catch (error) {
    res.status(400).json({ error: 'Username or Email already exists' });
  }
});

// GET ENTRIES Route (For Dashboard)
app.get('/api/entries', async (req, res) => {
  const entries = await TimeEntry.find().sort({ clockIn: -1 });
  res.json(entries);
});

module.exports = app;
