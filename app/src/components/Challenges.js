import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WEEKLY_CHALLENGES = [
  {
    id: 'w1',
    title: 'Zero Waste Week',
    description: 'Record at least 5 waste reduction activities this week',
    type: 'waste_reduction',
    target: 5,
    reward: 'Zero Waste Warrior NFT'
  },
  {
    id: 'w2',
    title: 'Clean Energy Champion',
    description: 'Save 100 kWh of energy this week',
    type: 'energy_saving',
    target: 100,
    reward: 'Energy Guardian NFT'
  },
  {
    id: 'w3',
    title: 'Ocean Guardian',
    description: 'Clean 20kg of beach waste',
    type: 'beach_cleanup',
    target: 20,
    reward: 'Ocean Protector NFT'
  }
];

const MONTHLY_CHALLENGES = [
  {
    id: 'm1',
    title: 'Forest Creator',
    description: 'Plant 20 trees this month',
    type: 'tree_planting',
    target: 20,
    reward: 'Forest Guardian NFT'
  },
  {
    id: 'm2',
    title: 'Community Leader',
    description: 'Educate 50 people about environmental conservation',
    type: 'eco_education',
    target: 50,
    reward: 'Eco Educator NFT'
  },
  {
    id: 'm3',
    title: 'Wildlife Defender',
    description: 'Contribute 24 hours to wildlife protection',
    type: 'wildlife_protection',
    target: 24,
    reward: 'Wildlife Guardian NFT'
  }
];

function Challenges() {
  const { connected, wallet } = useWallet();
  const [weeklyProgress, setWeeklyProgress] = useState({});
  const [monthlyProgress, setMonthlyProgress] = useState({});

  useEffect(() => {
    // Simulate progress (replace with actual data from your program)
    setWeeklyProgress({
      'w1': 3,
      'w2': 75,
      'w3': 12
    });

    setMonthlyProgress({
      'm1': 15,
      'm2': 30,
      'm3': 10
    });
  }, []);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const titleStyle = {
    color: '#4CAF50',
    marginBottom: '1.5rem',
    fontSize: '1.5rem'
  };

  const challengeGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const challengeCardStyle = {
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #4CAF50'
  };

  const progressBarStyle = (progress, target) => ({
    width: '100%',
    height: '8px',
    backgroundColor: '#1a1c20',
    borderRadius: '4px',
    marginTop: '1rem',
    position: 'relative',
    overflow: 'hidden'
  });

  const progressFillStyle = (progress, target) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${Math.min((progress / target) * 100, 100)}%`,
    backgroundColor: '#4CAF50',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  });

  const renderChallenges = (challenges, progress) => (
    <div style={challengeGridStyle}>
      {challenges.map(challenge => (
        <div key={challenge.id} style={challengeCardStyle}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>
            {challenge.title}
          </h4>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            {challenge.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>
              Progress: {progress[challenge.id] || 0}/{challenge.target}
            </span>
            <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>
              {challenge.reward}
            </span>
          </div>
          <div style={progressBarStyle()}>
            <div style={progressFillStyle(progress[challenge.id] || 0, challenge.target)} />
          </div>
        </div>
      ))}
    </div>
  );

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>Environmental Challenges</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to participate in challenges
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Weekly Challenges</h2>
      {renderChallenges(WEEKLY_CHALLENGES, weeklyProgress)}

      <h2 style={titleStyle}>Monthly Challenges</h2>
      {renderChallenges(MONTHLY_CHALLENGES, monthlyProgress)}
    </div>
  );
}

export default Challenges;
