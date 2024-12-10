const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Profile = require('../models/Profile');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: './uploads/profiles',
  filename: (req, file, cb) => {
    cb(null, `${req.user.address}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid image format'));
  }
});

// Get profile by wallet address
router.get('/:address', async (req, res) => {
  try {
    const profile = await Profile.findOne({ 
      walletAddress: req.params.address.toLowerCase() 
    });
    if (!profile) {
      // Instead of 404, return empty profile object
      return res.json({
        walletAddress: req.params.address.toLowerCase(),
        username: null,
        preferredName: null,
        description: null,
        profilePicture: null,
        xAccount: null,
        isNewProfile: true
      });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Create new profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { walletAddress, username, preferredName, description, xAccount } = req.body;

    // Verify wallet ownership
    if (req.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: Wallet address mismatch' });
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (profile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    // Create new profile
    profile = new Profile({
      walletAddress: walletAddress.toLowerCase(),
      username,
      preferredName,
      description,
      xAccount,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Server error while creating profile' });
  }
});

// Update profile
router.put('/:address', authMiddleware, async (req, res) => {
  try {
    const { username, preferredName, description, xAccount } = req.body;
    
    // Verify wallet ownership
    if (req.user.address.toLowerCase() !== req.params.address.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: Wallet address mismatch' });
    }

    // Find and update profile
    const profile = await Profile.findOneAndUpdate(
      { walletAddress: req.params.address.toLowerCase() },
      {
        username,
        preferredName,
        description,
        xAccount,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Upload profile picture
router.post('/picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const profile = await Profile.findOneAndUpdate(
      { walletAddress: req.user.address.toLowerCase() },
      {
        profilePicture: `/uploads/profiles/${req.file.filename}`,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(profile);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Server error while uploading profile picture' });
  }
});

// Update wallet details
router.put('/:address/wallet', authMiddleware, async (req, res) => {
  try {
    const { balance, soulXP, badges, nfts, vesting, staking, liquidityPool, purchases } = req.body;
    
    if (req.user.address.toLowerCase() !== req.params.address.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOneAndUpdate(
      { walletAddress: req.params.address.toLowerCase() },
      {
        'walletDetails.balance': balance,
        'walletDetails.soulXP': soulXP,
        'walletDetails.badges': badges,
        'walletDetails.nfts': nfts,
        'walletDetails.vesting': vesting,
        'walletDetails.staking': staking,
        'walletDetails.liquidityPool': liquidityPool,
        'walletDetails.purchases': purchases,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(profile);
  } catch (error) {
    console.error('Error updating wallet details:', error);
    res.status(500).json({ error: 'Server error while updating wallet details' });
  }
});

module.exports = router;
