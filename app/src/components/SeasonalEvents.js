import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const SEASONAL_EVENTS = {
  EARTH_MONTH: {
    id: 'earth_month',
    title: 'Earth Month Challenge',
    description: 'April is Earth Month! Complete special challenges for 3x points and exclusive NFTs.',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    challenges: [
      {
        title: 'Community Clean-up Marathon',
        description: 'Organize or participate in 5 community cleanups',
        reward: 'Earth Champion NFT',
        points: 5000
      },
      {
        title: 'Tree Planting Initiative',
        description: 'Plant 50 trees during Earth Month',
        reward: 'Forest Master NFT',
        points: 7500
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Earth Guardian Supreme',
        description: 'Ultra-rare NFT only available during Earth Month',
        rarity: 'Mythic',
        supply: 100
      }
    ],
    pointMultiplier: 3
  },
  BIODIVERSITY_DAY: {
    id: 'biodiversity_day',
    title: 'Biodiversity Week',
    description: 'Celebrate International Biodiversity Day with special wildlife protection challenges!',
    startDate: '2024-05-22',
    endDate: '2024-05-29',
    challenges: [
      {
        title: 'Wildlife Guardian',
        description: 'Contribute 20 hours to wildlife protection',
        reward: 'Wildlife Protector NFT',
        points: 4000
      },
      {
        title: 'Habitat Restoration',
        description: 'Participate in habitat restoration projects',
        reward: 'Ecosystem Builder NFT',
        points: 5000
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Biodiversity Champion',
        description: 'Rare NFT featuring endangered species',
        rarity: 'Legendary',
        supply: 50
      }
    ],
    pointMultiplier: 2.5
  },
  OCEAN_WEEK: {
    id: 'ocean_week',
    title: 'World Oceans Week',
    description: 'Celebrate World Oceans Day with week-long challenges! 2x points for ocean-related activities.',
    startDate: '2024-06-01',
    endDate: '2024-06-08',
    challenges: [
      {
        title: 'Beach Clean-up Champion',
        description: 'Clean 100kg of beach waste',
        reward: 'Ocean Guardian NFT',
        points: 3000
      },
      {
        title: 'Coral Restoration Pioneer',
        description: 'Participate in coral restoration projects',
        reward: 'Coral Protector NFT',
        points: 4000
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Ocean Spirit Legendary',
        description: 'Mystical ocean-themed NFT',
        rarity: 'Mythic',
        supply: 75
      }
    ],
    pointMultiplier: 2
  },
  PLASTIC_FREE_JULY: {
    id: 'plastic_free_july',
    title: 'Plastic Free July',
    description: 'Join the global movement to reduce plastic waste!',
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    challenges: [
      {
        title: 'Zero Plastic Hero',
        description: 'Avoid single-use plastics for 30 days',
        reward: 'Plastic Free Warrior NFT',
        points: 6000
      },
      {
        title: 'Community Impact',
        description: 'Organize a plastic-free workshop',
        reward: 'Community Leader NFT',
        points: 4500
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Plastic Free Legend',
        description: 'Symbol of plastic-free achievement',
        rarity: 'Legendary',
        supply: 200
      }
    ],
    pointMultiplier: 2.5
  },
  CLIMATE_WEEK: {
    id: 'climate_week',
    title: 'Climate Action Week',
    description: 'Take action against climate change! Double points for energy-saving activities.',
    startDate: '2024-09-20',
    endDate: '2024-09-27',
    challenges: [
      {
        title: 'Carbon Reduction Master',
        description: 'Save 500 kWh of energy',
        reward: 'Climate Warrior NFT',
        points: 5000
      },
      {
        title: 'Green Transport Champion',
        description: 'Use sustainable transportation for 100km',
        reward: 'Clean Air Guardian NFT',
        points: 3500
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Climate Oracle',
        description: 'Mystical climate action NFT',
        rarity: 'Mythic',
        supply: 50
      }
    ],
    pointMultiplier: 2
  },
  FOOD_WASTE_MONTH: {
    id: 'food_waste_month',
    title: 'Food Waste Reduction Month',
    description: 'October focus on reducing food waste and promoting sustainable food systems.',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    challenges: [
      {
        title: 'Zero Food Waste Hero',
        description: 'Track and minimize food waste for 30 days',
        reward: 'Food Guardian NFT',
        points: 4500
      },
      {
        title: 'Composting Master',
        description: 'Start and maintain a composting system',
        reward: 'Soil Protector NFT',
        points: 3500
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Sustainable Food Sage',
        description: 'Rare food sustainability NFT',
        rarity: 'Legendary',
        supply: 150
      }
    ],
    pointMultiplier: 2
  },
  GREEN_DECEMBER: {
    id: 'green_december',
    title: 'Green December',
    description: 'Make the holiday season eco-friendly! Special rewards for sustainable celebrations.',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    challenges: [
      {
        title: 'Zero-Waste Holidays',
        description: 'Complete 20 waste reduction activities',
        reward: 'Holiday Guardian NFT',
        points: 4000
      },
      {
        title: 'Sustainable Gifting',
        description: 'Use eco-friendly packaging for all gifts',
        reward: 'Green Santa NFT',
        points: 3000
      }
    ],
    limitedEditionNFTs: [
      {
        name: 'Winter Sustainability Spirit',
        description: 'Magical winter-themed sustainability NFT',
        rarity: 'Mythic',
        supply: 100
      }
    ],
    pointMultiplier: 2
  }
};

function SeasonalEvents() {
  const { connected } = useWallet();
  const [activeEvents, setActiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const currentDate = new Date('2024-12-07'); // Using the provided time
    
    // Sort events into active and upcoming
    const active = [];
    const upcoming = [];
    
    Object.values(SEASONAL_EVENTS).forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      if (currentDate >= startDate && currentDate <= endDate) {
        active.push(event);
      } else if (currentDate < startDate) {
        upcoming.push(event);
      }
    });
    
    setActiveEvents(active);
    setUpcomingEvents(upcoming);
  }, []);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const eventCardStyle = (isActive) => ({
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    border: `1px solid ${isActive ? '#4CAF50' : '#666'}`,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    transform: selectedEvent?.id === (isActive ? 'active' : 'upcoming') ? 'scale(1.02)' : 'scale(1)'
  });

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1a1c20',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #4CAF50',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    zIndex: 1000
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem'
  };

  const EventModal = ({ event, onClose }) => (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{event.title}</h3>
        <p style={{ color: '#888', marginBottom: '1rem' }}>{event.description}</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#666' }}>
            Duration: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
          </p>
          <p style={{ color: '#4CAF50' }}>
            Point Multiplier: {event.pointMultiplier}x
          </p>
        </div>

        <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Special Challenges</h4>
        {event.challenges.map((challenge, index) => (
          <div key={index} style={{ 
            backgroundColor: '#282c34',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h5 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>{challenge.title}</h5>
            <p style={{ color: '#888', marginBottom: '0.5rem' }}>{challenge.description}</p>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              color: '#666'
            }}>
              <span>Reward: {challenge.reward}</span>
              <span>{challenge.points} points</span>
            </div>
          </div>
        ))}

        <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Limited Edition NFTs</h4>
        {event.limitedEditionNFTs.map((nft, index) => (
          <div key={index} style={{ 
            backgroundColor: '#282c34',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h5 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>{nft.name}</h5>
            <p style={{ color: '#888', marginBottom: '0.5rem' }}>{nft.description}</p>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              color: '#666'
            }}>
              <span>Rarity: {nft.rarity}</span>
              <span>Supply: {nft.supply}</span>
            </div>
          </div>
        ))}

        <button style={buttonStyle} onClick={onClose}>Close</button>
      </div>
    </>
  );

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Seasonal Events</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to view seasonal events
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>Seasonal Events</h2>
      
      {activeEvents.length > 0 && (
        <>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Active Events</h3>
          {activeEvents.map(event => (
            <div 
              key={event.id}
              style={eventCardStyle(true)}
              onClick={() => setSelectedEvent({ ...event, id: 'active' })}
            >
              <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>{event.title}</h4>
              <p style={{ color: '#888', marginBottom: '0.5rem' }}>{event.description}</p>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                color: '#666'
              }}>
                <span>Ends: {new Date(event.endDate).toLocaleDateString()}</span>
                <span>{event.pointMultiplier}x Points</span>
              </div>
            </div>
          ))}
        </>
      )}

      {upcomingEvents.length > 0 && (
        <>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem', marginTop: '2rem' }}>Upcoming Events</h3>
          {upcomingEvents.map(event => (
            <div 
              key={event.id}
              style={eventCardStyle(false)}
              onClick={() => setSelectedEvent({ ...event, id: 'upcoming' })}
            >
              <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>{event.title}</h4>
              <p style={{ color: '#888', marginBottom: '0.5rem' }}>{event.description}</p>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                color: '#666'
              }}>
                <span>Starts: {new Date(event.startDate).toLocaleDateString()}</span>
                <span>{event.pointMultiplier}x Points</span>
              </div>
            </div>
          ))}
        </>
      )}

      {selectedEvent && (
        <EventModal 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default SeasonalEvents;
