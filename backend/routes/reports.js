const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth, isSuperAdmin, hasRole } = require('../middleware/auth');

// Generate complaint report (Superadmin and Faculty)
router.get('/', auth, hasRole('Superadmin', 'Faculty'), async (req, res) => {
  try {
    const { department, programme, complaintType, status, assignee, startDate, endDate } = req.query;
    let query = {};

    // Apply filters
    if (department) query.department = department;
    if (programme) query.programme = programme;
    if (complaintType) query.complaintType = complaintType;
    if (status) query.status = status;
    if (assignee) query.assignedTo = assignee;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(query)
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email phone')
      .populate('department')
      .populate('programme')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalComplaints = complaints.length;
    const completedComplaints = complaints.filter(c => c.status === 'Completed').length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In-Progress').length;
    const assignedComplaints = complaints.filter(c => c.status === 'Assigned').length;
    const onHoldComplaints = complaints.filter(c => c.status === 'On-Hold').length;

    // Group by complaint type
    const byType = complaints.reduce((acc, complaint) => {
      acc[complaint.complaintType] = (acc[complaint.complaintType] || 0) + 1;
      return acc;
    }, {});

    // Group by status
    const byStatus = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalComplaints,
      completedComplaints,
      pendingComplaints,
      inProgressComplaints,
      assignedComplaints,
      onHoldComplaints,
      byType,
      byStatus,
      complaints
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

// Export report as CSV (Superadmin and Faculty)
router.get('/export', auth, hasRole('Superadmin', 'Faculty'), async (req, res) => {
  try {
    const { department, programme, complaintType, status, assignee, startDate, endDate } = req.query;
    let query = {};

    // Apply filters
    if (department) query.department = department;
    if (programme) query.programme = programme;
    if (complaintType) query.complaintType = complaintType;
    if (status) query.status = status;
    if (assignee) query.assignedTo = assignee;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(query)
      .populate('block')
      .populate('room')
      .populate('raisedBy', 'username email phone')
      .populate('assignedTo', 'username email')
      .populate('department')
      .sort({ createdAt: -1 });

    // Create CSV content
    const csvHeader = 'Complaint ID,Block,Room,Type,Status,Raised By,Assigned To,Department,Date\n';
    const csvRows = complaints.map(c => 
      `${c._id},${c.block?.name || ''},${c.room?.roomNumber || ''},${c.complaintType},${c.status},${c.raisedBy?.username || ''},${c.assignedTo?.username || ''},${c.department?.name || ''},${c.createdAt.toISOString()}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaint_report.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report', error: error.message });
  }
});

module.exports = router;
