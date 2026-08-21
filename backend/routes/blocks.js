const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const Programme = require('../models/Programme');
const { auth, isSuperAdmin } = require('../middleware/auth');

// Get all blocks
router.get('/', auth, async (req, res) => {
  try {
    const { programmeId, departmentId } = req.query;
    let query = {};
    if (programmeId) {
      query.programme = programmeId;
    }
    if (departmentId) {
      query.department = departmentId;
    }
    const blocks = await Block.find(query).populate('department').populate('programme').sort({ createdAt: -1 });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blocks', error: error.message });
  }
});

// Get single block
router.get('/:id', auth, async (req, res) => {
  try {
    const block = await Block.findById(req.params.id).populate('department').populate('programme');
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json(block);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching block', error: error.message });
  }
});

// Create block (SuperAdmin only)
router.post('/', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, department, programme } = req.body;

    if (!name || !department || !programme) {
      return res.status(400).json({ message: 'Block name, department, and programme are required' });
    }

    // Check if programme exists
    const prog = await Programme.findById(programme);
    if (!prog) {
      return res.status(400).json({ message: 'Programme not found' });
    }

    // Check for duplicate block in same programme
    const existingBlock = await Block.findOne({
      programme,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existingBlock) {
      return res.status(400).json({ message: 'Block already exists in this programme' });
    }

    const block = new Block({ name: name.trim(), department, programme });
    await block.save();

    const populatedBlock = await Block.findById(block._id).populate('department').populate('programme');

    res.status(201).json({
      message: 'Block created successfully',
      block: populatedBlock
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Block already exists' });
    }
    res.status(500).json({ message: 'Error creating block', error: error.message });
  }
});

// Update block (SuperAdmin only)
router.put('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, department, programme } = req.body;

    const block = await Block.findByIdAndUpdate(
      req.params.id,
      { name, department, programme },
      { new: true, runValidators: true }
    ).populate('department').populate('programme');

    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }

    res.json({
      message: 'Block updated successfully',
      block
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating block', error: error.message });
  }
});

// Delete block (SuperAdmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const block = await Block.findByIdAndDelete(req.params.id);

    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }

    res.json({ message: 'Block deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting block', error: error.message });
  }
});

module.exports = router;
