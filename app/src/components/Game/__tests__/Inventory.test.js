import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useWallet } from '@solana/wallet-adapter-react';
import Inventory from '../Inventory';

jest.mock('@solana/wallet-adapter-react', () => ({
    useWallet: jest.fn()
}));

const mockGameStateManager = {
    getPlayerInventory: jest.fn(),
    useItem: jest.fn(),
    combineItems: jest.fn()
};

const mockInventoryData = [
    {
        id: 'item1',
        name: 'Seed Packet',
        description: 'Plant rare trees',
        category: 'SEEDS',
        rarity: 'RARE',
        power: 100,
        usable: true,
        combinable: false,
        attributes: {
            'Growth Rate': 'Fast',
            'Success Rate': '95%'
        }
    },
    {
        id: 'item2',
        name: 'Environmental Sensor',
        description: 'Monitor air quality',
        category: 'SENSORS',
        rarity: 'EPIC',
        power: 250,
        usable: true,
        combinable: true,
        attributes: {
            'Range': '500m',
            'Accuracy': 'High'
        }
    },
    {
        id: 'item3',
        name: 'Eco Badge',
        description: 'Proof of contribution',
        category: 'COLLECTIBLES',
        rarity: 'LEGENDARY',
        power: 500,
        usable: false,
        combinable: false,
        attributes: {
            'Edition': 'Limited',
            'Series': '2024'
        }
    }
];

describe('Inventory Component', () => {
    beforeEach(() => {
        useWallet.mockReturnValue({
            publicKey: { toString: () => 'mock-wallet-address' }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockGameStateManager.getPlayerInventory.mockImplementation(() => new Promise(() => {}));
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        expect(screen.getByText('Loading inventory...')).toBeInTheDocument();
    });

    it('renders inventory items when loaded', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Seed Packet')).toBeInTheDocument();
            expect(screen.getByText('Environmental Sensor')).toBeInTheDocument();
            expect(screen.getByText('Eco Badge')).toBeInTheDocument();
        });
    });

    it('filters items by category correctly', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('SEEDS')).toBeInTheDocument();
        });

        // Filter by SEEDS
        fireEvent.click(screen.getByText('SEEDS'));
        expect(screen.getByText('Seed Packet')).toBeInTheDocument();
        expect(screen.queryByText('Environmental Sensor')).not.toBeInTheDocument();

        // Filter by SENSORS
        fireEvent.click(screen.getByText('SENSORS'));
        expect(screen.queryByText('Seed Packet')).not.toBeInTheDocument();
        expect(screen.getByText('Environmental Sensor')).toBeInTheDocument();
    });

    it('sorts items correctly', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        // Sort by power
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'power' } });
        const items = screen.getAllByRole('heading', { level: 3 });
        expect(items[0]).toHaveTextContent('Eco Badge'); // Highest power
        expect(items[2]).toHaveTextContent('Seed Packet'); // Lowest power
    });

    it('searches items correctly', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
        });

        // Search for "sensor"
        fireEvent.change(screen.getByPlaceholderText('Search items...'), {
            target: { value: 'sensor' }
        });
        
        expect(screen.getByText('Environmental Sensor')).toBeInTheDocument();
        expect(screen.queryByText('Seed Packet')).not.toBeInTheDocument();
        expect(screen.queryByText('Eco Badge')).not.toBeInTheDocument();
    });

    it('handles item selection and details modal', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Seed Packet')).toBeInTheDocument();
        });

        // Click on an item
        fireEvent.click(screen.getByText('Seed Packet'));
        
        // Check modal content
        expect(screen.getByText('Plant rare trees')).toBeInTheDocument();
        expect(screen.getByText('Growth Rate: Fast')).toBeInTheDocument();
        expect(screen.getByText('Success Rate: 95%')).toBeInTheDocument();
    });

    it('handles item usage correctly', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        mockGameStateManager.useItem.mockResolvedValue(true);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Seed Packet')).toBeInTheDocument();
        });

        // Select and use item
        fireEvent.click(screen.getByText('Seed Packet'));
        fireEvent.click(screen.getByText('Use Item'));
        
        await waitFor(() => {
            expect(mockGameStateManager.useItem).toHaveBeenCalledWith('item1');
        });
    });

    it('handles item combination correctly', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        mockGameStateManager.combineItems.mockResolvedValue(true);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Environmental Sensor')).toBeInTheDocument();
        });

        // Select combinable item
        fireEvent.click(screen.getByText('Environmental Sensor'));
        fireEvent.click(screen.getByText('Combine'));
        
        // Verify combine functionality was called
        expect(mockGameStateManager.combineItems).toHaveBeenCalled();
    });

    it('displays error state when inventory fails to load', async () => {
        mockGameStateManager.getPlayerInventory.mockRejectedValue(new Error('Failed to load'));
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Failed to load inventory. Please try again.')).toBeInTheDocument();
        });

        // Test retry functionality
        fireEvent.click(screen.getByText('Try Again'));
        expect(mockGameStateManager.getPlayerInventory).toHaveBeenCalledTimes(2);
    });

    it('displays inventory summary correctly', async () => {
        mockGameStateManager.getPlayerInventory.mockResolvedValue(mockInventoryData);
        
        render(<Inventory gameStateManager={mockGameStateManager} />);
        
        await waitFor(() => {
            expect(screen.getByText('Total Items')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument(); // Total items count
            expect(screen.getByText('LEGENDARY')).toBeInTheDocument(); // Rarest item
            expect(screen.getByText('850')).toBeInTheDocument(); // Total power
        });
    });
});
