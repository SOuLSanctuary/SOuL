import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

const SocialIntegration = ({ profile, onUpdate }) => {
  const [xUsername, setXUsername] = useState(profile?.xAccount || '');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleXVerification = async () => {
    try {
      setVerifying(true);
      setError('');
      setSuccess('');

      // This will be implemented when the social media app is created
      const response = await fetch('/api/social/verify-x', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          xUsername,
          walletAddress: profile.walletAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('X account verified successfully!');
        if (onUpdate) {
          onUpdate({ ...profile, xAccount: xUsername });
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to verify X account. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Social Media Integration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="X (Twitter) Username"
          value={xUsername}
          onChange={(e) => setXUsername(e.target.value)}
          placeholder="@username"
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleXVerification}
          disabled={verifying || !xUsername}
        >
          {verifying ? 'Verifying...' : 'Verify X Account'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        More social integrations coming soon...
      </Typography>
    </Paper>
  );
};

export default SocialIntegration;
