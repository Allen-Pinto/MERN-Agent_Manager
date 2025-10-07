const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,           
      required: true,         
      unique: true,
      lowercase: true,        
      trim: true              
    },
    
    password: {
      type: String,
      required: true,
      minlength: 6          
    },
    
    // Role field
    role: {
      type: String,
      default: 'user'        
    }
  },
  {
    timestamps: true       
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;