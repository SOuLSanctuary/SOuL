import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AchievementModal from '../AchievementModal';

describe('AchievementModal', () => {
    const mockAchievement = {
        id: 'eco_warrior_1',
        title: 'Eco Warrior',
        description: 'Reduce carbon emissions by 100kg',
        icon: '🌱',
        category: 'carbon',
        currentValue: 75,
        targetValue: 100,
        rewards: [
            { icon: '🏆', name: 'Trophy', value: 100 },
            { icon: '⭐', name: 'Bonus Points', value: 50 }
        ],
        nextMilestone: {
            name: 'Master Eco Warrior',
            requirement: 'Reduce carbon emissions by 200kg'
        }
    };

    const mockPlayerStats = {
        totalImpact: {
            carbonOffset: 75.5,
            waterRetention: 1500.0,
            biodiversityScore: 45.0
        },
        communityContributions: 25
    };

    const mockHandlers = {
        onClose: jest.fn(),
        onShare: jest.fn()
    };

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('renders achievement details correctly', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        expect(screen.getByText('Eco Warrior')).toBeInTheDocument();
        expect(screen.getByText('Reduce carbon emissions by 100kg')).toBeInTheDocument();
        expect(screen.getByText('75.0')).toBeInTheDocument();
        expect(screen.getByText('100.0')).toBeInTheDocument();
    });

    it('displays rewards section correctly', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        expect(screen.getByText('Rewards Earned')).toBeInTheDocument();
        expect(screen.getByText('Trophy')).toBeInTheDocument();
        expect(screen.getByText('Bonus Points')).toBeInTheDocument();
        expect(screen.getByText('+100')).toBeInTheDocument();
        expect(screen.getByText('+50')).toBeInTheDocument();
    });

    it('shows next milestone information', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        expect(screen.getByText('Next Milestone')).toBeInTheDocument();
        expect(screen.getByText('Master Eco Warrior')).toBeInTheDocument();
        expect(screen.getByText('Reduce carbon emissions by 200kg')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByLabelText('Close achievement modal'));
        
        // Wait for animation
        jest.advanceTimersByTime(300);
        
        expect(mockHandlers.onClose).toHaveBeenCalled();
    });

    it('calls onShare when share button is clicked', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByText('Share Achievement 🌍'));
        expect(mockHandlers.onShare).toHaveBeenCalledWith(mockAchievement);
    });

    it('displays impact metrics correctly', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        expect(screen.getByText('Your Impact')).toBeInTheDocument();
        expect(screen.getByText('75.5 kg CO₂')).toBeInTheDocument();
    });

    it('handles missing achievement data gracefully', () => {
        const { container } = render(
            <AchievementModal
                achievement={null}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('manages confetti animation timing', async () => {
        render(<AchievementModal isOpen={true} achievement={mockAchievement} onClose={mockHandlers.onClose} />);
        
        const confettiContainer = screen.getByTestId('confetti-container');
        expect(confettiContainer).toBeInTheDocument();

        // Wrap state updates in act
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // Wait for state updates to complete
        await waitFor(() => {
            expect(screen.queryByTestId('confetti-container')).not.toBeInTheDocument();
        });
    });

    it('handles animation states correctly', async () => {
        const { rerender } = render(
            <AchievementModal isOpen={true} achievement={mockAchievement} onClose={mockHandlers.onClose} />
        );

        const overlay = screen.getByTestId('achievement-modal-overlay');
        expect(overlay).toHaveClass('enter');

        // Trigger exit animation
        rerender(
            <AchievementModal isOpen={false} achievement={mockAchievement} onClose={mockHandlers.onClose} />
        );

        // Wait for exit class to be applied
        await waitFor(() => {
            expect(screen.getByTestId('achievement-modal-overlay')).toHaveClass('exit');
        }, { timeout: 1000 });
    });

    it('calculates progress percentage correctly', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        const progressBar = screen.getByTestId('progress-fill');
        expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('renders continue button with correct behavior', () => {
        render(
            <AchievementModal
                achievement={mockAchievement}
                playerStats={mockPlayerStats}
                isOpen={true}
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByText('Continue'));
        
        jest.advanceTimersByTime(300);
        expect(mockHandlers.onClose).toHaveBeenCalled();
    });
});
