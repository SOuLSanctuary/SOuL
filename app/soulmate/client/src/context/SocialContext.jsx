import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

const SocialContext = createContext();

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export const SocialProvider = ({ children }) => {
  const { account } = useWeb3React();
  const [socialConnections, setSocialConnections] = useState({
    x: null,
    // Add other social platforms here
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      fetchSocialConnections();
    }
  }, [account]);

  const fetchSocialConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/social/connections/${account}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setSocialConnections(data);
    } catch (error) {
      console.error('Error fetching social connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSocial = async (platform, userData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/social/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          platform,
          userData,
          walletAddress: account,
        }),
      });
      const data = await response.json();
      setSocialConnections(prev => ({
        ...prev,
        [platform]: data,
      }));
      return data;
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectSocial = async (platform) => {
    try {
      setLoading(true);
      await fetch(`/api/social/disconnect/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      setSocialConnections(prev => ({
        ...prev,
        [platform]: null,
      }));
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SocialContext.Provider
      value={{
        socialConnections,
        loading,
        connectSocial,
        disconnectSocial,
        refreshConnections: fetchSocialConnections,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export default SocialContext;
