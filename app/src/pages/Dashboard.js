import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getWalletActivities, getImpactStats } from '../services/solanaService';
import ImpactCharts from '../components/ImpactCharts';
import Leaderboard from '../components/Leaderboard';
import ShareButton from '../components/ShareButton';
import Badges from '../components/Badges';
import Challenges from '../components/Challenges';
import NFTRewards from '../components/NFTRewards';
import PointSystem from '../components/PointSystem';
import SeasonalEvents from '../components/SeasonalEvents';
import NFTMarketplace from '../components/NFTMarketplace';
import NFTStaking from '../components/NFTStaking';
import NFTBreeding from '../components/NFTBreeding';
import AchievementTiers from '../components/AchievementTiers';
import Governance from '../components/Governance';
import CrossChainBridge from '../components/CrossChainBridge';

function Dashboard() {
  const { connected, wallet } = useWallet();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      if (connected && wallet?.publicKey) {
        const walletActivities = await getWalletActivities(wallet.publicKey.toString());
        setActivities(walletActivities);
        setStats(getImpactStats(walletActivities));
      }
      setLoading(false);
    }

    loadActivities();
  }, [connected, wallet]);

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: 'white',
    margin: 0
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    color: 'white',
    marginTop: '0.5rem',
    fontWeight: 'bold',
    textAlign: 'left'
  };

  const cardStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const activityListStyle = {
    display: 'grid',
    gap: '1rem'
  };

  const activityItemStyle = {
    ...cardStyle,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const getUnitForActivity = (type) => {
    const units = {
      recycling: 'kg',
      renewable: 'kWh',
      conservation: 'liters',
      sustainable: 'km',
      composting: 'kg',
      tree_planting: 'trees',
      beach_cleanup: 'kg',
      energy_saving: 'kWh',
      plastic_reduction: 'items',
      food_waste: 'kg'
    };
    return units[type] || 'units';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!connected) {
    // Format the provided time string
    const providedTime = new Date('2024-12-08T15:11:04+08:00');
    const formattedTime = providedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const formattedDate = providedTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div style={containerStyle}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem', 
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #4CAF50'
        }}>
          <h1 style={{ 
            color: '#4CAF50', 
            fontSize: '3rem', 
            marginBottom: '1rem'
          }}>SOuL Sanctuary Season 1</h1>
          <h2 style={{ 
            color: 'white', 
            fontSize: '2rem', 
            marginBottom: '1rem'
          }}>Sowing SOuL Seeds</h2>
          <p style={{
            color: '#e0e0e0',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            fontFamily: 'monospace'
          }}>{formattedDate} • {formattedTime}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Connect your wallet, create your profile, and earn SOuL XPs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>SOuL Impact Dashboard</h1>
        </div>
        <ShareButton stats={stats} />
      </div>

      <PointSystem activities={activities} />
      
      <SeasonalEvents />
      
      <ImpactCharts activities={activities} stats={stats} />
      
      <Badges stats={stats} />
      
      <Challenges />
      
      <NFTRewards />
      
      <NFTMarketplace />
      
      <NFTStaking />
      
      <NFTBreeding />
      
      <AchievementTiers />
      
      <Governance />
      
      <Leaderboard />

      <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Recent Activities</h2>
      <div style={activityListStyle}>
        {loading ? (
          <div style={cardStyle}>
            <p style={{ textAlign: 'center' }}>Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div style={cardStyle}>
            <p style={{ textAlign: 'center' }}>No activities recorded yet</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} style={activityItemStyle}>
              <div>
                <h3 style={{ color: '#4CAF50', margin: '0 0 0.5rem' }}>
                  {activity.activityType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h3>
                <p style={{ margin: '0 0 0.5rem', color: '#888' }}>
                  {activity.description}
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                  {activity.location} • {formatDate(activity.date)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0', fontSize: '1.25rem' }}>
                  {parseFloat(activity.impact).toFixed(2)} {getUnitForActivity(activity.activityType)}
                </p>
                <a 
                  href={`https://explorer.solana.com/tx/${activity.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#4CAF50',
                    textDecoration: 'none',
                    fontSize: '0.8rem'
                  }}
                >
                  View on Explorer
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <CrossChainBridge />
    </div>
  );
}

export default Dashboard;
