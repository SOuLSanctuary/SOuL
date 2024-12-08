import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardPanel from '../LeaderboardPanel';

const mockCommunityData = {
    players: [
        {
            id: '1',
            name: 'Test User 1',
            avatar: '/avatar1.png',
            metrics: {
                carbon: 100.5,
                water: 200.3
            },
            verificationRate: 85.5,
            recentActions: 10
        },
        {
            id: '2',
            name: 'Test User 2',
            avatar: '/avatar2.png',
            metrics: {
                carbon: 90.2,
                water: 180.1
            },
            verificationRate: 75.0,
            recentActions: 8
        }
    ],
    teams: [
        {
            id: 't1',
            name: 'Team Alpha',
            avatar: '/team1.png',
            members: ['1', '2', '3'],
            metrics: {
                carbon: 300.7,
                water: 600.4
            },
            verificationRate: 80.0,
            recentActions: 25
        }
    ],
    totalCarbonOffset: 1000.5,
    totalWaterSaved: 2000.3,
    activeParticipants: 50
};

describe('LeaderboardPanel', () => {
    it('renders global impact stats correctly', () => {
        render(<LeaderboardPanel communityData={mockCommunityData} />);
        
        expect(screen.getByText('1000.5 kg')).toBeInTheDocument();
        expect(screen.getByText('2000.3 L')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('renders individual leaderboard entries correctly', () => {
        render(<LeaderboardPanel communityData={mockCommunityData} />);
        
        expect(screen.getByText('Test User 1')).toBeInTheDocument();
        expect(screen.getByText('100.5 kg')).toBeInTheDocument();
        expect(screen.getByText('85.5% verified')).toBeInTheDocument();
        expect(screen.getByText('10 recent actions')).toBeInTheDocument();
    });

    it('switches to team view correctly', async () => {
        render(<LeaderboardPanel communityData={mockCommunityData} />);
        
        const teamTab = screen.getByText('Team');
        fireEvent.click(teamTab);
        
        await waitFor(() => {
            expect(screen.getByText('Team Alpha')).toBeInTheDocument();
            expect(screen.getByText('3 members')).toBeInTheDocument();
            expect(screen.getByText('300.7 kg')).toBeInTheDocument();
            expect(screen.getByText('80.0% team avg')).toBeInTheDocument();
            expect(screen.getByText('25 recent actions')).toBeInTheDocument();
        });
    });

    it('changes metric category correctly', async () => {
        render(<LeaderboardPanel communityData={mockCommunityData} />);
        
        const waterButton = screen.getByText('Water Saved');
        fireEvent.click(waterButton);
        
        await waitFor(() => {
            expect(screen.getByText('200.3 L')).toBeInTheDocument();
        });
    });

    it('updates leaderboard when timeframe changes', async () => {
        render(<LeaderboardPanel communityData={mockCommunityData} />);

        const timeframeSelect = screen.getByRole('combobox');
        fireEvent.change(timeframeSelect, { target: { value: '30' } });
        
        await waitFor(() => {
            expect(timeframeSelect.value).toBe('30');
        });
    });

    it('handles empty community data gracefully', () => {
        render(<LeaderboardPanel communityData={null} />);
        expect(screen.getByText('No data available')).toBeInTheDocument();
    });
});
