import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RewardsPanel from '../RewardsPanel';
import { useImpactCalculator } from '../../../hooks/useImpactCalculator';

// Mock the hooks
jest.mock('../../../hooks/useImpactCalculator');

describe('RewardsPanel', () => {
    const mockPlayerStats = {
        actionCounts: {
            TREE_PLANTING: 5,
            WATER_CONSERVATION: 3
        },
        totalImpact: {
            carbonOffset: 75.5,
            waterRetention: 850.25,
            biodiversityScore: 35.5
        },
        recentActions: [
            {
                id: '1',
                timestamp: '2024-01-15T10:30:00Z',
                impact: {
                    carbonOffset: 22.5,
                    waterRetention: 100.0,
                    biodiversityScore: 15.0
                },
                verification: {
                    isValid: true,
                    confidenceScore: 0.95
                }
            },
            {
                id: '2',
                timestamp: '2024-01-14T15:45:00Z',
                impact: {
                    carbonOffset: 18.2,
                    waterRetention: 80.5,
                    biodiversityScore: 12.5
                },
                verification: {
                    isValid: false,
                    confidenceScore: 0.45
                }
            }
        ]
    };

    const mockRewardBreakdown = {
        amount: 150,
        breakdown: {
            base: 100,
            consistency: 20,
            quality: 15,
            teamwork: 15
        },
        multipliers: {
            consistency: 1.2,
            quality: 1.15,
            teamwork: 1.15
        }
    };

    beforeEach(() => {
        useImpactCalculator.mockImplementation(() => ({
            getRewardBreakdown: jest.fn().mockReturnValue(mockRewardBreakdown)
        }));
    });

    it('renders rewards summary correctly', () => {
        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        expect(screen.getByText('Rewards & Achievements')).toBeInTheDocument();
        expect(screen.getByText('Total Rewards')).toBeInTheDocument();
        expect(screen.getByText('Pending Verification')).toBeInTheDocument();
    });

    it('displays achievements with correct progress', () => {
        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        // Forest Guardian Achievement
        expect(screen.getByText('Forest Guardian')).toBeInTheDocument();
        expect(screen.getByText('5 / 10')).toBeInTheDocument();
        
        // Carbon Crusher Achievement
        expect(screen.getByText('Carbon Crusher')).toBeInTheDocument();
        expect(screen.getByText('75.5 / 100')).toBeInTheDocument();
    });

    it('marks achievements as completed when target is reached', () => {
        const completedStats = {
            ...mockPlayerStats,
            actionCounts: {
                ...mockPlayerStats.actionCounts,
                TREE_PLANTING: 15
            }
        };

        render(<RewardsPanel playerStats={completedStats} />);
        
        const achievementCard = screen.getByText('Forest Guardian')
            .closest('.achievement-card');
        expect(achievementCard).toHaveClass('completed');
    });

    it('displays recent rewards with verification status', () => {
        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        expect(screen.getByText('✓ Verified')).toBeInTheDocument();
        expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
    });

    it('shows reward breakdowns correctly', () => {
        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        // Check breakdown categories
        expect(screen.getByText('base')).toBeInTheDocument();
        expect(screen.getByText('consistency')).toBeInTheDocument();
        expect(screen.getByText('quality')).toBeInTheDocument();
        expect(screen.getByText('teamwork')).toBeInTheDocument();

        // Check breakdown values
        expect(screen.getByText('+100.0')).toBeInTheDocument();
        expect(screen.getByText('+20.0')).toBeInTheDocument();
        expect(screen.getByText('+15.0')).toBeInTheDocument();
    });

    it('displays multipliers for rewards', () => {
        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        expect(screen.getByText('consistency: 1.20x')).toBeInTheDocument();
        expect(screen.getByText('quality: 1.15x')).toBeInTheDocument();
        expect(screen.getByText('teamwork: 1.15x')).toBeInTheDocument();
    });

    it('handles empty player stats gracefully', () => {
        render(<RewardsPanel playerStats={{}} />);
        
        expect(screen.getByText('Rewards & Achievements')).toBeInTheDocument();
        expect(screen.getByText('0 / 10')).toBeInTheDocument();
        expect(screen.getByText('0 / 100')).toBeInTheDocument();
    });

    it('updates when player stats change', async () => {
        const { rerender } = render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        const updatedStats = {
            ...mockPlayerStats,
            actionCounts: {
                ...mockPlayerStats.actionCounts,
                TREE_PLANTING: 8
            }
        };

        rerender(<RewardsPanel playerStats={updatedStats} />);
        
        await waitFor(() => {
            expect(screen.getByText('8 / 10')).toBeInTheDocument();
        });
    });

    it('calculates total rewards correctly', () => {
        useImpactCalculator.mockImplementation(() => ({
            getRewardBreakdown: jest.fn().mockReturnValue({
                ...mockRewardBreakdown,
                amount: 100
            })
        }));

        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        // Only verified rewards should be included in total
        expect(screen.getByText('🏆 100')).toBeInTheDocument();
    });

    it('shows pending rewards separately', () => {
        useImpactCalculator.mockImplementation(() => ({
            getRewardBreakdown: jest.fn().mockReturnValue({
                ...mockRewardBreakdown,
                amount: 50
            })
        }));

        render(<RewardsPanel playerStats={mockPlayerStats} />);
        
        expect(screen.getByText('⏳ 50')).toBeInTheDocument();
    });
});
