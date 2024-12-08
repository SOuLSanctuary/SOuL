import React, { useEffect } from 'react';

export function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const baseStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '300px',
    maxWidth: '400px'
  };

  const types = {
    success: {
      backgroundColor: '#4CAF50',
      borderLeft: '4px solid #45a049'
    },
    error: {
      backgroundColor: '#f44336',
      borderLeft: '4px solid #da190b'
    },
    warning: {
      backgroundColor: '#ff9800',
      borderLeft: '4px solid #f57c00'
    },
    info: {
      backgroundColor: '#2196F3',
      borderLeft: '4px solid #1976D2'
    }
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.2rem',
    marginLeft: '1rem',
    padding: '0.2rem 0.5rem',
    opacity: 0.8
  };

  return (
    <div style={{ ...baseStyle, ...types[type] }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={closeButtonStyle}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
