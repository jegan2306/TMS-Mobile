const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Programme', programmeSchema);
