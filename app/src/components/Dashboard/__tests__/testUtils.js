import { render } from '@testing-library/react';

// Mock environmental impact data
export const mockImpactData = {
    daily: {
        carbonOffset: 50.25,
        waterRetention: 750.50,
        biodiversityScore: 25.75,
        renewableEnergy: 150.0
    },
    weekly: {
        carbonOffset: 350.75,
        waterRetention: 5250.25,
        biodiversityScore: 180.25,
        renewableEnergy: 1050.0
    },
    monthly: {
        carbonOffset: 1500.50,
        waterRetention: 22500.75,
        biodiversityScore: 750.50,
        renewableEnergy: 4500.0
    },
    total: {
        carbonOffset: 18000.0,
        waterRetention: 270000.0,
        biodiversityScore: 9000.0,
        renewableEnergy: 54000.0
    }
};

// Mock environmental actions
export const mockEnvironmentalActions = [
    {
        id: '1',
        type: 'TREE_PLANTING',
        timestamp: '2024-01-15T10:30:00Z',
        location: {
            latitude: 37.7749,
            longitude: -122.4194,
            name: 'San Francisco Park'
        },
        details: {
            species: 'Oak',
            quantity: 3,
            soilCondition: 'good',
            weather: 'sunny'
        },
        impact: {
            carbonOffset: 22.5,
            waterRetention: 100.0,
            biodiversityScore: 15.0
        },
        verification: {
            isValid: true,
            confidenceScore: 0.95,
            verifiedAt: '2024-01-15T10:35:00Z',
            verificationMethod: 'GPS + Photo'
        }
    },
    {
        id: '2',
        type: 'WATER_CONSERVATION',
        timestamp: '2024-01-14T15:45:00Z',
        location: {
            latitude: 37.7833,
            longitude: -122.4167,
            name: 'Community Garden'
        },
        details: {
            method: 'Drip Irrigation',
            area: 500,
            duration: 120
        },
        impact: {
            waterRetention: 500.0,
            carbonOffset: 5.2,
            biodiversityScore: 3.5
        },
        verification: {
            isValid: true,
            confidenceScore: 0.88,
            verifiedAt: '2024-01-14T15:50:00Z',
            verificationMethod: 'IoT Sensor'
        }
    },
    {
        id: '3',
        type: 'SOLAR_PANEL_INSTALLATION',
        timestamp: '2024-01-13T09:15:00Z',
        location: {
            latitude: 37.7858,
            longitude: -122.4064,
            name: 'Residential Building'
        },
        details: {
            capacity: 5000,
            panelType: 'Monocrystalline',
            quantity: 12
        },
        impact: {
            renewableEnergy: 450.2,
            carbonOffset: 200.5,
            biodiversityScore: 1.5
        },
        verification: {
            isValid: false,
            confidenceScore: 0.45,
            verificationMethod: 'Manual Review',
            pendingReason: 'Awaiting installation photos'
        }
    }
];

// Mock verification results
export const mockVerificationResults = {
    success: {
        isValid: true,
        confidenceScore: 0.95,
        verificationMethod: 'GPS + Photo',
        timestamp: new Date().toISOString(),
        details: {
            locationAccuracy: 'high',
            photoQuality: 'good',
            timeAccuracy: 'exact'
        }
    },
    pending: {
        isValid: false,
        confidenceScore: 0.45,
        verificationMethod: 'Manual Review',
        timestamp: new Date().toISOString(),
        pendingReason: 'Awaiting verification',
        requiredActions: ['Submit clear photos', 'Provide GPS coordinates']
    },
    failed: {
        isValid: false,
        confidenceScore: 0.2,
        verificationMethod: 'Automated Check',
        timestamp: new Date().toISOString(),
        failureReason: 'Location mismatch',
        details: {
            locationAccuracy: 'low',
            photoQuality: 'poor',
            timeAccuracy: 'delayed'
        }
    }
};

// Custom render function with providers
export function renderWithProviders(ui, { providerProps = {}, ...renderOptions } = {}) {
    return render(ui, { ...renderOptions });
}

// Helper to mock API responses
export const mockApiResponse = (data, delay = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
};

// Helper to format impact values for testing
export const formatImpactValue = (value, unit) => {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(2)} ${unit}`;
};

// Helper to generate trend data
export const generateTrendData = (baseValue, days = 7) => {
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
        value: baseValue + (Math.random() - 0.5) * baseValue * 0.2
    }));
};

// Helper to calculate trend direction
export const calculateTrend = (current, previous) => {
    if (!current || !previous) return 'neutral';
    const difference = current - previous;
    if (Math.abs(difference) < 0.001) return 'neutral';
    return difference > 0 ? 'positive' : 'negative';
};

// Test IDs for component selection
export const testIds = {
    dashboard: 'environmental-dashboard',
    loadingSpinner: 'loading-spinner',
    errorMessage: 'error-message',
    retryButton: 'retry-button',
    timeframeSelector: 'timeframe-selector',
    impactCard: 'impact-card',
    trendIndicator: 'trend-indicator',
    actionsList: 'actions-list',
    actionItem: 'action-item',
    verificationStatus: 'verification-status',
    impactChart: 'impact-chart'
};
