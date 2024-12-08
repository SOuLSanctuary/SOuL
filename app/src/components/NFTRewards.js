import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const NFT_REWARDS = {
  ZERO_WASTE: {
    name: 'Zero Waste Warrior',
    image: '🗑️',
    description: 'Awarded for exceptional waste reduction efforts',
    rarity: 'Rare',
    attributes: {
      'Impact Level': 'High',
      'Category': 'Waste Management',
      'Achievement': 'Zero Waste Week Challenge'
    }
  },
  ENERGY_GUARDIAN: {
    name: 'Energy Guardian',
    image: '⚡',
    description: 'Champion of energy conservation',
    rarity: 'Epic',
    attributes: {
      'Impact Level': 'Very High',
      'Category': 'Energy Conservation',
      'Achievement': 'Clean Energy Champion'
    }
  },
  OCEAN_PROTECTOR: {
    name: 'Ocean Protector',
    image: '🌊',
    description: 'Defender of marine ecosystems',
    rarity: 'Legendary',
    attributes: {
      'Impact Level': 'Exceptional',
      'Category': 'Ocean Conservation',
      'Achievement': 'Beach Cleanup Master'
    }
  },
  FOREST_GUARDIAN: {
    name: 'Forest Guardian',
    image: '🌳',
    description: 'Protector of forests and biodiversity',
    rarity: 'Mythic',
    attributes: {
      'Impact Level': 'Legendary',
      'Category': 'Forest Conservation',
      'Achievement': 'Tree Planting Champion'
    }
  },
  ECO_EDUCATOR: {
    name: 'Eco Educator',
    image: '📚',
    description: 'Spreading environmental awareness',
    rarity: 'Epic',
    attributes: {
      'Impact Level': 'High',
      'Category': 'Education',
      'Achievement': 'Community Leader'
    }
  },
  WILDLIFE_GUARDIAN: {
    name: 'Wildlife Guardian',
    image: '🦁',
    description: 'Protector of endangered species',
    rarity: 'Legendary',
    attributes: {
      'Impact Level': 'Exceptional',
      'Category': 'Wildlife Protection',
      'Achievement': 'Wildlife Defender'
    }
  }
};

function NFTRewards() {
  const { connected, wallet } = useWallet();
  const [earnedNFTs, setEarnedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    // Simulate earned NFTs (replace with actual data from your program)
    setEarnedNFTs(['ZERO_WASTE', 'ENERGY_GUARDIAN']);
  }, []);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const titleStyle = {
    color: '#4CAF50',
    marginBottom: '1.5rem',
    fontSize: '1.5rem'
  };

  const nftGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  };

  const nftCardStyle = (earned) => ({
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1rem',
    border: `1px solid ${earned ? '#4CAF50' : '#666'}`,
    opacity: earned ? 1 : 0.5,
    cursor: earned ? 'pointer' : 'default',
    transition: 'transform 0.2s ease',
    transform: selectedNFT === earned ? 'scale(1.02)' : 'scale(1)'
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
    maxWidth: '500px',
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

  const handleNFTClick = (nftKey) => {
    if (earnedNFTs.includes(nftKey)) {
      setSelectedNFT(nftKey);
    }
  };

  const NFTModal = ({ nftKey, onClose }) => {
    const nft = NFT_REWARDS[nftKey];
    return (
      <>
        <div style={overlayStyle} onClick={onClose} />
        <div style={modalStyle}>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{nft.name}</h3>
          <div style={{ 
            fontSize: '4rem', 
            textAlign: 'center', 
            margin: '1rem 0' 
          }}>
            {nft.image}
          </div>
          <p style={{ color: '#888', marginBottom: '1rem' }}>{nft.description}</p>
          <p style={{ color: '#4CAF50', marginBottom: '1rem' }}>Rarity: {nft.rarity}</p>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Attributes</h4>
          {Object.entries(nft.attributes).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              margin: '0.5rem 0',
              color: '#888'
            }}>
              <span>{key}:</span>
              <span style={{ color: '#4CAF50' }}>{value}</span>
            </div>
          ))}
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem',
              width: '100%'
            }}
          >
            Close
          </button>
        </div>
      </>
    );
  };

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>NFT Rewards</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to view your NFT rewards
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>NFT Rewards Gallery</h2>
      <div style={nftGridStyle}>
        {Object.entries(NFT_REWARDS).map(([key, nft]) => (
          <div
            key={key}
            style={nftCardStyle(earnedNFTs.includes(key))}
            onClick={() => handleNFTClick(key)}
          >
            <div style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              marginBottom: '1rem' 
            }}>
              {nft.image}
            </div>
            <h4 style={{ 
              color: earnedNFTs.includes(key) ? '#4CAF50' : '#666',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              {nft.name}
            </h4>
            <p style={{ 
              color: '#888', 
              fontSize: '0.9rem',
              textAlign: 'center',
              margin: 0
            }}>
              {earnedNFTs.includes(key) ? 'Earned' : 'Locked'}
            </p>
          </div>
        ))}
      </div>

      {selectedNFT && (
        <NFTModal 
          nftKey={selectedNFT} 
          onClose={() => setSelectedNFT(null)} 
        />
      )}
    </div>
  );
}

export default NFTRewards;
