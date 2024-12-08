const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  preferredName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  socialAccounts: {
    x: {
      username: String,
      verified: Boolean,
      verificationDate: Date
    },
    discord: {
      username: String,
      discriminator: String,
      verified: Boolean,
      verificationDate: Date
    },
    telegram: {
      username: String,
      verified: Boolean,
      verificationDate: Date
    },
    instagram: {
      username: String,
      verified: Boolean,
      verificationDate: Date
    }
  },
  profilePicture: {
    type: String
  },
  bannerPicture: {
    type: String
  },
  communityRole: {
    type: String,
    enum: ['Member', 'Moderator', 'Admin', 'Developer', 'Artist', 'Contributor', 'Ambassador'],
    default: 'Member'
  },
  achievements: [{
    name: String,
    description: String,
    earnedDate: Date,
    icon: String
  }],
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  walletDetails: {
    networks: [{
      chainId: Number,
      address: String,
      balance: String
    }],
    soulXP: {
      total: Number,
      history: [{
        amount: Number,
        reason: String,
        date: Date
      }]
    },
    badges: [{
      name: String,
      earnedDate: Date,
      imageUrl: String,
      rarity: String
    }],
    nfts: [{
      tokenId: String,
      contractAddress: String,
      name: String,
      imageUrl: String,
      chainId: Number
    }],
    vesting: [{
      tokenAddress: String,
      amount: String,
      unlockDate: Date,
      vestingSchedule: [{
        date: Date,
        amount: String
      }]
    }],
    staking: [{
      poolId: String,
      amount: String,
      startDate: Date,
      apy: Number,
      rewards: [{
        tokenAddress: String,
        amount: String,
        claimDate: Date
      }]
    }],
    liquidityPool: [{
      poolName: String,
      poolAddress: String,
      amount: String,
      share: Number,
      rewards: [{
        tokenAddress: String,
        amount: String,
        claimDate: Date
      }]
    }],
    purchases: [{
      date: Date,
      amount: String,
      tokenAddress: String,
      type: String,
      transactionHash: String
    }]
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: Boolean,
      push: Boolean,
      discord: Boolean,
      telegram: Boolean
    },
    privacy: {
      showWalletBalance: Boolean,
      showNFTs: Boolean,
      showActivity: Boolean,
      showSocialAccounts: Boolean
    }
  },
  activity: [{
    type: {
      type: String,
      enum: ['stake', 'unstake', 'claim', 'purchase', 'mint', 'transfer', 'social']
    },
    description: String,
    date: Date,
    data: mongoose.Schema.Types.Mixed
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total value locked (TVL)
profileSchema.virtual('tvl').get(function() {
  let total = 0;
  if (this.walletDetails.staking) {
    total += this.walletDetails.staking.reduce((sum, stake) => sum + parseFloat(stake.amount), 0);
  }
  if (this.walletDetails.liquidityPool) {
    total += this.walletDetails.liquidityPool.reduce((sum, pool) => sum + parseFloat(pool.amount), 0);
  }
  return total;
});

// Method to calculate total rewards
profileSchema.methods.calculateTotalRewards = function() {
  let rewards = {
    staking: 0,
    liquidityPool: 0
  };
  
  if (this.walletDetails.staking) {
    rewards.staking = this.walletDetails.staking.reduce((sum, stake) => {
      return sum + stake.rewards.reduce((rewardSum, reward) => rewardSum + parseFloat(reward.amount), 0);
    }, 0);
  }
  
  if (this.walletDetails.liquidityPool) {
    rewards.liquidityPool = this.walletDetails.liquidityPool.reduce((sum, pool) => {
      return sum + pool.rewards.reduce((rewardSum, reward) => rewardSum + parseFloat(reward.amount), 0);
    }, 0);
  }
  
  return rewards;
};

module.exports = mongoose.model('Profile', profileSchema);
