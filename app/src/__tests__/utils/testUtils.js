import React from 'react';
import { render } from '@testing-library/react';

// Mock data generators
export const generateMockImpactData = (days = 7) => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < days * 24; i++) {
        const timestamp = new Date(now - i * 3600000);
        data.push({
            timestamp: timestamp.toISOString(),
            metrics: {
                carbon: Math.random() * 50,
                water: Math.random() * 1000,
                biodiversity: Math.random() * 100,
                energy: Math.random() * 30
            },
            verification: {
                isValid: Math.random() > 0.2,
                confidenceScore: Math.random()
            }
        });
    }
    
    return data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export const generateMockPlayerStats = () => ({
    id: 'player1',
    name: 'Test Player',
    avatar: 'avatar.jpg',
    level: Math.floor(Math.random() * 100),
    totalImpact: {
        carbonOffset: Math.random() * 1000,
        waterRetention: Math.random() * 10000,
        biodiversityScore: Math.random() * 1000,
        energySaved: Math.random() * 500
    },
    achievements: Array(5).fill(null).map((_, i) => ({
        id: `achievement${i}`,
        title: `Test Achievement ${i}`,
        description: `Description for achievement ${i}`,
        progress: Math.random() * 100,
        completed: Math.random() > 0.5
    })),
    recentActions: Array(10).fill(null).map((_, i) => ({
        id: `action${i}`,
        type: ['PLANT_TREE', 'SAVE_WATER', 'REDUCE_EMISSIONS'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        impact: {
            carbon: Math.random() * 20,
            water: Math.random() * 200,
            biodiversity: Math.random() * 10
        },
        verification: {
            isValid: Math.random() > 0.2,
            confidenceScore: Math.random()
        }
    }))
});

export const generateMockCommunityData = (playerCount = 20, teamCount = 5) => {
    const teams = {};
    const players = [];

    // Generate teams
    for (let i = 0; i < teamCount; i++) {
        teams[`team${i}`] = {
            id: `team${i}`,
            name: `Team ${i}`,
            avatar: `team${i}.jpg`,
            members: [],
            totalImpact: {
                carbonOffset: Math.random() * 5000,
                waterRetention: Math.random() * 50000,
                biodiversityScore: Math.random() * 5000
            },
            totalActions: Math.floor(Math.random() * 1000)
        };
    }

    // Generate players
    for (let i = 0; i < playerCount; i++) {
        const teamId = `team${Math.floor(Math.random() * teamCount)}`;
        const player = {
            id: `player${i}`,
            name: `Player ${i}`,
            avatar: `avatar${i}.jpg`,
            team: teamId,
            impact: {
                carbonOffset: Math.random() * 250,
                waterRetention: Math.random() * 2500,
                biodiversityScore: Math.random() * 250
            },
            actionCount: Math.floor(Math.random() * 50),
            verifiedActions: Math.floor(Math.random() * 40)
        };
        
        players.push(player);
        teams[teamId].members.push(player);
    }

    return {
        teams,
        players,
        globalStats: {
            carbonOffset: Object.values(teams).reduce((sum, team) => 
                sum + team.totalImpact.carbonOffset, 0),
            waterRetention: Object.values(teams).reduce((sum, team) => 
                sum + team.totalImpact.waterRetention, 0),
            biodiversityScore: Object.values(teams).reduce((sum, team) => 
                sum + team.totalImpact.biodiversityScore, 0),
            activeParticipants: playerCount
        }
    };
};

// Custom render with common providers
export const renderWithProviders = (ui, { initialState = {}, ...options } = {}) => {
    const Wrapper = ({ children }) => {
        return children;
    };

    return render(ui, { wrapper: Wrapper, ...options });
};

// Custom matchers
export const toHaveCorrectProgressWidth = (received, expectedPercentage) => {
    const style = window.getComputedStyle(received);
    const actualWidth = parseFloat(style.width);
    const expectedWidth = `${expectedPercentage}%`;
    
    return {
        pass: actualWidth === parseFloat(expectedWidth),
        message: () => `Expected progress width to be ${expectedWidth} but got ${actualWidth}%`
    };
};

// Mock blockchain interactions
export const mockBlockchainTransactions = {
    verifyAction: jest.fn().mockResolvedValue({ success: true, hash: '0x123...' }),
    mintReward: jest.fn().mockResolvedValue({ success: true, tokenId: '1' }),
    getVerificationStatus: jest.fn().mockResolvedValue({ isValid: true, score: 0.95 })
};

// Test data validation
export const validateImpactData = (data) => {
    const requiredFields = ['timestamp', 'metrics', 'verification'];
    const requiredMetrics = ['carbon', 'water', 'biodiversity', 'energy'];
    
    return data.every(item => 
        requiredFields.every(field => field in item) &&
        requiredMetrics.every(metric => metric in item.metrics) &&
        'isValid' in item.verification &&
        'confidenceScore' in item.verification
    );
};

// Animation testing helpers
export const waitForAnimation = (element) => {
    return new Promise(resolve => {
        const observer = new MutationObserver((mutations) => {
            const animationFinished = mutations.some(mutation => 
                mutation.attributeName === 'class' && 
                !element.classList.contains('animating')
            );
            if (animationFinished) {
                observer.disconnect();
                resolve();
            }
        });
        
        observer.observe(element, { 
            attributes: true,
            attributeFilter: ['class']
        });
    });
};
