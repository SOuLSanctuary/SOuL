import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnvironmentalDashboard from '../EnvironmentalDashboard';
import { useImpactCalculator } from '../../../hooks/useImpactCalculator';
import { useEnvironmentalVerification } from '../../../hooks/useEnvironmentalVerification';

// Mock the hooks
jest.mock('../../../hooks/useImpactCalculator');
jest.mock('../../../hooks/useEnvironmentalVerification');

describe('EnvironmentalDashboard', () => {
    // Mock data
    const mockImpactData = {
        carbonOffset: 150.5,
        waterRetention: 2500.75,
        biodiversityScore: 85.3,
        renewableEnergy: 450.2
    };

    const mockRecentActions = [
        {
            type: 'TREE_PLANTING',
            timestamp: new Date('2024-01-15').toISOString(),
            impact: {
                carbonOffset: 22.5,
                waterRetention: 100.0
            },
            verification: {
                isValid: true,
                confidenceScore: 0.95
            }
        },
        {
            type: 'WATER_CONSERVATION',
            timestamp: new Date('2024-01-14').toISOString(),
            impact: {
                carbonOffset: 5.2,
                waterRetention: 500.0
            },
            verification: {
                isValid: false,
                confidenceScore: 0.45
            }
        }
    ];

    // Default mock implementations
    const mockGetHistoricalImpact = jest.fn();
    const mockCalculateActionImpact = jest.fn();
    const mockVerifyAction = jest.fn();

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock implementations
        useImpactCalculator.mockImplementation(() => ({
            getHistoricalImpact: mockGetHistoricalImpact,
            calculateActionImpact: mockCalculateActionImpact,
            isCalculating: false,
            lastImpact: null,
            error: null
        }));

        useEnvironmentalVerification.mockImplementation(() => ({
            verifyAction: mockVerifyAction
        }));

        // Setup successful responses
        mockGetHistoricalImpact.mockResolvedValue(mockImpactData);
    });

    it('renders dashboard header and timeframe selector', () => {
        render(<EnvironmentalDashboard />);
        
        expect(screen.getByText('Environmental Impact Dashboard')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    });

    it('shows loading state while fetching data', () => {
        useImpactCalculator.mockImplementation(() => ({
            ...jest.requireActual('../../../hooks/useImpactCalculator'),
            getHistoricalImpact: jest.fn(() => new Promise(() => {})),
            isCalculating: true
        }));

        render(<EnvironmentalDashboard />);
        
        expect(screen.getByText('Loading impact data...')).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('displays error message when data fetching fails', async () => {
        const errorMessage = 'Failed to load impact data';
        mockGetHistoricalImpact.mockRejectedValue(new Error(errorMessage));

        render(<EnvironmentalDashboard />);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });
    });

    it('allows retry when data loading fails', async () => {
        mockGetHistoricalImpact
            .mockRejectedValueOnce(new Error('Failed to load impact data'))
            .mockResolvedValueOnce(mockImpactData);

        render(<EnvironmentalDashboard />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /retry/i }));

        await waitFor(() => {
            expect(screen.getByText(mockImpactData.carbonOffset.toFixed(2))).toBeInTheDocument();
        });
    });

    it('updates data when timeframe changes', async () => {
        render(<EnvironmentalDashboard />);

        const timeframeSelect = screen.getByRole('combobox');
        await act(async () => {
            userEvent.selectOptions(timeframeSelect, '30d');
        });

        expect(mockGetHistoricalImpact).toHaveBeenCalledWith('30d');
    });

    it('displays impact cards with correct formatting', async () => {
        render(<EnvironmentalDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Carbon Impact')).toBeInTheDocument();
            expect(screen.getByText('Water Conservation')).toBeInTheDocument();
            expect(screen.getByText('Biodiversity Score')).toBeInTheDocument();
        });

        // Check if values are properly formatted
        expect(screen.getByText(`${mockImpactData.carbonOffset.toFixed(2)} carbonOffset`)).toBeInTheDocument();
        expect(screen.getByText(`${mockImpactData.waterRetention.toFixed(2)} waterRetention`)).toBeInTheDocument();
    });

    it('displays recent actions with correct verification status', async () => {
        useImpactCalculator.mockImplementation(() => ({
            ...jest.requireActual('../../../hooks/useImpactCalculator'),
            getHistoricalImpact: mockGetHistoricalImpact,
            recentActions: mockRecentActions
        }));

        render(<EnvironmentalDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Recent Environmental Actions')).toBeInTheDocument();
            expect(screen.getByText('TREE_PLANTING')).toBeInTheDocument();
            expect(screen.getByText('WATER_CONSERVATION')).toBeInTheDocument();
        });

        // Check verification status
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Pending Verification')).toBeInTheDocument();
    });

    it('shows correct trend indicators', async () => {
        const mockPreviousImpact = {
            carbonOffset: 100.0,
            waterRetention: 3000.0,
            biodiversityScore: 80.0
        };

        useImpactCalculator.mockImplementation(() => ({
            ...jest.requireActual('../../../hooks/useImpactCalculator'),
            getHistoricalImpact: mockGetHistoricalImpact,
            previousWeekImpact: mockPreviousImpact
        }));

        render(<EnvironmentalDashboard />);

        await waitFor(() => {
            const trendIndicators = screen.getAllByTestId('trend-indicator');
            expect(trendIndicators[0]).toHaveClass('positive'); // Carbon increased
            expect(trendIndicators[1]).toHaveClass('negative'); // Water decreased
            expect(trendIndicators[2]).toHaveClass('positive'); // Biodiversity increased
        });
    });

    it('handles empty or null impact values gracefully', async () => {
        mockGetHistoricalImpact.mockResolvedValue({
            carbonOffset: null,
            waterRetention: undefined,
            biodiversityScore: 0
        });

        render(<EnvironmentalDashboard />);

        await waitFor(() => {
            expect(screen.getAllByText('N/A')).toHaveLength(2); // Null and undefined values
            expect(screen.getByText('0.00 biodiversityScore')).toBeInTheDocument(); // Zero value
        });
    });

    it('maintains responsive layout at different viewport sizes', async () => {
        const { container } = render(<EnvironmentalDashboard />);

        // Test mobile layout
        window.innerWidth = 375;
        fireEvent(window, new Event('resize'));
        expect(container.querySelector('.impact-summary')).toHaveStyle({
            'grid-template-columns': '1fr'
        });

        // Test desktop layout
        window.innerWidth = 1024;
        fireEvent(window, new Event('resize'));
        expect(container.querySelector('.impact-summary')).toHaveStyle({
            'grid-template-columns': 'repeat(auto-fit, minmax(300px, 1fr))'
        });
    });
});
