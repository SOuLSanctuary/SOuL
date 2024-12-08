const axios = require('axios');
const Profile = require('../models/Profile');

class SocialIntegrationService {
  // X (Twitter) Integration
  static async verifyXAccount(walletAddress, username) {
    try {
      // This would typically involve OAuth2 flow with X API
      // For now, we'll simulate verification
      const profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!profile) throw new Error('Profile not found');

      profile.socialAccounts.x = {
        username,
        verified: true,
        verificationDate: new Date()
      };

      await profile.save();
      return { success: true, message: 'X account verified successfully' };
    } catch (error) {
      throw new Error(`X verification failed: ${error.message}`);
    }
  }

  // Discord Integration
  static async verifyDiscordAccount(walletAddress, code) {
    try {
      // Exchange code for Discord access token
      const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      });

      // Get Discord user info
      const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
      });

      const profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!profile) throw new Error('Profile not found');

      profile.socialAccounts.discord = {
        username: userResponse.data.username,
        discriminator: userResponse.data.discriminator,
        verified: true,
        verificationDate: new Date()
      };

      await profile.save();
      return { success: true, message: 'Discord account verified successfully' };
    } catch (error) {
      throw new Error(`Discord verification failed: ${error.message}`);
    }
  }

  // Telegram Integration
  static async verifyTelegramAccount(walletAddress, telegramData) {
    try {
      // Verify Telegram login widget data
      const { id, first_name, username, hash } = telegramData;
      
      // Here you would verify the hash with your bot token
      // const checkString = `auth_date=${auth_date}\\nfirst_name=${first_name}\\nid=${id}\\nusername=${username}`;
      // const secretKey = crypto.createHash('sha256').update(botToken).digest();
      // const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

      const profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!profile) throw new Error('Profile not found');

      profile.socialAccounts.telegram = {
        username,
        verified: true,
        verificationDate: new Date()
      };

      await profile.save();
      return { success: true, message: 'Telegram account verified successfully' };
    } catch (error) {
      throw new Error(`Telegram verification failed: ${error.message}`);
    }
  }

  // Instagram Integration
  static async verifyInstagramAccount(walletAddress, code) {
    try {
      // Exchange code for Instagram access token
      const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code
      });

      // Get Instagram user info
      const userResponse = await axios.get(`https://graph.instagram.com/me?fields=username&access_token=${tokenResponse.data.access_token}`);

      const profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!profile) throw new Error('Profile not found');

      profile.socialAccounts.instagram = {
        username: userResponse.data.username,
        verified: true,
        verificationDate: new Date()
      };

      await profile.save();
      return { success: true, message: 'Instagram account verified successfully' };
    } catch (error) {
      throw new Error(`Instagram verification failed: ${error.message}`);
    }
  }

  // Get all social connections for a profile
  static async getSocialConnections(walletAddress) {
    try {
      const profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!profile) throw new Error('Profile not found');

      return profile.socialAccounts;
    } catch (error) {
      throw new Error(`Failed to get social connections: ${error.message}`);
    }
  }

  // Disconnect social account
  static async disconnectSocialAccount(walletAddress, platform) {
    try {
      const profile = await Profile.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!profile) throw new Error('Profile not found');

      if (profile.socialAccounts[platform]) {
        profile.socialAccounts[platform] = null;
        await profile.save();
      }

      return { success: true, message: `${platform} account disconnected successfully` };
    } catch (error) {
      throw new Error(`Failed to disconnect ${platform} account: ${error.message}`);
    }
  }
}

module.exports = SocialIntegrationService;
