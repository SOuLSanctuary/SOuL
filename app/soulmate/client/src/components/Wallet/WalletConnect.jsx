import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Alert } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 137] // Add your supported chain IDs
});

const WalletConnect = () => {
  const { activate, active, account, library, deactivate } = useWeb3React();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      await activate(injected);
      
      // Get nonce from server
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: account }),
      });
      const { message, nonce } = await nonceResponse.json();

      // Sign message
      const signature = await library.getSigner().signMessage(message);

      // Verify signature with backend
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: account,
          signature,
          message,
        }),
      });

      const { token, profile } = await verifyResponse.json();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    try {
      deactivate();
      localStorage.removeItem('auth_token');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {active ? (
        <Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Connected: {account.substring(0, 6)}...{account.substring(38)}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={disconnectWallet}
            disabled={loading}
          >
            Disconnect Wallet
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect;
