import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useWallet } from '@solana/wallet-adapter-react';
import Team from '../Team';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
    useWallet: jest.fn()
}));

// Mock game state manager
const mockGameStateManager = {
    getTeamData: jest.fn(),
    createTeam: jest.fn(),
    inviteToTeam: jest.fn(),
    leaveTeam: jest.fn()
};

const mockTeamData = {
    id: '123',
    name: 'Eco Warriors',
    description: 'Fighting for a better planet',
    members: [
        {
            address: 'wallet123',
            username: 'EcoWarrior1',
            role: 'Leader',
            avatar: '🌟',
            contribution: 1000
        }
    ],
    isLeader: true,
    totalImpact: 5000,
    rank: 1,
    challenges: [
        {
            id: 'challenge1',
            title: 'Plant 100 Trees',
            description: 'Plant trees in your local area',
            status: 'ACTIVE',
            progress: 50,
            target: 100,
            rewards: ['500 XP', '100 Tokens']
        }
    ],
    achievements: [
        {
            id: 'achievement1',
            name: 'First Steps',
            description: 'Complete your first mission',
            icon: '🎯',
            unlocked: true,
            unlockedAt: new Date().toISOString()
        }
    ]
};

describe('Team Component', () => {
    beforeEach(() => {
        useWallet.mockReturnValue({
            publicKey: { toString: () => 'mock-wallet-address' }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockGameStateManager.getTeamData.mockImplementation(() => new Promise(() => {}));
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        expect(screen.getByText('Loading team data...')).toBeInTheDocument();
    });

    it('renders team data when loaded', async () => {
        mockGameStateManager.getTeamData.mockResolvedValue(mockTeamData);
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Eco Warriors')).toBeInTheDocument();
            expect(screen.getByText('Fighting for a better planet')).toBeInTheDocument();
        });
    });

    it('handles team creation', async () => {
        mockGameStateManager.getTeamData.mockResolvedValue(null);
        mockGameStateManager.createTeam.mockResolvedValue(true);
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Create a New Team')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Enter team name'), {
            target: { value: 'New Team' }
        });
        
        fireEvent.change(screen.getByPlaceholderText("Describe your team's mission"), {
            target: { value: 'Team Description' }
        });
        
        fireEvent.submit(screen.getByRole('button', { name: 'Create Team' }));
        
        await waitFor(() => {
            expect(mockGameStateManager.createTeam).toHaveBeenCalledWith({
                name: 'New Team',
                description: 'Team Description',
                leader: 'mock-wallet-address'
            });
        });
    });

    it('handles member invitation', async () => {
        mockGameStateManager.getTeamData.mockResolvedValue(mockTeamData);
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter wallet address to invite')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Enter wallet address to invite'), {
            target: { value: 'new-member-address' }
        });
        
        fireEvent.submit(screen.getByText('Invite Member'));
        
        await waitFor(() => {
            expect(mockGameStateManager.inviteToTeam).toHaveBeenCalledWith(
                mockTeamData.id,
                'new-member-address'
            );
        });
    });

    it('handles leaving team', async () => {
        const nonLeaderTeamData = { ...mockTeamData, isLeader: false };
        mockGameStateManager.getTeamData.mockResolvedValue(nonLeaderTeamData);
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Leave Team')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Leave Team'));
        
        await waitFor(() => {
            expect(mockGameStateManager.leaveTeam).toHaveBeenCalledWith(mockTeamData.id);
        });
    });

    it('displays error state when team data fails to load', async () => {
        mockGameStateManager.getTeamData.mockRejectedValue(new Error('Failed to load'));
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Failed to load team data. Please try again.')).toBeInTheDocument();
        });
    });

    it('switches between tabs correctly', async () => {
        mockGameStateManager.getTeamData.mockResolvedValue(mockTeamData);
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Challenges')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Challenges'));
        expect(screen.getByText('Plant 100 Trees')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Achievements'));
        expect(screen.getByText('First Steps')).toBeInTheDocument();
    });

    it('displays team statistics correctly', async () => {
        mockGameStateManager.getTeamData.mockResolvedValue(mockTeamData);
        
        render(<Team gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('5000')).toBeInTheDocument(); // Total Impact
            expect(screen.getByText('#1')).toBeInTheDocument(); // Rank
            expect(screen.getByText('1')).toBeInTheDocument(); // Members count
        });
    });
});
