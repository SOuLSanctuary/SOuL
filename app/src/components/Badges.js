import React from 'react';

const BADGES = {
  RECYCLING_CHAMPION: {
    name: 'Recycling Champion',
    description: 'Recycled over 100kg of materials',
    threshold: 100,
    type: 'recycling'
  },
  ENERGY_SAVER: {
    name: 'Energy Guardian',
    description: 'Saved over 1000 kWh of energy',
    threshold: 1000,
    type: 'renewable'
  },
  WATER_WARRIOR: {
    name: 'Water Warrior',
    description: 'Conserved over 1000 liters of water',
    threshold: 1000,
    type: 'conservation'
  },
  TREE_PLANTER: {
    name: 'Forest Guardian',
    description: 'Planted over 10 trees',
    threshold: 10,
    type: 'tree_planting'
  },
  BEACH_CLEANER: {
    name: 'Ocean Protector',
    description: 'Cleaned over 50kg of beach waste',
    threshold: 50,
    type: 'beach_cleanup'
  }
};

function Badges({ stats }) {
  const earnedBadges = Object.entries(stats).map(([type, impact]) => {
    const relevantBadges = Object.values(BADGES).filter(badge => badge.type === type);
    return relevantBadges.filter(badge => impact >= badge.threshold);
  }).flat();

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const titleStyle = {
    color: '#4CAF50',
    marginBottom: '1.5rem',
    fontSize: '1.25rem'
  };

  const badgesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  };

  const badgeStyle = {
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    border: '1px solid #4CAF50'
  };

  const badgeIconStyle = {
    width: '64px',
    height: '64px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    margin: '0 auto 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Achievement Badges</h3>
      {earnedBadges.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Keep contributing to earn badges!
        </p>
      ) : (
        <div style={badgesGridStyle}>
          {earnedBadges.map((badge, index) => (
            <div key={index} style={badgeStyle}>
              <div style={badgeIconStyle}>🏆</div>
              <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>
                {badge.name}
              </h4>
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Badges;
