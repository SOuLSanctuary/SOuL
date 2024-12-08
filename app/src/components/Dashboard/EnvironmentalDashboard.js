import React, { useState, useEffect } from 'react';
import { useImpactCalculator } from '../../hooks/useImpactCalculator';
import { useEnvironmentalVerification } from '../../hooks/useEnvironmentalVerification';
import './EnvironmentalDashboard.css';

const EnvironmentalDashboard = () => {
    const {
        calculateActionImpact,
        getHistoricalImpact,
        estimateActionImpact,
        isCalculating,
        lastImpact,
        error
    } = useImpactCalculator();

    const { verifyAction } = useEnvironmentalVerification();

    const [dashboardData, setDashboardData] = useState({
        totalImpact: null,
        weeklyImpact: null,
        monthlyImpact: null,
        recentActions: [],
        loading: true,
        error: null
    });

    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

    useEffect(() => {
        loadDashboardData();
    }, [selectedTimeframe]);

    const loadDashboardData = async () => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true, error: null }));

            const [total, weekly, monthly] = await Promise.all([
                getHistoricalImpact('all'),
                getHistoricalImpact('7d'),
                getHistoricalImpact('30d')
            ]);

            setDashboardData(prev => ({
                ...prev,
                totalImpact: total,
                weeklyImpact: weekly,
                monthlyImpact: monthly,
                loading: false
            }));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setDashboardData(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load impact data'
            }));
        }
    };

    const formatImpactValue = (value, unit) => {
        if (typeof value !== 'number') return 'N/A';
        return `${value.toFixed(2)} ${unit}`;
    };

    const getImpactTrend = (current, previous) => {
        if (!current || !previous) return 'neutral';
        return current > previous ? 'positive' : current < previous ? 'negative' : 'neutral';
    };

    const renderImpactCard = (title, impact, previousImpact, mainUnit) => {
        const trend = getImpactTrend(impact?.[mainUnit], previousImpact?.[mainUnit]);
        
        return (
            <div className="impact-card">
                <h3>{title}</h3>
                <div className="impact-value">
                    <span className={`trend-indicator ${trend}`}>
                        {trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '→'}
                    </span>
                    <span className="main-value">
                        {formatImpactValue(impact?.[mainUnit], mainUnit)}
                    </span>
                </div>
                <div className="impact-details">
                    {impact && Object.entries(impact)
                        .filter(([key]) => key !== mainUnit)
                        .map(([key, value]) => (
                            <div key={key} className="detail-item">
                                <span className="detail-label">{key}:</span>
                                <span className="detail-value">{formatImpactValue(value, key)}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="environmental-dashboard">
            <header className="dashboard-header">
                <h1>Environmental Impact Dashboard</h1>
                <div className="timeframe-selector">
                    <select 
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </header>

            {dashboardData.loading ? (
                <div className="loading-indicator">
                    <span className="spinner"></span>
                    <p>Loading impact data...</p>
                </div>
            ) : dashboardData.error ? (
                <div className="error-message">
                    <p>{dashboardData.error}</p>
                    <button onClick={loadDashboardData}>Retry</button>
                </div>
            ) : (
                <div className="dashboard-content">
                    <div className="impact-summary">
                        {renderImpactCard(
                            'Carbon Impact',
                            dashboardData.weeklyImpact,
                            dashboardData.previousWeekImpact,
                            'carbonOffset'
                        )}
                        {renderImpactCard(
                            'Water Conservation',
                            dashboardData.weeklyImpact,
                            dashboardData.previousWeekImpact,
                            'waterRetention'
                        )}
                        {renderImpactCard(
                            'Biodiversity Score',
                            dashboardData.weeklyImpact,
                            dashboardData.previousWeekImpact,
                            'biodiversityScore'
                        )}
                    </div>

                    <div className="impact-charts">
                        <div className="chart-container">
                            <h3>Impact Trends</h3>
                            {/* Add charts/graphs here */}
                        </div>
                    </div>

                    <div className="recent-actions">
                        <h3>Recent Environmental Actions</h3>
                        <div className="action-list">
                            {dashboardData.recentActions.map((action, index) => (
                                <div key={index} className="action-item">
                                    <div className="action-header">
                                        <span className="action-type">{action.type}</span>
                                        <span className="action-date">
                                            {new Date(action.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="action-impact">
                                        <div className="impact-item">
                                            <span>Carbon Offset:</span>
                                            <span>{formatImpactValue(action.impact.carbonOffset, 'kg')}</span>
                                        </div>
                                        <div className="impact-item">
                                            <span>Water Saved:</span>
                                            <span>{formatImpactValue(action.impact.waterRetention, 'L')}</span>
                                        </div>
                                    </div>
                                    <div className="action-verification">
                                        <span className={`verification-status ${action.verification.isValid ? 'verified' : 'pending'}`}>
                                            {action.verification.isValid ? 'Verified' : 'Pending Verification'}
                                        </span>
                                        <span className="confidence-score">
                                            Confidence: {(action.verification.confidenceScore * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvironmentalDashboard;
