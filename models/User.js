const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  house_no: {
    type: String,
    required: true,
    trim: true
  },
  wing: {
    type: String,
    required: true,
    trim: true
  },
  flatNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/
  },
  role: {
    type: String,
    enum: ['admin', 'secretary', 'member'],
    default: 'member'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
