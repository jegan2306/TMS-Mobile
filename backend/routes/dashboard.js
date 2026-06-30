const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth, isSuperAdmin, hasRole } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
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

    // Filter by department for non-superadmin
    if (req.user.role.name !== 'Superadmin' && req.user.department) {
      query.department = req.user.department._id;
    }

    // Get total complaints count
    const totalComplaints = await Complaint.countDocuments(query);

    // Get pending complaints count
    const pendingComplaints = await Complaint.countDocuments({ ...query, status: 'Pending' });

    // Get assigned complaints count
    const assignedComplaints = await Complaint.countDocuments({ ...query, status: 'Assigned' });

    // Get closed/completed complaints count
    const closedComplaints = await Complaint.countDocuments({ ...query, status: 'Completed' });

    // Get in-progress complaints count
    const inProgressComplaints = await Complaint.countDocuments({ ...query, status: 'In-Progress' });

    // Get on-hold complaints count
    const onHoldComplaints = await Complaint.countDocuments({ ...query, status: 'On-Hold' });

    res.json({
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      closedComplaints,
      inProgressComplaints,
      onHoldComplaints
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Get complaint statistics by type
router.get('/stats/by-type', auth, async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role.name === 'User') {
      query.raisedBy = req.user._id;
    } else if (['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(req.user.role.name)) {
      query.assignedTo = req.user._id;
    }

    // Filter by department for non-superadmin
    if (req.user.role.name !== 'Superadmin' && req.user.department) {
      query.department = req.user.department._id;
    }

    const stats = await Complaint.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$complaintType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats by type', error: error.message });
  }
});

// Get complaint statistics by status
router.get('/stats/by-status', auth, async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role.name === 'User') {
      query.raisedBy = req.user._id;
    } else if (['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(req.user.role.name)) {
      query.assignedTo = req.user._id;
    }

    // Filter by department for non-superadmin
    if (req.user.role.name !== 'Superadmin' && req.user.department) {
      query.department = req.user.department._id;
    }

    const stats = await Complaint.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats by status', error: error.message });
  }
});

module.exports = router;
