import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

const XPContext = createContext();

export function useXP() {
  return useContext(XPContext);
}

export function XPProvider({ children }) {
  const { publicKey } = useWallet();
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);

  // Calculate level based on XP
  const calculateLevel = (xpAmount) => {
    return Math.floor(Math.sqrt(xpAmount / 1000)) + 1;
  };

  // Add XP points
  const addXP = async (amount) => {
    if (!publicKey) return;

    try {
      // Here you would typically make an API call to your backend
      // to update the user's XP in the database
      const newXP = xp + amount;
      setXP(newXP);
      
      // Update level if necessary
      const newLevel = calculateLevel(newXP);
      if (newLevel !== level) {
        setLevel(newLevel);
        // Trigger level up celebration or notification
      }

    } catch (error) {
      console.error("Error adding XP:", error);
    }
  };

  // Get user's XP when wallet connects
  useEffect(() => {
    const fetchUserXP = async () => {
      if (!publicKey) {
        setXP(0);
        setLevel(1);
        return;
      }

      try {
        // Here you would typically fetch the user's XP from your backend
        // For now, we'll use localStorage as a placeholder
        const savedXP = localStorage.getItem(`xp_${publicKey.toString()}`) || 0;
        setXP(Number(savedXP));
        setLevel(calculateLevel(Number(savedXP)));
      } catch (error) {
        console.error("Error fetching user XP:", error);
      }
    };

    fetchUserXP();
  }, [publicKey]);

  // Save XP changes to localStorage
  useEffect(() => {
    if (publicKey) {
      localStorage.setItem(`xp_${publicKey.toString()}`, xp.toString());
    }
  }, [xp, publicKey]);

  return (
    <XPContext.Provider value={{
      xp,
      level,
      addXP,
      calculateLevel
    }}>
      {children}
    </XPContext.Provider>
  );
}
