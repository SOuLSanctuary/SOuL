import React from 'react';
import { useHistory } from 'react-router-dom';

function Home() {
  const history = useHistory();

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem'
  };

  const titleStyle = {
    fontSize: '3rem',
    color: '#4CAF50',
    marginBottom: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '1rem'
  };

  const cardStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '2rem',
    cursor: 'pointer',
    textAlign: 'center'
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    color: '#4CAF50',
    marginBottom: '1rem'
  };

  const cardTextStyle = {
    color: '#ddd',
    lineHeight: '1.6'
  };

  const features = [
    {
      title: 'SOuL Collector',
      description: 'Collect environmental data and earn rewards',
      path: '/collector'
    },
    {
      title: 'Impact Map',
      description: 'Visualize your environmental impact',
      path: '/impact-map'
    }
  ];

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Welcome to SOuL Sanctuary</h1>
      <div style={gridStyle}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={cardStyle}
            onClick={() => history.push(feature.path)}
          >
            <h2 style={cardTitleStyle}>{feature.title}</h2>
            <p style={cardTextStyle}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
