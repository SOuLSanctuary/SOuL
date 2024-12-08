import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const MARKETPLACE_LISTINGS = [
  {
    id: 1,
    name: 'Legendary Ocean Protector',
    image: '🌊',
    price: 2.5,
    seller: '7xKX...P9Yk',
    rarity: 'Legendary',
    attributes: {
      'Impact Level': 'Exceptional',
      'Category': 'Ocean Conservation',
      'Achievement': 'Beach Cleanup Master'
    }
  },
  {
    id: 2,
    name: 'Mythic Forest Guardian',
    image: '🌳',
    price: 3.0,
    seller: '3mZR...L8Pj',
    rarity: 'Mythic',
    attributes: {
      'Impact Level': 'Legendary',
      'Category': 'Forest Conservation',
      'Achievement': 'Tree Planting Champion'
    }
  },
  {
    id: 3,
    name: 'Epic Energy Guardian',
    image: '⚡',
    price: 1.8,
    seller: '9nQM...K4Wm',
    rarity: 'Epic',
    attributes: {
      'Impact Level': 'Very High',
      'Category': 'Energy Conservation',
      'Achievement': 'Clean Energy Champion'
    }
  }
];

function NFTMarketplace() {
  const { connected, wallet } = useWallet();
  const [listings, setListings] = useState(MARKETPLACE_LISTINGS);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [filterRarity, setFilterRarity] = useState('all');

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const filterBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem'
  };

  const selectStyle = {
    backgroundColor: '#282c34',
    color: 'white',
    border: '1px solid #4CAF50',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  };

  const cardStyle = {
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #4CAF50',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  };

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

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem'
  };

  const handleSort = (value) => {
    setSortBy(value);
    const sorted = [...listings].sort((a, b) => {
      if (value === 'price') return a.price - b.price;
      if (value === 'rarity') {
        const rarityOrder = { 'Legendary': 3, 'Mythic': 2, 'Epic': 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      }
      return 0;
    });
    setListings(sorted);
  };

  const handleFilter = (value) => {
    setFilterRarity(value);
    if (value === 'all') {
      setListings(MARKETPLACE_LISTINGS);
    } else {
      const filtered = MARKETPLACE_LISTINGS.filter(nft => nft.rarity === value);
      setListings(filtered);
    }
  };

  const NFTModal = ({ nft, onClose }) => (
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <span style={{ color: '#888' }}>Price:</span>
          <span style={{ color: '#4CAF50' }}>{nft.price} SOL</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <span style={{ color: '#888' }}>Seller:</span>
          <span style={{ color: '#4CAF50' }}>{nft.seller}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <span style={{ color: '#888' }}>Rarity:</span>
          <span style={{ color: '#4CAF50' }}>{nft.rarity}</span>
        </div>
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
        <button style={buttonStyle} onClick={() => alert('Purchase functionality coming soon!')}>
          Purchase for {nft.price} SOL
        </button>
        <button style={{ ...buttonStyle, backgroundColor: '#666' }} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>NFT Marketplace</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to access the NFT marketplace
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>NFT Marketplace</h2>
      
      <div style={filterBarStyle}>
        <div>
          <label style={{ color: '#888', marginRight: '0.5rem' }}>Sort by:</label>
          <select 
            style={selectStyle}
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="price">Price</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
        
        <div>
          <label style={{ color: '#888', marginRight: '0.5rem' }}>Rarity:</label>
          <select 
            style={selectStyle}
            value={filterRarity}
            onChange={(e) => handleFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
            <option value="Epic">Epic</option>
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        {listings.map(nft => (
          <div
            key={nft.id}
            style={{
              ...cardStyle,
              transform: selectedNFT?.id === nft.id ? 'scale(1.02)' : 'scale(1)'
            }}
            onClick={() => setSelectedNFT(nft)}
          >
            <div style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              marginBottom: '1rem' 
            }}>
              {nft.image}
            </div>
            <h4 style={{ 
              color: '#4CAF50',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              {nft.name}
            </h4>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              color: '#888',
              marginTop: '1rem'
            }}>
              <span>{nft.rarity}</span>
              <span>{nft.price} SOL</span>
            </div>
          </div>
        ))}
      </div>

      {selectedNFT && (
        <NFTModal 
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </div>
  );
}

export default NFTMarketplace;
