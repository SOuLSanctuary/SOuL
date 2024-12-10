const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  preferredName: {
    type: String,
    trim: true
  },
  profilePicture: String,
  xAccount: String,
  bio: {
    type: String,
    maxLength: 500
  },
  badges: [{
    name: String,
    description: String,
    imageUrl: String,
    earnedAt: Date
  }],
  nfts: [{
    tokenId: String,
    name: String,
    description: String,
    imageUrl: String,
    mintAddress: String
  }],
  following: [{
    type: String, // walletAddress
    ref: 'Profile'
  }],
  followers: [{
    type: String, // walletAddress
    ref: 'Profile'
  }],
  walletBalance: {
    type: Number,
    default: 0
  },
  soulXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: Date
  }],
  socialLinks: {
    discord: String,
    twitter: String,
    github: String,
    website: String
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  }
}, {
  timestamps: true
});

// Indexes
profileSchema.index({ username: 'text' });
profileSchema.index({ following: 1 });
profileSchema.index({ followers: 1 });

// Pre-save middleware
profileSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Virtual for profile completion percentage
profileSchema.virtual('completionPercentage').get(function() {
  const fields = ['username', 'preferredName', 'profilePicture', 'bio', 'xAccount'];
  const filledFields = fields.filter(field => this[field]);
  return Math.round((filledFields.length / fields.length) * 100);
});

// Virtual for follower count
profileSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

// Virtual for following count
profileSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

// Method to check if a user is following another
profileSchema.methods.isFollowing = function(walletAddress) {
  return this.following.includes(walletAddress);
};

// Method to follow a user
profileSchema.methods.follow = async function(walletAddress) {
  if (this.walletAddress === walletAddress) {
    throw new Error('Cannot follow yourself');
  }
  
  if (!this.following.includes(walletAddress)) {
    this.following.push(walletAddress);
    await this.save();
    
    // Add this user to the other user's followers
    const otherProfile = await this.constructor.findOne({ walletAddress });
    if (otherProfile && !otherProfile.followers.includes(this.walletAddress)) {
      otherProfile.followers.push(this.walletAddress);
      await otherProfile.save();
    }
  }
};

// Method to unfollow a user
profileSchema.methods.unfollow = async function(walletAddress) {
  const followingIndex = this.following.indexOf(walletAddress);
  if (followingIndex > -1) {
    this.following.splice(followingIndex, 1);
    await this.save();
    
    // Remove this user from the other user's followers
    const otherProfile = await this.constructor.findOne({ walletAddress });
    if (otherProfile) {
      const followerIndex = otherProfile.followers.indexOf(this.walletAddress);
      if (followerIndex > -1) {
        otherProfile.followers.splice(followerIndex, 1);
        await otherProfile.save();
      }
    }
  }
};

module.exports = mongoose.model('Profile', profileSchema);
