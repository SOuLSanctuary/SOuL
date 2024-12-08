import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  EmojiEvents,
  Stars,
  Timeline,
  Help
} from '@mui/icons-material';

const GamificationStats = ({ profile }) => {
  const theme = useTheme();

  const calculateLevel = (xp) => {
    // Example level calculation: every 1000 XP is a new level
    return Math.floor(xp / 1000) + 1;
  };

  const calculateProgress = (xp) => {
    // Calculate progress to next level
    return (xp % 1000) / 10;
  };

  const level = calculateLevel(profile?.walletDetails.soulXP.total || 0);
  const progress = calculateProgress(profile?.walletDetails.soulXP.total || 0);

  const stats = [
    {
      title: 'Level',
      value: level,
      icon: <Stars color="primary" />,
      tooltip: 'Your current SOuLmate level based on XP'
    },
    {
      title: 'Achievements',
      value: profile?.achievements?.length || 0,
      icon: <EmojiEvents color="primary" />,
      tooltip: 'Total achievements earned'
    },
    {
      title: 'Activity Score',
      value: profile?.activity?.length || 0,
      icon: <Timeline color="primary" />,
      tooltip: 'Score based on your recent activity'
    }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gamification Stats</Typography>
        <Tooltip title="Learn more about SOuLmate levels and achievements">
          <IconButton>
            <Help />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Tooltip title={stat.tooltip}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.default,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                {stat.icon}
                <Typography variant="h4" sx={{ my: 1 }}>
                  {stat.value}
                </Typography>
                <Typography color="textSecondary">
                  {stat.title}
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">
            Level {level}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {profile?.walletDetails.soulXP.total} / {level * 1000} XP
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.primary.light,
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
      </Box>

      <Typography variant="body2" color="textSecondary">
        {1000 - (profile?.walletDetails.soulXP.total % 1000)} XP needed for next level
      </Typography>

      {profile?.walletDetails.soulXP.history?.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recent XP Gains
          </Typography>
          {profile.walletDetails.soulXP.history.slice(0, 3).map((xp, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
              }}
            >
              <Typography variant="body2">
                {xp.reason}
              </Typography>
              <Typography variant="body2" color="primary">
                +{xp.amount} XP
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default GamificationStats;
