import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

const BadgeContext = createContext();

export function useBadges() {
  return useContext(BadgeContext);
}

const BADGE_DEFINITIONS = {
  CitrusGrower: {
    id: 'CitrusGrower',
    name: 'Citrus Grower',
    description: 'Invested in citrus seedlings',
    icon: '🍋'
  },
  CoffeeMaster: {
    id: 'CoffeeMaster',
    name: 'Coffee Master',
    description: 'Invested in coffee seedlings',
    icon: '☕'
  },
  PremiumGrower: {
    id: 'PremiumGrower',
    name: 'Premium Grower',
    description: 'Invested in premium grafted seedlings',
    icon: '🌳'
  }
};

export function BadgeProvider({ children }) {
  const { publicKey } = useWallet();
  const [badges, setBadges] = useState(new Set());

  // Award a new badge
  const awardBadge = async (badgeId) => {
    if (!publicKey || !BADGE_DEFINITIONS[badgeId]) return;

    try {
      // Here you would typically make an API call to your backend
      // to update the user's badges in the database
      setBadges(prev => new Set([...prev, badgeId]));

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const badge = BADGE_DEFINITIONS[badgeId];
        new Notification('New Badge Earned!', {
          body: `Congratulations! You've earned the ${badge.name} badge: ${badge.description}`,
          icon: badge.icon
        });
      }

    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };

  // Check if user has a specific badge
  const hasBadge = (badgeId) => {
    return badges.has(badgeId);
  };

  // Get all badge details
  const getBadgeDetails = (badgeId) => {
    return BADGE_DEFINITIONS[badgeId];
  };

  // Get user's badges when wallet connects
  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!publicKey) {
        setBadges(new Set());
        return;
      }

      try {
        // Here you would typically fetch the user's badges from your backend
        // For now, we'll use localStorage as a placeholder
        const savedBadges = JSON.parse(localStorage.getItem(`badges_${publicKey.toString()}`)) || [];
        setBadges(new Set(savedBadges));
      } catch (error) {
        console.error("Error fetching user badges:", error);
      }
    };

    fetchUserBadges();
  }, [publicKey]);

  // Save badge changes to localStorage
  useEffect(() => {
    if (publicKey) {
      localStorage.setItem(`badges_${publicKey.toString()}`, JSON.stringify([...badges]));
    }
  }, [badges, publicKey]);

  return (
    <BadgeContext.Provider value={{
      badges,
      awardBadge,
      hasBadge,
      getBadgeDetails,
      BADGE_DEFINITIONS
    }}>
      {children}
    </BadgeContext.Provider>
  );
}
