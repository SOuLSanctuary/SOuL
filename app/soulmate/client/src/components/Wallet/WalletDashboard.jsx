import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { SUPPORTED_NETWORKS } from '../../config/networks';
import { ethers } from 'ethers';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const WalletDashboard = ({ profile }) => {
  const { library } = useWeb3React();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({});
  const [tvl, setTvl] = useState(0);

  useEffect(() => {
    if (profile && library) {
      fetchBalances();
    }
  }, [profile, library]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const newBalances = {};
      
      for (const network of profile.walletDetails.networks) {
        const provider = new ethers.providers.JsonRpcProvider(
          SUPPORTED_NETWORKS[network.chainId].rpcUrl
        );
        
        const balance = await provider.getBalance(network.address);
        newBalances[network.chainId] = ethers.utils.formatEther(balance);
      }
      
      setBalances(newBalances);
      calculateTVL();
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTVL = () => {
    let total = 0;
    
    // Add staking value
    profile.walletDetails.staking?.forEach(stake => {
      total += parseFloat(stake.amount);
    });

    // Add LP value
    profile.walletDetails.liquidityPool?.forEach(pool => {
      total += parseFloat(pool.amount);
    });

    setTvl(total);
  };

  const renderBalances = () => (
    <Grid container spacing={3}>
      {profile.walletDetails.networks.map((network) => (
        <Grid item xs={12} sm={6} md={4} key={network.chainId}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {SUPPORTED_NETWORKS[network.chainId].name}
                </Typography>
                <img
                  src={`/network-icons/${network.chainId}.png`}
                  alt={SUPPORTED_NETWORKS[network.chainId].name}
                  width="24"
                  height="24"
                />
              </Box>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {balances[network.chainId] || '0'} {SUPPORTED_NETWORKS[network.chainId].nativeCurrency.symbol}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderStaking = () => (
    <Grid container spacing={3}>
      {profile.walletDetails.staking.map((stake, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Typography variant="h6">Staking Pool #{stake.poolId}</Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {stake.amount} SOuL
              </Typography>
              <Typography color="text.secondary">
                APY: {stake.apy}%
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Started: {new Date(stake.startDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderLiquidity = () => (
    <Grid container spacing={3}>
      {profile.walletDetails.liquidityPool.map((pool, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Typography variant="h6">{pool.poolName}</Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {pool.amount} LP
              </Typography>
              <Typography color="text.secondary">
                Share: {pool.share}%
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Recent Rewards:</Typography>
                {pool.rewards.slice(0, 3).map((reward, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    {reward.amount} - {new Date(reward.claimDate).toLocaleDateString()}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Wallet Dashboard</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchBalances} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Balance</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {Object.values(balances).reduce((a, b) => a + parseFloat(b), 0).toFixed(4)} SOuL
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TimelineIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Value Locked</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {tvl.toFixed(4)} SOuL
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ShowChartIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">SOuL XP</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {profile.walletDetails.soulXP.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Balances" />
          <Tab label="Staking" />
          <Tab label="Liquidity" />
        </Tabs>

        {selectedTab === 0 && renderBalances()}
        {selectedTab === 1 && renderStaking()}
        {selectedTab === 2 && renderLiquidity()}
      </Paper>
    </Box>
  );
};

export default WalletDashboard;
