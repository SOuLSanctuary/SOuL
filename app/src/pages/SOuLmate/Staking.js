import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import '../../styles/SOuLmate.css';

const SOuLmateStaking = () => {
  const { connected } = useWallet();

  return (
    <div className="soulmate-page">
      <h1>SOuLmate Staking</h1>
      {connected ? (
        <div className="staking-content">
          <div className="staking-overview">
            <h2>Staking Overview</h2>
            <div className="staking-stats">
              {/* Staking statistics will go here */}
            </div>
          </div>
          <div className="staking-actions">
            <h3>Staking Actions</h3>
            {/* Staking controls will go here */}
          </div>
          <div className="staking-rewards">
            <h3>Rewards</h3>
            {/* Rewards information will go here */}
          </div>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to access SOuLmate staking</p>
        </div>
      )}
    </div>
  );
};

export default SOuLmateStaking;
