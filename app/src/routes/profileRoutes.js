const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get profile by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new profile (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    // Verify wallet address matches authenticated user
    if (req.user.walletAddress !== req.body.walletAddress) {
      return res.status(403).json({ message: 'Unauthorized: Wallet address mismatch' });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ walletAddress: req.body.walletAddress });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this wallet' });
    }

    // Check username availability
    const usernameExists = await Profile.findOne({ username: req.body.username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const profile = new Profile({
      walletAddress: req.body.walletAddress,
      username: req.body.username,
      preferredName: req.body.preferredName,
      profilePicture: req.body.profilePicture,
      xAccount: req.body.xAccount,
      bio: req.body.bio,
      socialLinks: req.body.socialLinks,
      preferences: req.body.preferences
    });

    const newProfile = await profile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update profile (requires authentication)
router.put('/:walletAddress', auth, async (req, res) => {
  try {
    // Verify wallet address matches authenticated user
    if (req.user.walletAddress !== req.params.walletAddress) {
      return res.status(403).json({ message: 'Unauthorized: Wallet address mismatch' });
    }

    const profile = await Profile.findOne({ walletAddress: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // If username is being updated, check availability
    if (req.body.username && req.body.username !== profile.username) {
      const usernameExists = await Profile.findOne({ username: req.body.username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Update only allowed fields
    const allowedUpdates = [
      'username', 'preferredName', 'profilePicture', 'xAccount',
      'bio', 'socialLinks', 'preferences'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search profiles by username
router.get('/search/:query', async (req, res) => {
  try {
    const profiles = await Profile.find(
      { $text: { $search: req.params.query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10);
    
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile stats
router.get('/:walletAddress/stats', async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const stats = {
      completionPercentage: profile.completionPercentage,
      level: profile.level,
      soulXP: profile.soulXP,
      badgesCount: profile.badges.length,
      nftsCount: profile.nfts.length,
      achievementsCount: profile.achievements.length,
      lastActive: profile.lastActive
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
