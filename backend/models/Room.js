const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
