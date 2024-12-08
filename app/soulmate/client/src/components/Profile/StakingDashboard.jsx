import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  useTheme,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add,
  Remove,
  AccountBalance,
  Timeline,
  Info,
  LocalAtm,
  SwapHoriz
} from '@mui/icons-material';

const StakingDashboard = ({ staking, liquidityPools }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [stakeDialog, setStakeDialog] = useState(false);
  const [unstakeDialog, setUnstakeDialog] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [amount, setAmount] = useState('');

  const handleStake = (pool) => {
    setSelectedPool(pool);
    setStakeDialog(true);
  };

  const handleUnstake = (pool) => {
    setSelectedPool(pool);
    setUnstakeDialog(true);
  };

  const handleSubmitStake = async () => {
    // Implement staking logic here
    setStakeDialog(false);
    setAmount('');
  };

  const handleSubmitUnstake = async () => {
    // Implement unstaking logic here
    setUnstakeDialog(false);
    setAmount('');
  };

  const calculateTotalStaked = () => {
    return staking?.reduce((total, stake) => total + parseFloat(stake.amount), 0) || 0;
  };

  const calculateTotalRewards = () => {
    return staking?.reduce((total, stake) => {
      return total + stake.rewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);
    }, 0) || 0;
  };

  const StakingStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalance color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Staked</Typography>
            </Box>
            <Typography variant="h4">{calculateTotalStaked()} SOuL</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalAtm color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Rewards</Typography>
            </Box>
            <Typography variant="h4">{calculateTotalRewards()} SOuL</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Timeline color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Pools</Typography>
            </Box>
            <Typography variant="h4">{staking?.length || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SwapHoriz color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">LP Positions</Typography>
            </Box>
            <Typography variant="h4">{liquidityPools?.length || 0}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const StakingPools = () => (
    <Grid container spacing={3}>
      {staking?.map((pool, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Pool #{pool.poolId}</Typography>
                <Tooltip title="Pool Information">
                  <IconButton size="small">
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Staked Amount
                </Typography>
                <Typography variant="h5">
                  {pool.amount} SOuL
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  APY
                </Typography>
                <Typography variant="h6" color="primary">
                  {pool.apy}%
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography color="textSecondary" gutterBottom>
                  Rewards Earned
                </Typography>
                <Typography variant="h6" color="success.main">
                  {pool.rewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0)} SOuL
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleStake(pool)}
                  fullWidth
                >
                  Stake More
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Remove />}
                  onClick={() => handleUnstake(pool)}
                  fullWidth
                >
                  Unstake
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const LiquidityPools = () => (
    <Grid container spacing={3}>
      {liquidityPools?.map((pool, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {pool.poolName}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Liquidity Provided
                </Typography>
                <Typography variant="h5">
                  {pool.amount} LP
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Pool Share
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(pool.share)}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body2">
                    {pool.share}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography color="textSecondary" gutterBottom>
                  Rewards Earned
                </Typography>
                <Typography variant="h6" color="success.main">
                  {pool.rewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0)} SOuL
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
              >
                Manage Position
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Staking & Liquidity
        </Typography>

        <StakingStats />

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Staking Pools" />
          <Tab label="Liquidity Pools" />
        </Tabs>

        {activeTab === 0 && <StakingPools />}
        {activeTab === 1 && <LiquidityPools />}
      </Paper>

      {/* Stake Dialog */}
      <Dialog open={stakeDialog} onClose={() => setStakeDialog(false)}>
        <DialogTitle>Stake SOuL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount to Stake"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStakeDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitStake} variant="contained">
            Stake
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unstake Dialog */}
      <Dialog open={unstakeDialog} onClose={() => setUnstakeDialog(false)}>
        <DialogTitle>Unstake SOuL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount to Unstake"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnstakeDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitUnstake} variant="contained" color="error">
            Unstake
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StakingDashboard;
