import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import '../../styles/SOuLmate.css';

const SOuLmateWallet = () => {
  const { connected, address, balance } = useWallet();

  return (
    <div className="soulmate-page">
      <h1>SOuLmate Wallet</h1>
      {connected ? (
        <div className="wallet-content">
          <div className="wallet-info">
            <h2>Wallet Overview</h2>
            <p>Address: {address}</p>
            <p>Balance: {balance} SOL</p>
          </div>
          <div className="wallet-actions">
            <h3>Actions</h3>
            {/* Wallet actions will go here */}
          </div>
          <div className="transaction-history">
            <h3>Transaction History</h3>
            {/* Transaction history will go here */}
          </div>
        </div>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to view your SOuLmate wallet</p>
        </div>
      )}
    </div>
  );
};

export default SOuLmateWallet;
