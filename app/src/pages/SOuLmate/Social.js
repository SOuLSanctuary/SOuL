import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import '../../styles/SOuLmate.css';

const SOuLmateSocial = () => {
  const { connected } = useWallet();

  return (
    <div className="soulmate-page">
      <h1>SOuLmate Social</h1>
      {connected ? (
        <div className="social-content">
          <div className="social-feed">
            <h2>Activity Feed</h2>
            {/* Social feed will go here */}
          </div>
          <div className="social-connections">
            <h3>Connections</h3>
            {/* Connections list will go here */}
          </div>
          <div className="social-interactions">
            <h3>Recent Interactions</h3>
            {/* Interaction history will go here */}
          </div>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to access SOuLmate social features</p>
        </div>
      )}
    </div>
  );
};

export default SOuLmateSocial;
