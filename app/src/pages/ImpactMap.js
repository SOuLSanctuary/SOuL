import React from 'react';

function ImpactMap() {
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
    backgroundColor: '#282c34'
  };

  const titleStyle = {
    fontSize: '3rem',
    color: '#4CAF50',
    marginBottom: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  const contentStyle = {
    backgroundColor: '#1a1c20',
    padding: '2rem',
    borderRadius: '12px',
    color: '#ddd',
    fontSize: '1.2rem',
    lineHeight: '1.6',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>SOuL Impact Map</h1>
      <div style={contentStyle}>
        <p>Coming Soon: Interactive impact visualization</p>
        <p style={{ marginTop: '1rem', fontSize: '1rem', opacity: 0.8 }}>
          Visualize and track your environmental impact across the globe
        </p>
      </div>
    </div>
  );
}

export default ImpactMap;
