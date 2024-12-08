import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import '../../styles/SOuLmate.css';

const SOuLmateAchievements = () => {
  const { connected } = useWallet();

  return (
    <div className="soulmate-page">
      <h1>SOuLmate Achievements</h1>
      {connected ? (
        <div className="achievements-content">
          <div className="achievements-overview">
            <h2>Your Achievements</h2>
            <div className="achievement-stats">
              {/* Achievement statistics will go here */}
            </div>
          </div>
          <div className="achievements-grid">
            {/* Achievement cards will go here */}
          </div>
          <div className="achievement-progress">
            <h3>Progress Tracking</h3>
            {/* Progress bars and tracking info will go here */}
          </div>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to view your SOuLmate achievements</p>
        </div>
      )}
    </div>
  );
};

export default SOuLmateAchievements;
