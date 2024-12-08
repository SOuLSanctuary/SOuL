import React, { useState, useEffect } from 'react';
import { useImpactCalculator } from '../../hooks/useImpactCalculator';
import './RewardsPanel.css';

const RewardsPanel = ({ playerStats }) => {
    const [achievements, setAchievements] = useState([]);
    const [rewards, setRewards] = useState({
        total: 0,
        pending: 0,
        recent: []
    });

    const { getRewardBreakdown } = useImpactCalculator();

    useEffect(() => {
        if (playerStats) {
            calculateAchievements();
            updateRewards();
        }
    }, [playerStats]);

    const calculateAchievements = () => {
        const newAchievements = [
            {
                id: 'trees_planted',
                title: 'Forest Guardian',
                description: 'Plant 10 trees',
                progress: playerStats.actionCounts?.TREE_PLANTING || 0,
                target: 10,
                icon: '🌳',
                reward: 100
            },
            {
                id: 'water_saved',
                title: 'Water Warrior',
                description: 'Save 1000L of water',
                progress: playerStats.totalImpact?.waterRetention || 0,
                target: 1000,
                icon: '💧',
                reward: 150
            },
            {
                id: 'carbon_offset',
                title: 'Carbon Crusher',
                description: 'Offset 100kg of carbon',
                progress: playerStats.totalImpact?.carbonOffset || 0,
                target: 100,
                icon: '🌱',
                reward: 200
            },
            {
                id: 'biodiversity',
                title: 'Biodiversity Champion',
                description: 'Reach biodiversity score of 50',
                progress: playerStats.totalImpact?.biodiversityScore || 0,
                target: 50,
                icon: '🦋',
                reward: 250
            }
        ];

        setAchievements(newAchievements);
    };

    const updateRewards = () => {
        const recentRewards = playerStats.recentActions?.map(action => {
            const breakdown = getRewardBreakdown(action.impact, playerStats);
            return {
                id: action.id,
                timestamp: action.timestamp,
                amount: breakdown.amount,
                breakdown: breakdown.breakdown,
                multipliers: breakdown.multipliers,
                status: action.verification?.isValid ? 'verified' : 'pending'
            };
        }) || [];

        const totalRewards = recentRewards.reduce((sum, reward) => 
            sum + (reward.status === 'verified' ? reward.amount : 0), 0);
        
        const pendingRewards = recentRewards.reduce((sum, reward) => 
            sum + (reward.status === 'pending' ? reward.amount : 0), 0);

        setRewards({
            total: totalRewards,
            pending: pendingRewards,
            recent: recentRewards
        });
    };

    const calculateProgress = (achievement) => {
        const progress = (achievement.progress / achievement.target) * 100;
        return Math.min(progress, 100);
    };

    return (
        <div className="rewards-panel">
            <div className="rewards-summary">
                <h3>Rewards & Achievements</h3>
                <div className="rewards-stats">
                    <div className="reward-stat">
                        <span className="stat-label">Total Rewards</span>
                        <span className="stat-value">🏆 {rewards.total.toFixed(0)}</span>
                    </div>
                    <div className="reward-stat">
                        <span className="stat-label">Pending Verification</span>
                        <span className="stat-value pending">⏳ {rewards.pending.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            <div className="achievements-section">
                <h4>Current Achievements</h4>
                <div className="achievements-grid">
                    {achievements.map(achievement => {
                        const progress = calculateProgress(achievement);
                        const isCompleted = progress >= 100;

                        return (
                            <div 
                                key={achievement.id} 
                                className={`achievement-card ${isCompleted ? 'completed' : ''}`}
                            >
                                <div className="achievement-icon">{achievement.icon}</div>
                                <div className="achievement-info">
                                    <h5>{achievement.title}</h5>
                                    <p>{achievement.description}</p>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="achievement-progress">
                                        <span>{achievement.progress.toFixed(0)} / {achievement.target}</span>
                                        <span className="reward-amount">+{achievement.reward}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="recent-rewards">
                <h4>Recent Rewards</h4>
                <div className="rewards-list">
                    {rewards.recent.map(reward => (
                        <div key={reward.id} className="reward-item">
                            <div className="reward-header">
                                <span className="reward-amount">+{reward.amount.toFixed(0)}</span>
                                <span className={`reward-status ${reward.status}`}>
                                    {reward.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                                </span>
                            </div>
                            <div className="reward-breakdown">
                                {Object.entries(reward.breakdown).map(([key, value]) => (
                                    <div key={key} className="breakdown-item">
                                        <span className="breakdown-label">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="breakdown-value">
                                            +{value.toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="reward-multipliers">
                                {Object.entries(reward.multipliers).map(([key, value]) => (
                                    <span key={key} className="multiplier">
                                        {key}: {value.toFixed(2)}x
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RewardsPanel;
