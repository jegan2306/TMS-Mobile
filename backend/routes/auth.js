const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, phone, email, password, role, department, programme } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Resolve role: allow ObjectId string or role name (case-insensitive)
    let roleId = role;
    if (typeof role === 'string') {
      // If the string is a valid ObjectId, use it directly
      if (mongoose.Types.ObjectId.isValid(role)) {
        roleId = role;
      } else {
        const roleDoc = await Role.findOne({ name: new RegExp('^' + role + '$', 'i') });
        if (!roleDoc) {
          return res.status(400).json({ message: 'Role not found' });
        }
        roleId = roleDoc._id;
      }
    }

    const user = new User({
      username,
      phone,
      email,
      password,
      role: roleId,
      department,
      programme
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'tms_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('role').populate('department').populate('programme');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'tms_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        programme: user.programme
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .populate('department')
      .populate('programme')
      .select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error getting user', error: error.message });
  }
});

module.exports = router;
