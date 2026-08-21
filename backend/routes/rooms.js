const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Block = require('../models/Block');
const { auth, isSuperAdmin } = require('../middleware/auth');

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const { blockId, programmeId, departmentId } = req.query;
    let query = {};
    if (blockId) {
      query.block = blockId;
    }
    if (programmeId) {
      query.programme = programmeId;
    }
    if (departmentId) {
      query.department = departmentId;
    }
    const rooms = await Room.find(query).populate('department').populate('programme').populate('block').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// Get single room
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('department').populate('programme').populate('block');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
});

// Create room (SuperAdmin only)
router.post('/', auth, isSuperAdmin, async (req, res) => {
  try {
    const { roomNumber, department, programme, block } = req.body;

    if (!roomNumber || !department || !programme || !block) {
      return res.status(400).json({ message: 'Room number, department, programme, and block are required' });
    }

    // Check if block exists
    const blk = await Block.findById(block);
    if (!blk) {
      return res.status(400).json({ message: 'Block not found' });
    }

    // Check for duplicate room number in same block
    const existingRoom = await Room.findOne({
      block,
      roomNumber: { $regex: new RegExp(`^${roomNumber.trim()}$`, 'i') }
    });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists in this block' });
    }

    const room = new Room({ roomNumber: roomNumber.trim(), department, programme, block });
    await room.save();

    const populatedRoom = await Room.findById(room._id).populate('department').populate('programme').populate('block');

    res.status(201).json({
      message: 'Room created successfully',
      room: populatedRoom
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

// Update room (SuperAdmin only)
router.put('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { roomNumber, department, programme, block } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, department, programme, block },
      { new: true, runValidators: true }
    ).populate('department').populate('programme').populate('block');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
});

// Delete room (SuperAdmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

module.exports = router;
