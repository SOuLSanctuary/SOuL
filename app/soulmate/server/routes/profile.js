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
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/:address', authMiddleware, async (req, res) => {
  try {
    const { username, preferredName, description, xAccount } = req.body;
    
    // Verify wallet ownership
    if (req.user.address.toLowerCase() !== req.params.address.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOneAndUpdate(
      { walletAddress: req.params.address.toLowerCase() },
      {
        username,
        preferredName,
        description,
        xAccount,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
