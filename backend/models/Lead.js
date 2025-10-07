const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      trim: true,
      lowercase: true
    },
    mobile: {
      type: String,
      required: [true, 'Please provide a mobile number'],
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Please provide a status'],
      enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'],
      default: 'New'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      trim: true,
      default: 'Manual'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    
    // ← ADD THIS NEW FIELD
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;