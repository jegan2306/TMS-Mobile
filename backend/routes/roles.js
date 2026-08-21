const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { auth, isSuperAdmin } = require('../middleware/auth');

// Get all roles
router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

// Get single role
router.get('/:id', auth, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
});

// Create role (SuperAdmin only)
router.post('/', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    // Check if role exists
    const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = new Role({ name: name.trim() });
    await role.save();

    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Role already exists' });
    }
    res.status(500).json({ message: 'Error creating role', error: error.message });
  }
});

// Update role (SuperAdmin only)
router.put('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
});

// Delete role (SuperAdmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
});

module.exports = router;
