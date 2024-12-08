import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useWallet } from '@solana/wallet-adapter-react';
import Profile from '../Profile';

jest.mock('@solana/wallet-adapter-react', () => ({
    useWallet: jest.fn()
}));

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
    Chart: () => null
}));

const mockGameStateManager = {
    getPlayerProfile: jest.fn()
};

const mockPlayerData = {
    username: 'EcoWarrior',
    title: 'Master Guardian',
    level: 10,
    experience: 8500,
    avatar: '🌳',
    impactScore: 1500,
    collectibles: new Array(15),
    questsCompleted: 25,
    teamContributions: 750,
    achievements: [
        {
            id: 'ach1',
            name: 'First Steps',
            description: 'Complete your first environmental mission',
            icon: '🎯',
            completed: true,
            progress: 1,
            target: 1
        },
        {
            id: 'ach2',
            name: 'Tree Hugger',
            description: 'Plant 100 trees',
            icon: '🌲',
            completed: false,
            progress: 75,
            target: 100
        }
    ],
    impact: {
        carbonOffset: 1000,
        waterSaved: 5000,
        energySaved: 750
    }
};

describe('Profile Component', () => {
    beforeEach(() => {
        useWallet.mockReturnValue({
            publicKey: { toString: () => 'mock-wallet-address' }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockGameStateManager.getPlayerProfile.mockImplementation(() => new Promise(() => {}));
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('renders player profile data when loaded', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('EcoWarrior')).toBeInTheDocument();
            expect(screen.getByText('Master Guardian')).toBeInTheDocument();
            expect(screen.getByText('Level 10')).toBeInTheDocument();
        });
    });

    it('calculates and displays experience progress correctly', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('8500 / 10000 XP')).toBeInTheDocument();
        });
    });

    it('displays all profile statistics correctly', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('1500')).toBeInTheDocument(); // Impact Score
            expect(screen.getByText('15')).toBeInTheDocument(); // Collectibles
            expect(screen.getByText('25')).toBeInTheDocument(); // Quests
            expect(screen.getByText('750')).toBeInTheDocument(); // Team Contributions
        });
    });

    it('switches between tabs correctly', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Achievements')).toBeInTheDocument();
        });

        // Switch to Achievements tab
        fireEvent.click(screen.getByText('Achievements'));
        expect(screen.getByText('First Steps')).toBeInTheDocument();
        expect(screen.getByText('Tree Hugger')).toBeInTheDocument();

        // Switch to Environmental Impact tab
        fireEvent.click(screen.getByText('Environmental Impact'));
        expect(screen.getByText('Carbon Offset')).toBeInTheDocument();
        expect(screen.getByText('1000 kg CO2')).toBeInTheDocument();
    });

    it('displays achievement progress correctly', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        // Switch to Achievements tab
        fireEvent.click(screen.getByText('Achievements'));
        
        await waitFor(() => {
            // Check completed achievement
            expect(screen.getByText('First Steps')).toBeInTheDocument();
            
            // Check in-progress achievement
            const treeHugger = screen.getByText('Tree Hugger');
            expect(treeHugger).toBeInTheDocument();
            expect(screen.getByText('75 / 100')).toBeInTheDocument();
        });
    });

    it('displays environmental impact metrics correctly', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        // Switch to Environmental Impact tab
        fireEvent.click(screen.getByText('Environmental Impact'));
        
        await waitFor(() => {
            expect(screen.getByText('1000 kg CO2')).toBeInTheDocument();
            expect(screen.getByText('5000 liters')).toBeInTheDocument();
            expect(screen.getByText('750 kWh')).toBeInTheDocument();
        });
    });

    it('handles error state when profile fails to load', async () => {
        mockGameStateManager.getPlayerProfile.mockRejectedValue(new Error('Failed to load'));
        
        render(<Profile gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Failed to load profile data. Please try again.')).toBeInTheDocument();
        });

        // Test retry functionality
        fireEvent.click(screen.getByText('Try Again'));
        expect(mockGameStateManager.getPlayerProfile).toHaveBeenCalledTimes(2);
    });

    it('updates profile data when wallet changes', async () => {
        mockGameStateManager.getPlayerProfile.mockResolvedValue(mockPlayerData);
        
        const { rerender } = render(<Profile gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(mockGameStateManager.getPlayerProfile).toHaveBeenCalledWith('mock-wallet-address');
        });

        // Change wallet
        useWallet.mockReturnValue({
            publicKey: { toString: () => 'new-wallet-address' }
        });

        rerender(<Profile gameStateManager={mockGameStateManager} />);

        await waitFor(() => {
            expect(mockGameStateManager.getPlayerProfile).toHaveBeenCalledWith('new-wallet-address');
        });
    });
});
