import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

function Leaderboard() {
  const { wallet } = useWallet();
  const [leaderboard, setLeaderboard] = useState([]);

  // Simulate leaderboard data (replace with actual data from your program)
  useEffect(() => {
    const mockLeaderboard = [
      { wallet: wallet?.publicKey?.toString() || 'Your Wallet', totalImpact: 1250, rank: 1 },
      { wallet: '7xKX...P9Yk', totalImpact: 980, rank: 2 },
      { wallet: '3mZR...L8Pj', totalImpact: 850, rank: 3 },
      { wallet: '9nQM...K4Wm', totalImpact: 720, rank: 4 },
      { wallet: '5pVB...H2Nx', totalImpact: 650, rank: 5 }
    ];
    setLeaderboard(mockLeaderboard);
  }, [wallet]);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const titleStyle = {
    color: '#4CAF50',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    textAlign: 'center'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const cellStyle = {
    padding: '1rem',
    borderBottom: '1px solid #333',
    textAlign: 'left'
  };

  const headerCellStyle = {
    ...cellStyle,
    color: '#4CAF50',
    fontWeight: 'bold'
  };

  const rankStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const badgeStyle = (rank) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: rank === 1 ? '#000' : '#fff',
    fontWeight: 'bold',
    fontSize: '0.8rem'
  });

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Environmental Impact Leaderboard</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Rank</th>
              <th style={headerCellStyle}>Wallet</th>
              <th style={headerCellStyle}>Total Impact</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.wallet} style={{
                backgroundColor: entry.wallet === wallet?.publicKey?.toString() ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
              }}>
                <td style={cellStyle}>
                  <div style={rankStyle}>
                    <div style={badgeStyle(entry.rank)}>{entry.rank}</div>
                  </div>
                </td>
                <td style={cellStyle}>
                  {entry.wallet}
                  {entry.wallet === wallet?.publicKey?.toString() && ' (You)'}
                </td>
                <td style={cellStyle}>{entry.totalImpact.toLocaleString()} points</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;
