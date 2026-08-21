const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { auth, isSuperAdmin, hasRole } = require('../middleware/auth');

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const { roleId, departmentId, programmeId } = req.query;
    let query = {};
    
    if (roleId) {
      query.role = roleId;
    }
    if (departmentId) {
      query.department = departmentId;
    }
    if (programmeId) {
      query.programme = programmeId;
    }

    // Non-superadmin users can only see users in their department
    if (req.user.role.name !== 'Superadmin' && req.user.department) {
      query.department = req.user.department._id;
    }

    const users = await User.find(query)
      .populate('role')
      .populate('department')
      .populate('programme')
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role')
      .populate('department')
      .populate('programme')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create user (SuperAdmin only)
router.post('/', auth, isSuperAdmin, async (req, res) => {
  try {
    const { username, phone, email, password, role, department, programme } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Username, email, password, and role are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Check if role exists
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return res.status(400).json({ message: 'Role not found' });
    }

    const user = new User({
      username: username.trim(),
      phone: phone ? phone.trim() : '',
      email: email.toLowerCase().trim(),
      password,
      role,
      department: department || null,
      programme: programme || null
    });

    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate('role')
      .populate('department')
      .populate('programme')
      .select('-password');

    res.status(201).json({
      message: 'User created successfully',
      user: populatedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update user (SuperAdmin only)
router.put('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { username, phone, email, role, department, programme } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, phone, email, role, department, programme },
      { new: true, runValidators: true }
    )
      .populate('role')
      .populate('department')
      .populate('programme')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user (SuperAdmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
