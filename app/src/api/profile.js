const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

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

// Mock data store for development
const STORAGE_KEY = 'soulmate_profiles';

const loadProfilesFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Map(JSON.parse(stored)) : new Map();
  } catch (error) {
    console.error('Error loading profiles from storage:', error);
    return new Map();
  }
};

const saveProfilesToStorage = (profiles) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(profiles.entries())));
  } catch (error) {
    console.error('Error saving profiles to storage:', error);
  }
};

const mockProfiles = loadProfilesFromStorage();

const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 300));

// Simulated API functions for profile management
export const checkUsernameAvailability = async (username) => {
  await simulateNetworkDelay();
  return !Array.from(mockProfiles.values()).some(profile => profile.username === username);
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
  if (mockProfiles.has(profile.walletAddress)) {
    totalXP += XP_REWARDS.PROFILE_SAVE;
  }
  
  return totalXP;
};

export const createProfile = async (profileData) => {
  await simulateNetworkDelay();
  
  // Handle profile picture
  let profilePicture = null;
  if (profileData.profilePicture) {
    try {
      profilePicture = await uploadProfileImage(profileData.profilePicture);
    } catch (error) {
      console.error('Error processing profile picture:', error);
    }
  }
  
  const profile = {
    ...profileData,
    profilePicture,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    walletBalance: '0',
    soulXP: '0',
    badges: [],
    nfts: []
  };

  // Calculate initial XP
  profile.soulXP = calculateProfileXP(profile).toString();
  
  mockProfiles.set(profileData.walletAddress, profile);
  saveProfilesToStorage(mockProfiles);
  return profile;
};

export const updateProfile = async (walletAddress, profileData) => {
  await simulateNetworkDelay();
  
  // Handle profile picture
  let updatedProfileData = { ...profileData };
  if (profileData.profilePicture) {
    try {
      updatedProfileData.profilePicture = await uploadProfileImage(profileData.profilePicture);
    } catch (error) {
      console.error('Error processing profile picture:', error);
      delete updatedProfileData.profilePicture;
    }
  }
  
  const existingProfile = mockProfiles.get(walletAddress);
  const updatedProfile = {
    ...existingProfile,
    ...updatedProfileData,
    walletAddress,
    updatedAt: new Date().toISOString()
  };

  // Calculate updated XP
  updatedProfile.soulXP = calculateProfileXP(updatedProfile).toString();
  
  mockProfiles.set(walletAddress, updatedProfile);
  saveProfilesToStorage(mockProfiles);
  return updatedProfile;
};

export const fetchProfile = async (walletAddress) => {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  await simulateNetworkDelay();
  
  let profile = mockProfiles.get(walletAddress);
  
  // Create default profile if none exists
  if (!profile) {
    profile = {
      walletAddress,
      preferredName: 'Anonymous',
      username: '',
      profilePicture: null,
      xAccount: '',
      badges: [],
      nfts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      walletBalance: '0',
      soulXP: '0'
    };
    mockProfiles.set(walletAddress, profile);
    saveProfilesToStorage(mockProfiles);
  }

  return profile;
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
