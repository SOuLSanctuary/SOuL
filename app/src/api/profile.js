const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://app.soulsanctuary.cloud';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Network response was not ok');
  }
  return response.json();
};

const addAuthTokenToHeaders = (headers = {}) => {
  const token = window.localStorage.getItem('auth_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 300));

// Simulated API functions for profile management
export const checkUsernameAvailability = async (username) => {
  await simulateNetworkDelay();
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/check-username`, {
      method: 'POST',
      headers: addAuthTokenToHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

export const uploadProfileImage = async (imageData) => {
  await simulateNetworkDelay();
  // If it's already a base64 string, return it
  if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
    return imageData;
  }
  // If it's a blob, convert to base64
  if (imageData instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageData);
    });
  }
  throw new Error('Invalid image data');
};

const XP_REWARDS = {
  WALLET_CONNECT: 8000,
  USERNAME_SET: 8000,
  PREFERRED_NAME_SET: 8000,
  X_ACCOUNT_SET: 8000,
  PROFILE_PHOTO_SET: 8000,
  PROFILE_SAVE: 8000
};

const calculateProfileXP = (profile) => {
  let totalXP = 0;
  
  // Wallet connection XP (if profile exists, wallet was connected)
  totalXP += XP_REWARDS.WALLET_CONNECT;
  
  // Username XP
  if (profile.username) {
    totalXP += XP_REWARDS.USERNAME_SET;
  }
  
  // Preferred name XP
  if (profile.preferredName && profile.preferredName !== 'Anonymous') {
    totalXP += XP_REWARDS.PREFERRED_NAME_SET;
  }
  
  // X account XP
  if (profile.xAccount) {
    totalXP += XP_REWARDS.X_ACCOUNT_SET;
  }
  
  // Profile photo XP
  if (profile.profilePicture) {
    totalXP += XP_REWARDS.PROFILE_PHOTO_SET;
  }
  
  // Profile save XP (if profile exists in storage)
  // if (mockProfiles.has(profile.walletAddress)) {
  //   totalXP += XP_REWARDS.PROFILE_SAVE;
  // }
  
  return totalXP;
};

export const fetchProfile = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/${walletAddress}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Profile doesn't exist
      }
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const createProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const updateProfile = async (walletAddress, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/${walletAddress}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const verifyXAccount = async (xAccount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/verify-x`, {
      method: 'POST',
      headers: addAuthTokenToHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ xAccount }),
    });
    
    if (response.status === 404) {
      return { verified: false };
    }
    return handleResponse(response);
  } catch (error) {
    console.error('Error verifying X account:', error);
    throw error;
  }
};
