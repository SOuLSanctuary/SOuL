import React, { useState, useEffect } from 'react';
import './AchievementModal.css';

const AchievementModal = ({ 
    achievement, 
    onClose, 
    onShare,
    playerStats,
    isOpen 
}) => {
    const [animationState, setAnimationState] = useState('initial');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            setAnimationState('enter');
            // Reset confetti after animation
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setAnimationState('exit');
        setTimeout(onClose, 300); // Match CSS animation duration
    };

    const calculateImpact = () => {
        if (!achievement || !playerStats) return null;

        const impactMetrics = {
            carbon: {
                value: playerStats.totalImpact?.carbonOffset || 0,
                unit: 'kg CO₂',
                icon: '🌱'
            },
            water: {
                value: playerStats.totalImpact?.waterRetention || 0,
                unit: 'L',
                icon: '💧'
            },
            biodiversity: {
                value: playerStats.totalImpact?.biodiversityScore || 0,
                unit: 'points',
                icon: '🦋'
            },
            community: {
                value: playerStats.communityContributions || 0,
                unit: 'actions',
                icon: '🤝'
            }
        };

        return impactMetrics[achievement.category] || null;
    };

    const renderConfetti = () => {
        if (!showConfetti) return null;

        return (
            <div 
                className="confetti-container"
                data-testid="confetti-container"
            >
                {Array(50).fill(null).map((_, i) => (
                    <div 
                        key={i}
                        className="confetti"
                        style={{
                            '--delay': `${Math.random() * 3}s`,
                            '--rotation': `${Math.random() * 360}deg`,
                            '--position': `${Math.random() * 100}%`,
                            backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`
                        }}
                    />
                ))}
            </div>
        );
    };

    const renderProgressBar = () => {
        if (!achievement) return null;

        const progress = (achievement.currentValue / achievement.targetValue) * 100;
        return (
            <div className="achievement-progress">
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        data-testid="progress-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <div className="progress-text">
                    <span>{achievement.currentValue.toFixed(1)}</span>
                    <span>/</span>
                    <span>{achievement.targetValue.toFixed(1)}</span>
                </div>
            </div>
        );
    };

    const renderRewards = () => {
        if (!achievement?.rewards) return null;

        return (
            <div className="achievement-rewards">
                <h4>Rewards Earned</h4>
                <div className="rewards-grid">
                    {achievement.rewards.map((reward, index) => (
                        <div key={index} className="reward-item">
                            <div className="reward-icon">{reward.icon}</div>
                            <div className="reward-details">
                                <span className="reward-name">{reward.name}</span>
                                <span className="reward-value">+{reward.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderNextMilestone = () => {
        if (!achievement?.nextMilestone) return null;

        return (
            <div className="next-milestone">
                <h4>Next Milestone</h4>
                <div className="milestone-preview">
                    <div className="milestone-icon">🎯</div>
                    <div className="milestone-details">
                        <span className="milestone-name">
                            {achievement.nextMilestone.name}
                        </span>
                        <span className="milestone-requirement">
                            {achievement.nextMilestone.requirement}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (!achievement || !isOpen) return null;

    const impact = calculateImpact();

    return (
        <div 
            className={`achievement-modal-overlay ${animationState}`}
            data-testid="achievement-modal-overlay"
        >
            {renderConfetti()}
            <div className="achievement-modal">
                <button 
                    className="close-button"
                    onClick={handleClose}
                    aria-label="Close achievement modal"
                >
                    ×
                </button>

                <div className="achievement-header">
                    <div className="achievement-icon-container">
                        <div className="achievement-icon">
                            {achievement.icon}
                        </div>
                        <div className="achievement-glow" />
                    </div>
                    <h2>{achievement.title}</h2>
                    <p className="achievement-description">
                        {achievement.description}
                    </p>
                </div>

                {renderProgressBar()}

                {impact && (
                    <div className="impact-summary">
                        <h4>Your Impact</h4>
                        <div className="impact-metric">
                            <span className="impact-icon">{impact.icon}</span>
                            <span className="impact-value">
                                {impact.value.toFixed(1)} {impact.unit}
                            </span>
                        </div>
                    </div>
                )}

                {renderRewards()}
                {renderNextMilestone()}

                <div className="achievement-actions">
                    <button 
                        className="share-button"
                        onClick={() => onShare(achievement)}
                    >
                        Share Achievement 🌍
                    </button>
                    <button 
                        className="continue-button"
                        onClick={handleClose}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementModal;
