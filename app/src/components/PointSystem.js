import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const POINT_MULTIPLIERS = {
  // Base activities
  recycling: 10,
  renewable: 15,
  conservation: 12,
  sustainable: 8,
  composting: 10,
  tree_planting: 20,
  beach_cleanup: 15,
  energy_saving: 12,
  plastic_reduction: 8,
  food_waste: 10,
  // New activities
  garden_growing: 15,
  ewaste_recycling: 18,
  rainwater_harvest: 12,
  solar_panels: 25,
  community_cleanup: 15,
  wildlife_protection: 20,
  eco_education: 18,
  green_transport: 10,
  waste_reduction: 12,
  coral_restoration: 25
};

const RANKS = [
  { name: 'Eco Novice', threshold: 0, color: '#43A047' },
  { name: 'Green Guardian', threshold: 1000, color: '#388E3C' },
  { name: 'Earth Defender', threshold: 5000, color: '#2E7D32' },
  { name: 'Climate Champion', threshold: 10000, color: '#1B5E20' },
  { name: 'Environmental Legend', threshold: 50000, color: '#004D40' },
  { name: 'Planet Savior', threshold: 100000, color: '#00BFA5' }
];

function PointSystem({ activities }) {
  const { connected } = useWallet();
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState(RANKS[0]);
  const [nextRank, setNextRank] = useState(RANKS[1]);

  useEffect(() => {
    if (activities) {
      const totalPoints = activities.reduce((sum, activity) => {
        const basePoints = activity.impact * POINT_MULTIPLIERS[activity.activityType];
        // Add bonus points for streaks and special events
        const streakBonus = activity.streak ? activity.streak * 0.1 : 0;
        const eventBonus = activity.isSpecialEvent ? 2 : 1;
        return sum + (basePoints * (1 + streakBonus) * eventBonus);
      }, 0);

      setPoints(Math.round(totalPoints));

      // Update rank
      const currentRank = RANKS.reduce((prev, curr) => {
        return totalPoints >= curr.threshold ? curr : prev;
      }, RANKS[0]);

      setRank(currentRank);

      // Set next rank
      const nextRankIndex = RANKS.findIndex(r => r.name === currentRank.name) + 1;
      if (nextRankIndex < RANKS.length) {
        setNextRank(RANKS[nextRankIndex]);
      }
    }
  }, [activities]);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const progressBarStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: '#282c34',
    borderRadius: '4px',
    marginTop: '1rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const progressFillStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${Math.min(((points - rank.threshold) / (nextRank?.threshold - rank.threshold)) * 100, 100)}%`,
    backgroundColor: rank.color,
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  };

  const rankBadgeStyle = {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backgroundColor: rank.color,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: '1rem'
  };

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Point System</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to view your points and rank
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#4CAF50', margin: 0 }}>Environmental Points</h2>
        <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>{points.toLocaleString()} pts</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={rankBadgeStyle}>{rank.name}</div>
        {nextRank && (
          <p style={{ color: '#888', margin: '0.5rem 0' }}>
            {nextRank.threshold - points} points until {nextRank.name}
          </p>
        )}
      </div>

      <div style={progressBarStyle}>
        <div style={progressFillStyle} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Point Multipliers</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.5rem'
        }}>
          {Object.entries(POINT_MULTIPLIERS).map(([activity, multiplier]) => (
            <div key={activity} style={{ 
              backgroundColor: '#282c34',
              padding: '0.5rem',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#888' }}>
                {activity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
              <span style={{ color: '#4CAF50' }}>x{multiplier}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PointSystem;
