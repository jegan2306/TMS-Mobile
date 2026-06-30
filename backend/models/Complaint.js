const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  complaintType: {
    type: String,
    required: true,
    enum: ['PC Hardware', 'PC Software', 'Application Issues', 'Network', 'Electronics', 'Plumbing', 'Electrical', 'Other']
  },
  remarks: {
    type: String,
    required: true
  },
  attachment: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In-Progress', 'On-Hold', 'Completed'],
    default: 'Pending'
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
