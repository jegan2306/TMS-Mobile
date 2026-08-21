const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const programmeRoutes = require('./routes/programmes');
const blockRoutes = require('./routes/blocks');
const roomRoutes = require('./routes/rooms');
const roleRoutes = require('./routes/roles');
const userRoutes = require('./routes/users');
const complaintRoutes = require('./routes/complaints');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/programmes', programmeRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ticket_management';
const PORT = process.env.PORT || 5000;

console.log('Attempting MongoDB connection...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error Details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Full Error:', err);
    process.exit(1);
  });

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Ticket Management System API is running' });
});

module.exports = app;
