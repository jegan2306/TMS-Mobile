const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth, isSuperAdmin, hasRole } = require('../middleware/auth');

// Get all complaints (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    const { status, blockId, roomId, complaintType, assignedTo } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role.name === 'User') {
      // Users can only see their own complaints
      query.raisedBy = req.user._id;
    } else if (['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(req.user.role.name)) {
      // Staff can only see complaints assigned to them
      query.assignedTo = req.user._id;
    }
    // Superadmin can see all complaints

    // Apply additional filters
    if (status) query.status = status;
    if (blockId) query.block = blockId;
    if (roomId) query.room = roomId;
    if (complaintType) query.complaintType = complaintType;
    if (assignedTo) query.assignedTo = assignedTo;

    // Filter by department for non-superadmin
    if (req.user.role.name !== 'Superadmin' && req.user.department) {
      query.department = req.user.department._id;
    }

    const complaints = await Complaint.find(query)
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email phone role')
      .populate('department')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email phone role')
      .populate('department');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaint', error: error.message });
  }
});

// Create complaint (User and Superadmin)
router.post('/', auth, hasRole('Superadmin', 'User'), async (req, res) => {
  try {
    const { block, room, complaintType, remarks, attachment } = req.body;

    const complaint = new Complaint({
      block,
      room,
      complaintType,
      remarks,
      attachment,
      raisedBy: req.user._id,
      department: req.user.department
    });

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('department');

    res.status(201).json({
      message: 'Complaint raised successfully',
      complaint: populatedComplaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating complaint', error: error.message });
  }
});

// Assign complaint (Superadmin only)
router.put('/:id/assign', auth, isSuperAdmin, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'Assigned' },
      { new: true, runValidators: true }
    )
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email phone role')
      .populate('department');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning complaint', error: error.message });
  }
});

// Update complaint status (Staff and Superadmin)
router.put('/:id/status', auth, hasRole('Superadmin', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'), async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'In-Progress', 'On-Hold', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email phone role')
      .populate('department');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint status', error: error.message });
  }
});

// Update complaint
router.put('/:id', auth, async (req, res) => {
  try {
    const { block, room, complaintType, remarks, attachment } = req.body;

    // Only the creator can update their complaint (unless superadmin)
    const existingComplaint = await Complaint.findById(req.params.id);
    if (!existingComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.user.role.name !== 'Superadmin' && existingComplaint.raisedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { block, room, complaintType, remarks, attachment },
      { new: true, runValidators: true }
    )
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email phone role')
      .populate('department');

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint', error: error.message });
  }
});

// Delete complaint (Superadmin only)
router.delete('/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting complaint', error: error.message });
  }
});

module.exports = router;
