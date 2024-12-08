import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Avatar, Paper } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { account, library } = useWeb3React();

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
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch(`/api/profile/${account}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      setProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!account) {
    return (
      <Container>
        <Typography variant="h5">Please connect your wallet to view your profile</Typography>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Typography variant="h5">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={profile.profilePicture}
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              <Typography variant="h5">{profile.preferredName}</Typography>
              <Typography color="textSecondary">@{profile.username}</Typography>
              <Typography variant="body2" color="primary">
                {profile.communityRole}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h6">Wallet Details</Typography>
              <Typography>Balance: {profile.walletDetails.balance} SOuL</Typography>
              <Typography>XP: {profile.walletDetails.soulXP}</Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>Badges</Typography>
              <Grid container spacing={2}>
                {profile.walletDetails.badges.map((badge, index) => (
                  <Grid item key={index}>
                    <img src={badge.imageUrl} alt={badge.name} width="50" />
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" sx={{ mt: 2 }}>NFTs</Typography>
              <Grid container spacing={2}>
                {profile.walletDetails.nfts.map((nft, index) => (
                  <Grid item key={index}>
                    <img src={nft.imageUrl} alt={nft.name} width="100" />
                  </Grid>
                ))}
              </Grid>

              {!isEditing && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
