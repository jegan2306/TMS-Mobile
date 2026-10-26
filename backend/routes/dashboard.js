const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth } = require('../middleware/auth');

const getRoleQuery = (user) => {
  let query = {};
  const roleName = user.role?.name;

  if (roleName === 'User') {
    query.raisedBy = user._id;
  } else if (roleName === 'Faculty') {
    const orConditions = [{ raisedBy: user._id }, { assignedTo: user._id }];
    if (user.department) {
      orConditions.push({ department: user.department._id || user.department });
    }
    query.$or = orConditions;
  } else if (['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(roleName)) {
    query.$or = [{ raisedBy: user._id }, { assignedTo: user._id }];
  } else if (roleName !== 'Superadmin' && user.department) {
    query.department = user.department._id || user.department;
  }
  return query;
};

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const query = getRoleQuery(req.user);

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
    const query = getRoleQuery(req.user);

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
    const query = getRoleQuery(req.user);

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

