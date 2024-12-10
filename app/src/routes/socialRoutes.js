const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const { profileUpdateLimiter } = require('../middleware/rateLimit');
const storage = require('../utils/storage');

// Follow a user
router.post('/:walletAddress/follow', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.user.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await profile.follow(req.params.walletAddress);
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unfollow a user
router.post('/:walletAddress/unfollow', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.user.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await profile.unfollow(req.params.walletAddress);
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get followers
router.get('/:walletAddress/followers', async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const followers = await Profile.find(
      { walletAddress: { $in: profile.followers } },
      'walletAddress username profilePicture'
    );

    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get following
router.get('/:walletAddress/following', async (req, res) => {
  try {
    const profile = await Profile.findOne({ walletAddress: req.params.walletAddress });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const following = await Profile.find(
      { walletAddress: { $in: profile.following } },
      'walletAddress username profilePicture'
    );

    res.json(following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload profile picture
router.post('/profile-picture', auth, profileUpdateLimiter, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imageUrl = await storage.uploadProfilePicture(
      req.files.image.data,
      req.user.walletAddress
    );

    // Update profile with new image URL
    const profile = await Profile.findOne({ walletAddress: req.user.walletAddress });
    if (profile.profilePicture) {
      // Delete old profile picture
      await storage.deleteProfilePicture(profile.profilePicture);
    }
    profile.profilePicture = imageUrl;
    await profile.save();

    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get signed URL for direct upload
router.get('/upload-url', auth, async (req, res) => {
  try {
    const contentType = req.query.contentType || 'image/jpeg';
    const urls = await storage.getSignedUploadUrl(req.user.walletAddress, contentType);
    res.json(urls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update online status
router.post('/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const profile = await Profile.findOne({ walletAddress: req.user.walletAddress });
    profile.status = status;
    await profile.save();

    // Broadcast status update through WebSocket
    req.app.locals.ws.broadcastProfileUpdate(req.user.walletAddress, profile);

    res.json({ status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
