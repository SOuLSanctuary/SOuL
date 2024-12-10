const express = require('express');
const router = express.Router();

// In-memory store for profiles (replace with MongoDB later)
const profiles = new Map();

// Get profile by wallet address
router.get('/profile/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const profile = profiles.get(walletAddress);
  
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  
  res.json(profile);
});

// Create new profile
router.post('/profile', (req, res) => {
  const profileData = req.body;
  const { walletAddress } = profileData;
  
  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }
  
  if (profiles.has(walletAddress)) {
    return res.status(409).json({ message: 'Profile already exists' });
  }
  
  const newProfile = {
    ...profileData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferredName: profileData.preferredName || 'Anonymous',
    soulXP: 0,
    level: 1,
    badges: [],
    achievements: []
  };
  
  profiles.set(walletAddress, newProfile);
  res.status(201).json(newProfile);
});

// Update profile
router.put('/profile/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const updates = req.body;
  
  if (!profiles.has(walletAddress)) {
    // Create new profile if it doesn't exist
    const newProfile = {
      walletAddress,
      preferredName: 'Anonymous',
      soulXP: 0,
      level: 1,
      badges: [],
      achievements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    profiles.set(walletAddress, newProfile);
  }
  
  const profile = profiles.get(walletAddress);
  const updatedProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  profiles.set(walletAddress, updatedProfile);
  res.json(updatedProfile);
});

// Check username availability
router.post('/profile/check-username', (req, res) => {
  const { username } = req.body;
  
  // Check if username exists in any profile
  const isAvailable = ![...profiles.values()].some(
    profile => profile.username === username
  );
  
  res.json({ available: isAvailable });
});

// Verify X account
router.post('/profile/verify-x', (req, res) => {
  const { xAccount } = req.body;
  
  // For now, just return success
  res.json({
    verified: true,
    username: xAccount
  });
});

module.exports = router;
