import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { FaTwitter, FaEdit, FaSave, FaMedal, FaCoins, FaWallet } from 'react-icons/fa';
import SOuLmateProfileForm from '../../components/SOuLmateProfileForm';
import { WalletButton } from '../../components/WalletButton';
import { fetchProfile, updateProfile } from '../../api/profile';
import '../../styles/SOuLmate.css';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { FaXTwitter, FaUserPlus } from 'react-icons/fa6';
import { CheckCircle as CheckCircleIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';

const SupportQuests = () => {
  const [quests, setQuests] = useState([
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

  const handleQuestAction = (quest) => {
    window.open(quest.link, '_blank');
    // Here you would typically verify the action through your backend
    // and update the quest status
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#4CAF50' }}>
        SOuL Sanctuary Support Quests
      </Typography>
      <Grid container spacing={3}>
        {quests.map((quest) => (
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
    </Box>
  );
};

const ReferralQuest = ({ walletAddress }) => {
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalXPEarned: 0,
    referralLink: `https://soulsanctuary.io/ref/${walletAddress}`,
    referredUsers: []
  });

  const [copied, setCopied] = useState(false);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralStats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deadlineDate = new Date('2024-12-31T23:59:59+08:00');
  const now = new Date();
  const timeLeft = deadlineDate - now;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <Box sx={{ mb: 4 }}>
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
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" color="#4CAF50">
                {(referralStats.totalReferrals * 80000).toLocaleString()} XP Earned
              </Typography>
              <Typography variant="caption" color="gray">
                Ends in {daysLeft} days
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
            Earn 80,000 XP for each successful referral! Both you and your referred friend will receive the XP reward when they connect their wallet and register. No limit on referrals until December 31, 2024!
          </Typography>

          <Box sx={{ 
            bgcolor: '#2a2a2a', 
            p: 2, 
            borderRadius: 1, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="body2" color="white" sx={{ 
              wordBreak: 'break-all',
              flex: 1,
              mr: 2
            }}>
              {referralStats.referralLink}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ContentCopyIcon />}
              onClick={copyReferralLink}
              size="small"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#2a2a2a', p: 2 }}>
                  <Typography variant="h4" color="#4CAF50" sx={{ mb: 1 }}>
                    {referralStats.totalReferrals}
                  </Typography>
                  <Typography variant="body2" color="gray">
                    Total Referrals
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#2a2a2a', p: 2 }}>
                  <Typography variant="h4" color="#4CAF50" sx={{ mb: 1 }}>
                    {(referralStats.totalReferrals * 80000).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="gray">
                    Total XP Earned
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {referralStats.referredUsers.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="white" sx={{ mb: 2 }}>
                Recent Referrals
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {referralStats.referredUsers.map((user, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                      p: 1,
                      bgcolor: '#2a2a2a',
                      borderRadius: 1
                    }}
                  >
                    <FaUserPlus color="#4CAF50" />
                    <Typography variant="body2" color="white">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </Typography>
                    <Typography variant="caption" color="gray" sx={{ ml: 'auto' }}>
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const SOuLmateProfile = () => {
  const { connected, publicKey, tokenBalances } = useWallet();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!publicKey || !connected) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Update wallet balance from context
        const walletBalance = tokenBalances.SOL.toFixed(4);
        
        // Fetch or create profile
        const data = await fetchProfile(publicKey.toString());
        
        // Update profile with latest wallet balance
        const updatedProfile = await updateProfile(publicKey.toString(), {
          ...data,
          walletBalance
        });
        
        setProfile(updatedProfile);
        setLoading(false);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Unable to load profile. Please try again.');
        setLoading(false);
      }
    };

    loadProfile();
  }, [publicKey, connected, tokenBalances.SOL]);

  const handleProfileUpdate = async (formData) => {
    try {
      const walletAddress = publicKey.toString();
      const updatedProfile = await updateProfile(walletAddress, {
        ...formData,
        walletBalance: tokenBalances.SOL.toFixed(4)
      });
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw new Error('Failed to update profile');
    }
  };

  if (!connected) {
    // Format the provided time string
    const providedTime = new Date('2024-12-08T15:12:49+08:00');
    const formattedTime = providedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const formattedDate = providedTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="connect-wallet-container">
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem', 
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #4CAF50'
        }}>
          <h1 style={{ 
            color: '#4CAF50', 
            fontSize: '3rem', 
            marginBottom: '1rem'
          }}>SOuL Sanctuary Season 1</h1>
          <h2 style={{ 
            color: 'white', 
            fontSize: '2rem', 
            marginBottom: '1rem'
          }}>Sowing SOuL Seeds</h2>
          <p style={{
            color: '#e0e0e0',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            fontFamily: 'monospace'
          }}>{formattedDate} • {formattedTime}</p>
        </div>
        <h2>Connect Your Wallet</h2>
        <p>to earn SOuL XPs which you can exchange to SOuL LSTs</p>
        <WalletButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button className="edit-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="soulmate-profile">
      <div className="profile-header">
        <div className="profile-photo-container">
          {profile?.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={profile.preferredName || 'Profile'} 
              className="profile-photo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${profile.preferredName || 'U'}&background=random`;
              }}
            />
          ) : (
            <div className="profile-photo-placeholder">
              {profile?.preferredName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1>{profile?.preferredName || 'Anonymous'}</h1>
          {profile?.username && (
            <div className="username">@{profile.username}</div>
          )}
          <div className="profile-social">
            {profile?.xAccount && (
              <a 
                href={`https://x.com/${profile.xAccount.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="x-account"
              >
                <FaTwitter /> @{profile.xAccount.replace('@', '')}
              </a>
            )}
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="wallet-connection">
        <WalletButton />
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-change">+2.5% this week</span>
          <br />
          <span className="stat-label">Wallet Balance</span>
          <div className="stat-value">
            <FaCoins />
            {profile?.walletBalance || '0'}
            <span className="unit">SOL</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-change">Level 2</span>
          <br />
          <span className="stat-label">SOuL XP</span>
          <div className="stat-value">
            <FaMedal />
            {profile?.soulXP || '0'}
            <span className="unit">XP</span>
          </div>
        </div>
      </div>

      <div className="section-container">
        <h2 className="section-title">
          <FaMedal /> Badges Earned
        </h2>
        {profile?.badges?.length > 0 ? (
          <div className="grid-container">
            {profile.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                <img src={badge.icon} alt={badge.name} className="badge-icon" />
                <p className="badge-name">{badge.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No badges earned yet. Start participating in the community to earn your first badge!</p>
            <p>Visit the <a href="/community">Community</a> section to get started.</p>
          </div>
        )}
      </div>

      <div className="section-container">
        <h2 className="section-title">
          <FaMedal /> Profile Quests
        </h2>
        <div className="quest-list">
          <div className={`quest-item ${connected ? 'completed' : ''}`}>
            <div className="quest-status">
              {connected ? '✓' : '○'}
            </div>
            <div className="quest-info">
              <div className="quest-name">Connect Wallet</div>
              <div className="quest-reward">+8,000 XP</div>
            </div>
          </div>
          <div className={`quest-item ${profile?.username ? 'completed' : ''}`}>
            <div className="quest-status">
              {profile?.username ? '✓' : '○'}
            </div>
            <div className="quest-info">
              <div className="quest-name">Set Username</div>
              <div className="quest-reward">+8,000 XP</div>
            </div>
          </div>
          <div className={`quest-item ${profile?.preferredName && profile.preferredName !== 'Anonymous' ? 'completed' : ''}`}>
            <div className="quest-status">
              {profile?.preferredName && profile.preferredName !== 'Anonymous' ? '✓' : '○'}
            </div>
            <div className="quest-info">
              <div className="quest-name">Set Preferred Name</div>
              <div className="quest-reward">+8,000 XP</div>
            </div>
          </div>
          <div className={`quest-item ${profile?.xAccount ? 'completed' : ''}`}>
            <div className="quest-status">
              {profile?.xAccount ? '✓' : '○'}
            </div>
            <div className="quest-info">
              <div className="quest-name">Link X Account</div>
              <div className="quest-reward">+8,000 XP</div>
            </div>
          </div>
          <div className={`quest-item ${profile?.profilePicture ? 'completed' : ''}`}>
            <div className="quest-status">
              {profile?.profilePicture ? '✓' : '○'}
            </div>
            <div className="quest-info">
              <div className="quest-name">Set Profile Picture</div>
              <div className="quest-reward">+8,000 XP</div>
            </div>
          </div>
          <div className={`quest-item completed`}>
            <div className="quest-status">✓</div>
            <div className="quest-info">
              <div className="quest-name">Save Profile</div>
              <div className="quest-reward">+8,000 XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container">
        <h2 className="section-title">
          <FaCoins /> NFT Collection
        </h2>
        {profile?.nfts?.length > 0 ? (
          <div className="grid-container">
            {profile.nfts.map((nft, index) => (
              <div key={index} className="nft-item">
                <img src={nft.image} alt={nft.name} className="nft-image" />
                <p className="nft-name">{nft.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Your NFT collection is empty. Discover unique digital assets in our marketplace!</p>
            <p>Browse the <a href="/marketplace">Marketplace</a> to start your collection.</p>
          </div>
        )}
      </div>

      <div className="section-container">
        <SupportQuests />
      </div>
      <div className="section-container">
        <ReferralQuest walletAddress={publicKey?.toString()} />
      </div>

      {isEditing && (
        <SOuLmateProfileForm
          profile={profile}
          onSubmit={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default SOuLmateProfile;
