import React from 'react';
import './ActionCard.css';

const ActionCard = ({ action }) => {
    const {
        type,
        timestamp,
        location,
        details,
        impact,
        verification
    } = action;

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVerificationStatusClass = () => {
        if (!verification) return 'pending';
        return verification.isValid ? 'verified' : 'pending';
    };

    const getActionIcon = () => {
        switch (type) {
            case 'TREE_PLANTING':
                return '🌳';
            case 'WATER_CONSERVATION':
                return '💧';
            case 'SOLAR_PANEL_INSTALLATION':
                return '☀️';
            case 'RECYCLING':
                return '♻️';
            case 'COMPOSTING':
                return '🌱';
            default:
                return '🌍';
        }
    };

    const formatImpactValue = (value, unit) => {
        if (typeof value !== 'number') return 'N/A';
        return `${value.toFixed(2)} ${unit}`;
    };

    return (
        <div className="action-card">
            <div className="action-header">
                <div className="action-type">
                    <span className="action-icon">{getActionIcon()}</span>
                    <h3>{type.replace(/_/g, ' ')}</h3>
                </div>
                <div className="action-meta">
                    <span className="action-date">{formatDate(timestamp)}</span>
                    <span className={`verification-status ${getVerificationStatusClass()}`}>
                        {verification?.isValid ? 'Verified' : 'Pending'}
                    </span>
                </div>
            </div>

            {location && (
                <div className="action-location">
                    <span className="location-icon">📍</span>
                    <span>{location.name || `${location.latitude}, ${location.longitude}`}</span>
                </div>
            )}

            <div className="action-details">
                {details && Object.entries(details).map(([key, value]) => (
                    <div key={key} className="detail-item">
                        <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                        <span className="detail-value">
                            {typeof value === 'number' ? formatImpactValue(value, '') : value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="impact-summary">
                <h4>Environmental Impact</h4>
                <div className="impact-grid">
                    {impact && Object.entries(impact).map(([key, value]) => (
                        <div key={key} className="impact-item">
                            <span className="impact-label">{key.replace(/_/g, ' ')}:</span>
                            <span className="impact-value">
                                {formatImpactValue(value, key === 'carbonOffset' ? 'kg' :
                                    key === 'waterRetention' ? 'L' :
                                    key === 'renewableEnergy' ? 'kWh' : '')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {verification && (
                <div className="verification-details">
                    <div className="verification-header">
                        <h4>Verification Details</h4>
                        <span className="confidence-score">
                            Confidence: {(verification.confidenceScore * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="verification-info">
                        <span>Method: {verification.verificationMethod}</span>
                        {verification.verifiedAt && (
                            <span>Verified: {formatDate(verification.verifiedAt)}</span>
                        )}
                        {verification.pendingReason && (
                            <div className="pending-reason">
                                <span>Pending: {verification.pendingReason}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionCard;
