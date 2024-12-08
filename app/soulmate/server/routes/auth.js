const express = require('express');
const jwt = require('jsonwebtoken');
const { verifySignature } = require('../middleware/auth');
const Profile = require('../models/Profile');

const router = express.Router();

// Generate nonce for wallet signature
router.post('/nonce', async (req, res) => {
  try {
    const { address } = req.body;
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
    
    // Store nonce in session or temporary storage
    // For demo, we'll send it back directly
    res.json({ message, nonce });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify wallet signature and authenticate
router.post('/verify', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    const isValid = await verifySignature(address, signature, message);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create profile
    let profile = await Profile.findOne({ walletAddress: address.toLowerCase() });
    if (!profile) {
      profile = new Profile({
        walletAddress: address.toLowerCase(),
        username: `user_${address.slice(2, 8)}`,
        preferredName: `SOuLmate ${address.slice(2, 8)}`,
      });
      await profile.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: profile._id, address: address.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
