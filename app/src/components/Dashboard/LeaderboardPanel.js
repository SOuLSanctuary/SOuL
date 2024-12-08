import React, { useState, useEffect } from 'react';
import './LeaderboardPanel.css';

const LeaderboardPanel = ({ communityData }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [timeframe, setTimeframe] = useState('1');
    const [view, setView] = useState('individual');
    const [category, setCategory] = useState('carbon');

    useEffect(() => {
        if (communityData) {
            const data = processLeaderboardData(communityData);
            setLeaderboardData(data);
        }
    }, [communityData, timeframe, view, category]);

    const processLeaderboardData = (data) => {
        if (!data) return [];

        // Handle empty or invalid data
        const players = data.players || [];
        const teams = data.teams || [];

        if (view === 'individual') {
            return players.map(player => ({
                id: player.id,
                name: player.name,
                avatar: player.avatar,
                metricValue: player.metrics?.[category] || 0,
                verificationRate: player.verificationRate || 0,
                recentActions: player.recentActions || 0
            }));
        } else {
            return teams.map(team => ({
                id: team.id,
                name: team.name,
                avatar: team.avatar,
                memberCount: team.members?.length || 0,
                metricValue: team.metrics?.[category] || 0,
                verificationRate: team.verificationRate || 0,
                recentActions: team.recentActions || 0
            }));
        }
    };

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    const handleViewChange = (newView) => {
        setView(newView);
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
    };

    // Render empty state if no data
    if (!communityData) {
        return (
            <div className="leaderboard-panel">
                <h3>Community Leaderboard</h3>
                <div className="empty-state">No data available</div>
            </div>
        );
    }

    return (
        <div className="leaderboard-panel">
            <div className="leaderboard-header">
                <h3>Community Leaderboard</h3>
                <div className="timeframe-selector">
                    <select 
                        value={timeframe}
                        onChange={handleTimeframeChange}
                    >
                        <option value="1">24 Hours</option>
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            <div className="global-impact">
                <div className="impact-stat">
                    <span className="stat-label">Total Carbon Offset</span>
                    <span className="stat-value">{communityData.totalCarbonOffset?.toFixed(1) || '0.0'} kg</span>
                </div>
                <div className="impact-stat">
                    <span className="stat-label">Water Saved</span>
                    <span className="stat-value">{communityData.totalWaterSaved?.toFixed(1) || '0.0'} L</span>
                </div>
                <div className="impact-stat">
                    <span className="stat-label">Active Participants</span>
                    <span className="stat-value">{communityData.activeParticipants || 0}</span>
                </div>
            </div>

            <div className="leaderboard-tabs">
                <button 
                    className={`tab ${view === 'individual' ? 'active' : ''}`}
                    onClick={() => handleViewChange('individual')}
                >
                    Individual
                </button>
                <button 
                    className={`tab ${view === 'team' ? 'active' : ''}`}
                    onClick={() => handleViewChange('team')}
                >
                    Team
                </button>
            </div>

            <div className="category-selector">
                <button 
                    className={`category ${category === 'carbon' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('carbon')}
                >
                    Carbon Offset
                </button>
                <button 
                    className={`category ${category === 'water' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('water')}
                >
                    Water Saved
                </button>
                <button 
                    className={`category ${category === 'biodiversity' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('biodiversity')}
                >
                    Biodiversity
                </button>
                <button 
                    className={`category ${category === 'actions' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('actions')}
                >
                    Actions
                </button>
            </div>

            <div className="leaderboard-list">
                {leaderboardData.map((entry, index) => (
                    <div 
                        key={entry.id}
                        className="leaderboard-entry"
                    >
                        <div className="rank">#{index + 1}</div>
                        <div className="player-info">
                            <img 
                                src={entry.avatar} 
                                alt={`${entry.name}'s avatar`}
                                className="avatar"
                            />
                            <div className="name-container">
                                <span className="name">{entry.name}</span>
                                {view === 'team' && (
                                    <span className="member-count">
                                        {entry.memberCount} members
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="metrics">
                            <span className="metric-value">
                                {entry.metricValue.toFixed(1)} {category === 'carbon' ? 'kg' : 'L'}
                            </span>
                            <div className="sub-metrics">
                                <span className="verification-rate">
                                    {entry.verificationRate.toFixed(1)}% {view === 'team' ? 'team avg' : 'verified'}
                                </span>
                                <span className="recent-activity">
                                    {entry.recentActions} recent actions
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardPanel;
