import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Chart } from 'react-chartjs-2';
import './Profile.css';

const Profile = ({ gameStateManager }) => {
    const { publicKey } = useWallet();
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (publicKey) {
            loadPlayerData();
        }
    }, [publicKey]);

    const loadPlayerData = async () => {
        try {
            setLoading(true);
            const data = await gameStateManager.getPlayerProfile(publicKey.toString());
            setPlayerData(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateLevelProgress = () => {
        if (!playerData) return 0;
        const { experience, level } = playerData;
        const expForNextLevel = level * 1000; // Example calculation
        const expInCurrentLevel = experience - ((level - 1) * 1000);
        return (expInCurrentLevel / expForNextLevel) * 100;
    };

    const renderOverviewTab = () => (
        <div className="profile-overview">
            <div className="profile-header">
                <div className="profile-avatar">
                    {playerData?.avatar || '🌳'}
                </div>
                <div className="profile-info">
                    <h2>{playerData?.username || 'Explorer'}</h2>
                    <p className="profile-title">{playerData?.title || 'Novice Guardian'}</p>
                    <div className="level-progress">
                        <div className="level-badge">Level {playerData?.level}</div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${calculateLevelProgress()}%` }}
                            />
                        </div>
                        <span className="exp-text">
                            {playerData?.experience} / {playerData?.level * 1000} XP
                        </span>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Environmental Impact</h3>
                    <div className="stat-value">
                        {playerData?.impactScore || 0}
                    </div>
                    <p>Total Impact Score</p>
                </div>
                <div className="stat-card">
                    <h3>Collectibles</h3>
                    <div className="stat-value">
                        {playerData?.collectibles?.length || 0}
                    </div>
                    <p>Unique Items Found</p>
                </div>
                <div className="stat-card">
                    <h3>Quests</h3>
                    <div className="stat-value">
                        {playerData?.questsCompleted || 0}
                    </div>
                    <p>Completed Missions</p>
                </div>
                <div className="stat-card">
                    <h3>Team Contributions</h3>
                    <div className="stat-value">
                        {playerData?.teamContributions || 0}
                    </div>
                    <p>Team Impact Score</p>
                </div>
            </div>
        </div>
    );

    const renderAchievementsTab = () => (
        <div className="achievements-tab">
            <div className="achievements-list">
                {playerData?.achievements?.map(achievement => (
                    <div 
                        key={achievement.id}
                        className={`achievement-item ${achievement.completed ? 'completed' : ''}`}
                    >
                        <div className="achievement-icon">
                            {achievement.icon}
                        </div>
                        <div className="achievement-info">
                            <h3>{achievement.name}</h3>
                            <p>{achievement.description}</p>
                            {!achievement.completed && (
                                <div className="achievement-progress">
                                    <div 
                                        className="progress-bar"
                                        style={{ 
                                            width: `${(achievement.progress / achievement.target) * 100}%`
                                        }}
                                    />
                                    <span>
                                        {achievement.progress} / {achievement.target}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderImpactTab = () => (
        <div className="impact-tab">
            <div className="impact-metrics">
                <div className="impact-chart">
                    <Chart
                        type="doughnut"
                        data={{
                            labels: ['Carbon Offset', 'Water Saved', 'Energy Conserved'],
                            datasets: [{
                                data: [
                                    playerData?.impact?.carbonOffset || 0,
                                    playerData?.impact?.waterSaved || 0,
                                    playerData?.impact?.energySaved || 0
                                ],
                                backgroundColor: [
                                    '#2ecc71',
                                    '#3498db',
                                    '#f1c40f'
                                ]
                            }]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false
                        }}
                    />
                </div>
                <div className="impact-details">
                    <div className="impact-metric">
                        <h3>Carbon Offset</h3>
                        <p>{playerData?.impact?.carbonOffset || 0} kg CO2</p>
                    </div>
                    <div className="impact-metric">
                        <h3>Water Saved</h3>
                        <p>{playerData?.impact?.waterSaved || 0} liters</p>
                    </div>
                    <div className="impact-metric">
                        <h3>Energy Conserved</h3>
                        <p>{playerData?.impact?.energySaved || 0} kWh</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <p>{error}</p>
                <button onClick={loadPlayerData}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={activeTab === 'achievements' ? 'active' : ''}
                    onClick={() => setActiveTab('achievements')}
                >
                    Achievements
                </button>
                <button
                    className={activeTab === 'impact' ? 'active' : ''}
                    onClick={() => setActiveTab('impact')}
                >
                    Environmental Impact
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'achievements' && renderAchievementsTab()}
                {activeTab === 'impact' && renderImpactTab()}
            </div>
        </div>
    );
};

export default Profile;
