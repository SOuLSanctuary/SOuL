import React from 'react';
import { WalletButton } from './WalletButton';

function Navbar() {
  return (
    <nav style={{
      backgroundColor: '#1a1c20',
      padding: '1.2rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        color: '#4CAF50', 
        fontSize: '1.8rem', 
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        SOuL Sanctuary
      </div>
      <WalletButton />
    </nav>
  );
}

export default Navbar;
