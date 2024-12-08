import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export function WalletButton() {
  const { connected, publicKey, connect, disconnect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.8rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: isLoading ? 'wait' : 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease',
    opacity: isLoading ? 0.7 : 1
  };

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the wallet address for display
  const displayAddress = publicKey ? 
    `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : '';

  return (
    <button
      onClick={isLoading ? undefined : handleClick}
      style={buttonStyle}
      disabled={isLoading}
      className="wallet-button"
    >
      {connected ? (
        <>
          <span>{isLoading ? 'Disconnecting...' : 'Disconnect'}</span>
          {displayAddress && (
            <span style={{ 
              fontSize: '0.9rem', 
              opacity: 0.9, 
              fontFamily: 'monospace' 
            }}>
              ({displayAddress})
            </span>
          )}
        </>
      ) : (
        isLoading ? 'Connecting...' : 'Connect Wallet'
      )}
    </button>
  );
}
