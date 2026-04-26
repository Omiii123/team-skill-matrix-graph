// Entry point: configures Express, connects to MongoDB, and mounts API routes.
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const peopleRoutes = require('./routes/people');
const skillRoutes = require('./routes/skills');
const connectionRoutes = require('./routes/connections');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://team-skill-matrix-graph-mu.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/connections', connectionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Centralized error handler (catches unexpected errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
