const express = require('express');
const router = express.Router();
const Programme = require('../models/Programme');
const Department = require('../models/Department');
const { auth, isSuperAdmin } = require('../middleware/auth');

// Get all programmes
router.get('/', auth, async (req, res) => {
  try {
    const { departmentId } = req.query;
    let query = {};
    if (departmentId) {
      query.department = departmentId;
    }
    const programmes = await Programme.find(query).populate('department').sort({ createdAt: -1 });
    res.json(programmes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching programmes', error: error.message });
  }
});

// Get single programme
router.get('/:id', auth, async (req, res) => {
  try {
    const programme = await Programme.findById(req.params.id).populate('department');
    if (!programme) {
      return res.status(404).json({ message: 'Programme not found' });
    }
    res.json(programme);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching programme', error: error.message });
  }
});

// Create programme (SuperAdmin only)
router.post('/', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, shortName, department } = req.body;

    // Check if department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }

    const programme = new Programme({ name, shortName, department });
    await programme.save();

    const populatedProgramme = await Programme.findById(programme._id).populate('department');

    res.status(201).json({
      message: 'Programme created successfully',
      programme: populatedProgramme
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating programme', error: error.message });
  }
});

// Update programme (SuperAdmin only)
router.put('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, shortName, department } = req.body;

    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      { name, shortName, department },
      { new: true, runValidators: true }
    ).populate('department');

    if (!programme) {
      return res.status(404).json({ message: 'Programme not found' });
    }

    res.json({
      message: 'Programme updated successfully',
      programme
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating programme', error: error.message });
  }
});

// Delete programme (SuperAdmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const programme = await Programme.findByIdAndDelete(req.params.id);

    if (!programme) {
      return res.status(404).json({ message: 'Programme not found' });
    }

    res.json({ message: 'Programme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting programme', error: error.message });
  }
});

module.exports = router;
