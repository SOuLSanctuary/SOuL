import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './Achievements.css';

const ACHIEVEMENT_CATEGORIES = {
    CONSERVATION: '🌳',
    WATER: '💧',
    WILDLIFE: '🦁',
    COMMUNITY: '👥',
    RESEARCH: '🔬',
    SPECIAL: '⭐'
};

const Achievements = ({ gameStateManager }) => {
    const { publicKey } = useWallet();
    const [achievements, setAchievements] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (publicKey) {
            loadAchievements();
        }
    }, [publicKey]);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const playerAchievements = await gameStateManager.getPlayerAchievements(publicKey.toString());
            setAchievements(playerAchievements);
        } catch (error) {
            console.error('Failed to load achievements:', error);
            setError('Failed to load achievements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterAchievements = () => {
        if (selectedCategory === 'ALL') {
            return achievements;
        }
        return achievements.filter(achievement => achievement.category === selectedCategory);
    };

    const calculateProgress = (achievement) => {
        const progress = (achievement.currentProgress / achievement.requiredProgress) * 100;
        return Math.min(progress, 100);
    };

    if (loading) {
        return (
            <div className="achievements-loading">
                <div className="loading-spinner"></div>
                <p>Loading achievements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="achievements-error">
                <p>{error}</p>
                <button onClick={loadAchievements}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="achievements-container">
            <div className="achievements-header">
                <h2>Achievements</h2>
                <div className="category-filters">
                    <button 
                        className={selectedCategory === 'ALL' ? 'active' : ''}
                        onClick={() => setSelectedCategory('ALL')}
                    >
                        All
                    </button>
                    {Object.entries(ACHIEVEMENT_CATEGORIES).map(([category, emoji]) => (
                        <button
                            key={category}
                            className={selectedCategory === category ? 'active' : ''}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {emoji} {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="achievements-grid">
                {filterAchievements().map(achievement => (
                    <div 
                        key={achievement.id} 
                        className={`achievement-card ${achievement.completed ? 'completed' : ''}`}
                    >
                        <div className="achievement-icon">
                            {ACHIEVEMENT_CATEGORIES[achievement.category]}
                        </div>
                        <div className="achievement-content">
                            <h3>{achievement.title}</h3>
                            <p>{achievement.description}</p>
                            <div className="achievement-progress">
                                <div 
                                    className="progress-bar"
                                    style={{ width: `${calculateProgress(achievement)}%` }}
                                />
                                <span className="progress-text">
                                    {achievement.currentProgress} / {achievement.requiredProgress}
                                </span>
                            </div>
                            {achievement.completed && (
                                <div className="achievement-reward">
                                    <span>🏆 Reward: {achievement.reward}</span>
                                </div>
                            )}
                            {!achievement.completed && achievement.hint && (
                                <div className="achievement-hint">
                                    💡 Hint: {achievement.hint}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="achievements-summary">
                <div className="summary-stat">
                    <h4>Total Achievements</h4>
                    <p>{achievements.length}</p>
                </div>
                <div className="summary-stat">
                    <h4>Completed</h4>
                    <p>{achievements.filter(a => a.completed).length}</p>
                </div>
                <div className="summary-stat">
                    <h4>Total Impact</h4>
                    <p>{achievements.reduce((sum, a) => sum + (a.impactScore || 0), 0)}</p>
                </div>
            </div>
        </div>
    );
};

export default Achievements;
