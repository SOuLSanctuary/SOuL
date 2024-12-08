import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  Button,
  Avatar,
  Skeleton,
  IconButton,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Share as ShareIcon,
  PhotoCamera as PhotoCameraIcon,
  VerifiedUser as VerifiedUserIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon
} from '@mui/icons-material';
import { useWeb3React } from '@web3-react/core';
import WalletDashboard from '../components/Wallet/WalletDashboard';
import AchievementsSection from '../components/Profile/AchievementsSection';
import SocialIntegration from '../components/Social/SocialIntegration';
import ActivityFeed from '../components/Profile/ActivityFeed';
import GamificationStats from '../components/Profile/GamificationStats';
import NFTGallery from '../components/Profile/NFTGallery';
import StakingDashboard from '../components/Profile/StakingDashboard';

const ProfilePage = () => {
  const theme = useTheme();
  const { account } = useWeb3React();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (account) {
      fetchProfile();
    }
  }, [account]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${account}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });
      const data = await response.json();
      setProfile(prev => ({ ...prev, profilePicture: data.profilePicture }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <Container maxWidth="lg">
      {/* Profile Header */}
      <Paper
        sx={{
          position: 'relative',
          mb: 4,
          backgroundImage: profile?.bannerPicture 
            ? `url(${profile.bannerPicture})`
            : 'linear-gradient(120deg, #2196f3 0%, #3f51b5 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 200,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: 32,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile?.profilePicture}
              sx={{
                width: 120,
                height: 120,
                border: `4px solid ${theme.palette.background.paper}`,
              }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={handleProfilePictureUpload}
            />
            <label htmlFor="profile-picture-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                <PhotoCameraIcon sx={{ color: 'white' }} />
              </IconButton>
            </label>
          </Box>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography variant="h4" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              {profile?.preferredName}
              {profile?.verified && (
                <Tooltip title="Verified Profile">
                  <VerifiedUserIcon color="primary" />
                </Tooltip>
              )}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              @{profile?.username}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
          <IconButton sx={{ color: 'white' }}>
            <ShareIcon />
          </IconButton>
          <IconButton 
            sx={{ color: 'white' }}
            component="a"
            href="https://x.com/S0uLSanctuary"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on X"
          >
            <TwitterIcon />
          </IconButton>
          <IconButton 
            sx={{ color: 'white' }}
            component="a"
            href="https://t.me/+F_J4pkQ_JL4xYWI1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Telegram"
          >
            <TelegramIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Profile Content */}
      <Box sx={{ mt: 8 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 4 }}
        >
          <Tab label="Overview" />
          <Tab label="Wallet" />
          <Tab label="Achievements" />
          <Tab label="NFT Gallery" />
          <Tab label="Staking" />
          <Tab label="Activity" />
          <Tab label="Social" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <GamificationStats profile={profile} />
                <ActivityFeed activities={profile?.activity} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Typography variant="body1">
                    SOuL XP: {profile?.walletDetails.soulXP.total}
                  </Typography>
                  <Typography variant="body1">
                    Achievements: {profile?.achievements?.length}
                  </Typography>
                  <Typography variant="body1">
                    NFTs: {profile?.walletDetails.nfts?.length}
                  </Typography>
                </Paper>
                <SocialIntegration profile={profile} />
              </Grid>
            </Grid>
          )}
          {activeTab === 1 && <WalletDashboard profile={profile} />}
          {activeTab === 2 && (
            <AchievementsSection
              achievements={profile?.achievements}
              badges={profile?.walletDetails.badges}
            />
          )}
          {activeTab === 3 && <NFTGallery nfts={profile?.walletDetails.nfts} />}
          {activeTab === 4 && (
            <StakingDashboard
              staking={profile?.walletDetails.staking}
              liquidityPools={profile?.walletDetails.liquidityPool}
            />
          )}
          {activeTab === 5 && <ActivityFeed activities={profile?.activity} />}
          {activeTab === 6 && <SocialIntegration profile={profile} />}
        </Box>
      </Box>
    </Container>
  );
};

const ProfileSkeleton = () => (
  <Container maxWidth="lg">
    <Paper sx={{ height: 200, mb: 4 }}>
      <Skeleton variant="rectangular" height={200} />
    </Paper>
    <Box sx={{ mt: 8 }}>
      <Skeleton variant="rectangular" height={48} sx={{ mb: 4 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </Grid>
      </Grid>
    </Box>
  </Container>
);

export default ProfilePage;
