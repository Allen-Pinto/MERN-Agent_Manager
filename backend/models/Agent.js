const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Agent name is required'],    
      trim: true
    },
    
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    
    assignedLeadsCount: {
      type: Number,
      default: 0
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

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;