const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetrack';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Time Entry Schema
const timeEntrySchema = new mongoose.Schema({
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  date: { type: String, required: true },
  status: { type: String, enum: ['Clocked In', 'Clocked Out'], default: 'Clocked In' },
  hoursWorked: { type: Number }
});

const User = mongoose.model('User', userSchema);
const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Sign Up
app.post('/api/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      isAdmin: false
    });

    await user.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating account' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Clock In/Out
app.post('/api/clock', authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;

    // Get user details
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for active entry
    const activeEntry = await TimeEntry.findOne({ username, status: 'Clocked In' });

    if (activeEntry) {
      // Clock out
      const clockOut = new Date();
      const duration = (clockOut - activeEntry.clockIn) / (1000 * 60 * 60);
      
      activeEntry.clockOut = clockOut;
      activeEntry.status = 'Clocked Out';
      activeEntry.hoursWorked = parseFloat(duration.toFixed(2));
      
      await activeEntry.save();
      
      return res.json({
        action: 'clockOut',
        entry: activeEntry,
        message: `Clocked Out Successfully!\n${user.firstName} ${user.lastName}`
      });
    } else {
      // Clock in
      const now = new Date();
      const entry = new TimeEntry({
        username,
        firstName: user.firstName,
        lastName: user.lastName,
        clockIn: now,
        date: now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        status: 'Clocked In'
      });

      await entry.save();
      
      return res.json({
        action: 'clockIn',
        entry,
        message: `Clocked In Successfully!\n${user.firstName} ${user.lastName}`
      });
    }
  } catch (error) {
    console.error('Clock error:', error);
    res.status(500).json({ error: 'Error processing clock action' });
  }
});

// Get All Time Entries (Admin only)
app.get('/api/entries', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const entries = await TimeEntry.find().sort({ clockIn: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Error fetching entries' });
  }
});

// Get User Time Entries
app.get('/api/entries/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // Only admin or the user themselves can view entries
    if (!req.user.isAdmin && req.user.username !== username) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const entries = await TimeEntry.find({ username }).sort({ clockIn: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching user entries:', error);
    res.status(500).json({ error: 'Error fetching entries' });
  }
});

// Get All Users (Admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get Dashboard Stats (Admin only)
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments();
    const currentlyClockedIn = await TimeEntry.countDocuments({ status: 'Clocked In' });
    const totalRecords = await TimeEntry.countDocuments();

    res.json({
      totalUsers,
      currentlyClockedIn,
      totalRecords
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
