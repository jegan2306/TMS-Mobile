const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { auth, isSuperAdmin } = require('../middleware/auth');

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error: error.message });
  }
});

// Create department (SuperAdmin only)
router.post('/', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, shortName } = req.body;

    // Check if department exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = new Department({ name, shortName });
    await department.save();

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
});

// Update department (SuperAdmin only)
router.put('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, shortName } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, shortName },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
});

// Delete department (SuperAdmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
});

module.exports = router;
