const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  preferredName: {
    type: String,
    default: 'Anonymous'
  },
  soulXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    type: String
  }],
  achievements: [{
    type: String
  }],
  profilePhoto: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
