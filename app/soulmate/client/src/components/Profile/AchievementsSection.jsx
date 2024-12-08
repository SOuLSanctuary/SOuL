import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import { FaXTwitter } from 'react-icons/fa6';
import { Share as ShareIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const AchievementsSection = ({ profile, achievements, badges }) => {
  const [supportQuests, setSupportQuests] = useState([
    {
      id: 'follow-quest',
      title: 'Follow SOuL Sanctuary',
      description: 'Follow SOuL Sanctuary on X',
      xp: 80000,
      link: 'https://x.com/S0uLSanctuary',
      completed: false,
      type: 'follow'
    },
    {
      id: 'repost-quest',
      title: 'Repost & Deep Dive',
      description: 'Repost and engage with our announcement',
      xp: 80000,
      link: 'https://x.com/S0uLSanctuary/status/1865663901066809665',
      completed: false,
      type: 'repost'
    }
  ]);

  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalXPEarned: 0,
    referralLink: `https://soulsanctuary.io/ref/${profile?.walletAddress}`
  });

  const handleQuestAction = async (quest) => {
    window.open(quest.link, '_blank');
    // Here you would typically verify the action through your backend
    // and update the quest status
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralStats.referralLink);
    // Add a toast notification here
  };

  const calculateProgress = (achievement) => {
    // This would be connected to your achievement tracking system
    return Math.floor(Math.random() * 100); // Placeholder
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Achievements Section */}
      <Typography variant="h5" gutterBottom>
        Achievements & Badges
      </Typography>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Achievements
      </Typography>
      <Grid container spacing={3}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.name}>
            <Card sx={{ 
              bgcolor: '#1a1a1a',
              border: '1px solid #333',
              '&:hover': { borderColor: '#4CAF50' }
            }}>
              <CardContent>
                <Typography variant="h6" color="white">
                  {achievement.name}
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
                  {achievement.description}
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(achievement)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {achievement.earnedDate
                    ? `Earned on ${new Date(achievement.earnedDate).toLocaleDateString()}`
                    : 'In Progress'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Badges
      </Typography>
      <Grid container spacing={3}>
        {badges.map((badge) => (
          <Grid item xs={12} sm={6} md={4} key={badge.name}>
            <Card sx={{ 
              bgcolor: '#1a1a1a',
              border: '1px solid #333',
              '&:hover': { borderColor: '#4CAF50' }
            }}>
              <CardContent>
                <Typography variant="h6" color="white">
                  {badge.name}
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
                  Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Support Quests Section */}
      <Typography variant="h5" sx={{ mt: 4, mb: 3, color: '#4CAF50' }}>
        SOuL Sanctuary Support Quests
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {supportQuests.map((quest) => (
          <Grid item xs={12} md={6} key={quest.id}>
            <Card sx={{ 
              bgcolor: '#1a1a1a',
              border: '1px solid #333',
              '&:hover': { borderColor: '#4CAF50' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="white">
                    {quest.title}
                  </Typography>
                  <Typography variant="subtitle1" color="#4CAF50">
                    {quest.xp.toLocaleString()} XP
                  </Typography>
                </Box>
                <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
                  {quest.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaXTwitter />}
                    onClick={() => handleQuestAction(quest)}
                    disabled={quest.completed}
                  >
                    {quest.completed ? 'Completed' : quest.type === 'follow' ? 'Follow' : 'Repost'}
                  </Button>
                  {quest.completed && (
                    <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Referral Quest Section */}
      <Typography variant="h5" sx={{ mb: 3, color: '#4CAF50' }}>
        SOuL Sanctuary Ranger Referral Quest
      </Typography>
      <Card sx={{ 
        bgcolor: '#1a1a1a',
        border: '1px solid #333',
        '&:hover': { borderColor: '#4CAF50' }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="white">
              Ranger Referral Program
            </Typography>
            <Typography variant="subtitle1" color="#4CAF50">
              {(referralStats.totalReferrals * 80000).toLocaleString()} XP Earned
            </Typography>
          </Box>
          <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
            Earn 80,000 XP for each successful referral who connects their wallet and registers an account.
            No limit on referrals!
          </Typography>
          <Box sx={{ bgcolor: '#2a2a2a', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" color="white" sx={{ wordBreak: 'break-all' }}>
              {referralStats.referralLink}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={copyReferralLink}
            >
              Copy Referral Link
            </Button>
            <Typography variant="body2" color="gray">
              Total Referrals: {referralStats.totalReferrals}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AchievementsSection;
