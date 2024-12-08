import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const STAKING_POOLS = {
  OCEAN_POOL: {
    id: 'ocean_pool',
    name: 'Ocean Conservation Pool',
    description: 'Stake your Ocean Protector NFTs to earn extra rewards',
    apr: 25,
    minStakingPeriod: 7, // days
    requiredNFTs: ['Ocean Protector', 'Coral Guardian'],
    rewards: {
      points: 1000,
      specialNFTs: ['Legendary Ocean Master'],
      bonusMultiplier: 1.5
    }
  },
  FOREST_POOL: {
    id: 'forest_pool',
    name: 'Forest Guardian Pool',
    description: 'Stake Forest Guardian NFTs for enhanced rewards',
    apr: 30,
    minStakingPeriod: 14,
    requiredNFTs: ['Forest Guardian', 'Tree Planter'],
    rewards: {
      points: 1500,
      specialNFTs: ['Ancient Forest Spirit'],
      bonusMultiplier: 1.75
    }
  },
  CLIMATE_POOL: {
    id: 'climate_pool',
    name: 'Climate Action Pool',
    description: 'Stake Climate Warrior NFTs for maximum impact',
    apr: 35,
    minStakingPeriod: 30,
    requiredNFTs: ['Climate Warrior', 'Energy Guardian'],
    rewards: {
      points: 2000,
      specialNFTs: ['Climate Champion Elite'],
      bonusMultiplier: 2.0
    }
  },
  COMMUNITY_POOL: {
    id: 'community_pool',
    name: 'Community Leader Pool',
    description: 'Stake Community Impact NFTs for social rewards',
    apr: 28,
    minStakingPeriod: 21,
    requiredNFTs: ['Community Leader', 'Eco Educator'],
    rewards: {
      points: 1800,
      specialNFTs: ['Community Legend'],
      bonusMultiplier: 1.8
    }
  }
};

function NFTStaking() {
  const { connected } = useWallet();
  const [selectedPool, setSelectedPool] = useState(null);
  const [stakedNFTs, setStakedNFTs] = useState({});
  const [rewards, setRewards] = useState({});

  useEffect(() => {
    // Simulate staked NFTs and rewards (replace with actual blockchain data)
    setStakedNFTs({
      'ocean_pool': {
        nfts: ['Ocean Protector #123'],
        stakedAt: new Date('2024-12-01'),
        earnedPoints: 450
      }
    });
  }, []);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const poolGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const poolCardStyle = (isStaked) => ({
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1.5rem',
    border: `1px solid ${isStaked ? '#4CAF50' : '#666'}`,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    transform: selectedPool?.id === (isStaked ? 'staked' : 'pool') ? 'scale(1.02)' : 'scale(1)'
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
    width: '100%',
    marginTop: '1rem'
  };

  const StakingModal = ({ pool, onClose }) => (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{pool.name}</h3>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>{pool.description}</p>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Pool Details</h4>
          <div style={{ color: '#888' }}>
            <p>APR: {pool.apr}%</p>
            <p>Minimum Staking Period: {pool.minStakingPeriod} days</p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Required NFTs</h4>
          <ul style={{ color: '#888', listStyle: 'none', padding: 0 }}>
            {pool.requiredNFTs.map((nft, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>• {nft}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Rewards</h4>
          <ul style={{ color: '#888', listStyle: 'none', padding: 0 }}>
            <li>• {pool.rewards.points} points per day</li>
            <li>• {pool.rewards.bonusMultiplier}x activity multiplier</li>
            <li>• Exclusive NFTs: {pool.rewards.specialNFTs.join(', ')}</li>
          </ul>
        </div>

        <button 
          style={buttonStyle}
          onClick={() => alert('Staking functionality coming soon!')}
        >
          Stake NFTs
        </button>
        <button 
          style={{ ...buttonStyle, backgroundColor: '#666' }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </>
  );

  const renderStakedNFTs = () => {
    if (Object.keys(stakedNFTs).length === 0) {
      return (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No NFTs currently staked
        </p>
      );
    }

    return Object.entries(stakedNFTs).map(([poolId, data]) => {
      const pool = STAKING_POOLS[poolId.toUpperCase()];
      return (
        <div key={poolId} style={poolCardStyle(true)}>
          <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{pool.name}</h4>
          <div style={{ color: '#888' }}>
            <p>Staked NFTs:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.nfts.map((nft, index) => (
                <li key={index}>• {nft}</li>
              ))}
            </ul>
            <p>Staked since: {new Date(data.stakedAt).toLocaleDateString()}</p>
            <p>Earned points: {data.earnedPoints}</p>
          </div>
        </div>
      );
    });
  };

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>NFT Staking</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to access NFT staking
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>NFT Staking</h2>

      <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Your Staked NFTs</h3>
      <div style={poolGridStyle}>
        {renderStakedNFTs()}
      </div>

      <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Available Staking Pools</h3>
      <div style={poolGridStyle}>
        {Object.values(STAKING_POOLS).map(pool => (
          <div
            key={pool.id}
            style={poolCardStyle(false)}
            onClick={() => setSelectedPool(pool)}
          >
            <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>{pool.name}</h4>
            <p style={{ color: '#888', marginBottom: '1rem' }}>{pool.description}</p>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              color: '#666'
            }}>
              <span>APR: {pool.apr}%</span>
              <span>{pool.minStakingPeriod} days min</span>
            </div>
          </div>
        ))}
      </div>

      {selectedPool && (
        <StakingModal 
          pool={selectedPool}
          onClose={() => setSelectedPool(null)}
        />
      )}
    </div>
  );
}

export default NFTStaking;
