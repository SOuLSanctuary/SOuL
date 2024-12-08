import React, { useState } from 'react';
import {
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
} from 'react-share';

function ShareButton({ stats }) {
  const [showShare, setShowShare] = useState(false);

  const totalImpact = Object.entries(stats).reduce((total, [type, impact]) => {
    return total + parseFloat(impact);
  }, 0);

  const shareUrl = window.location.href;
  const title = `I've contributed ${totalImpact.toFixed(2)} units of environmental impact on SOuL Sanctuary! 🌱 Join me in making a difference! #SOuLSanctuary #Solana #Environment`;

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem'
  };

  const shareMenuStyle = {
    position: 'absolute',
    backgroundColor: '#1a1c20',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: showShare ? 'flex' : 'none',
    gap: '1rem',
    zIndex: 1000,
    border: '1px solid #4CAF50'
  };

  const iconProps = {
    size: 32,
    round: true
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        style={buttonStyle}
        onClick={() => setShowShare(!showShare)}
      >
        Share Impact
      </button>
      
      <div style={shareMenuStyle}>
        <TwitterShareButton url={shareUrl} title={title}>
          <TwitterIcon {...iconProps} />
        </TwitterShareButton>

        <LinkedinShareButton url={shareUrl} title={title}>
          <LinkedinIcon {...iconProps} />
        </LinkedinShareButton>

        <TelegramShareButton url={shareUrl} title={title}>
          <TelegramIcon {...iconProps} />
        </TelegramShareButton>
      </div>
    </div>
  );
}

export default ShareButton;
