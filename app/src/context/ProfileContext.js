import React, { createContext, useState, useContext } from 'react';
import { defaultAvatar, defaultCover } from '../assets/images';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    username: '@johndoe',
    bio: 'Passionate about environmental conservation and biodiversity',
    avatar: defaultAvatar,
    coverImage: defaultCover,
    stats: {
      posts: 156,
      followers: 1234,
      following: 890,
      collections: 45
    },
    badges: [
      'Species Validator',
      'RedLister',
      'Conservation Expert',
      'Top Contributor'
    ],
    achievements: [
      {
        icon: '🌟',
        title: 'Master Collector',
        description: 'Collected over 100 unique species'
      },
      {
        icon: '🔍',
        title: 'Expert Validator',
        description: 'Validated 500+ observations'
      },
      {
        icon: '🌿',
        title: 'Conservation Hero',
        description: 'Led 10 successful restoration projects'
      },
      {
        icon: '📊',
        title: 'Data Pioneer',
        description: 'Contributed to 50+ surveys'
      }
    ],
    collections: [
      {
        id: 1,
        title: 'Rare Orchids',
        image: defaultCover,
        description: 'A collection of endangered orchid species from Southeast Asia',
        items: 23
      },
      {
        id: 2,
        title: 'Butterflies',
        image: defaultCover,
        description: 'Documented butterfly species in urban gardens',
        items: 45
      }
    ]
  });

  const updateProfile = (updates) => {
    setProfileData(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
