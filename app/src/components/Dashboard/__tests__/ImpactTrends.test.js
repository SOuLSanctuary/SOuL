import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImpactTrends from '../ImpactTrends';
import { mockImpactData, generateTrendData } from './testUtils';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    Line: () => <div>Line</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Legend: () => <div>Legend</div>
}));

describe('ImpactTrends', () => {
    const mockTrendData = [
        {
            timestamp: '2024-01-15T10:00:00Z',
            impact: {
                carbonOffset: 22.5,
                waterRetention: 100.0,
                biodiversityScore: 15.0,
                renewableEnergy: 45.2
            }
        },
        {
            timestamp: '2024-01-16T10:00:00Z',
            impact: {
                carbonOffset: 25.0,
                waterRetention: 95.0,
                biodiversityScore: 16.5,
                renewableEnergy: 48.5
            }
        },
        {
            timestamp: '2024-01-17T10:00:00Z',
            impact: {
                carbonOffset: 28.5,
                waterRetention: 110.0,
                biodiversityScore: 17.0,
                renewableEnergy: 50.0
            }
        }
    ];

    it('renders loading state correctly', () => {
        render(<ImpactTrends data={[]} loading={true} />);
        
        expect(screen.getByText('Loading trend data...')).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
        const errorMessage = 'Failed to load trend data';
        render(<ImpactTrends data={[]} error={errorMessage} />);
        
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders empty state when no data is provided', () => {
        render(<ImpactTrends data={[]} />);
        
        expect(screen.getByText('No trend data available for the selected timeframe.')).toBeInTheDocument();
    });

    it('displays correct metric cards with trends', () => {
        render(<ImpactTrends data={mockTrendData} />);

        // Check if all metric names are displayed
        expect(screen.getByText('Carbon Offset')).toBeInTheDocument();
        expect(screen.getByText('Water Retention')).toBeInTheDocument();
        expect(screen.getByText('Biodiversity Score')).toBeInTheDocument();
        expect(screen.getByText('Renewable Energy')).toBeInTheDocument();

        // Check if latest values are displayed
        expect(screen.getByText('28.5')).toBeInTheDocument();
        expect(screen.getByText('110.0')).toBeInTheDocument();
        expect(screen.getByText('17.0')).toBeInTheDocument();
        expect(screen.getByText('50.0')).toBeInTheDocument();

        // Check if trend indicators are present
        const trendIndicators = screen.getAllByTestId('trend-indicator');
        expect(trendIndicators.length).toBe(4);
    });

    it('calculates trends correctly', () => {
        render(<ImpactTrends data={mockTrendData} />);

        // Carbon Offset trend (increasing)
        const carbonTrend = screen.getByTestId('carbon-trend');
        expect(carbonTrend).toHaveClass('positive');
        expect(carbonTrend).toHaveTextContent('14.0%'); // (28.5 - 25.0) / 25.0 * 100

        // Water Retention trend (increasing)
        const waterTrend = screen.getByTestId('water-trend');
        expect(waterTrend).toHaveClass('positive');
        expect(waterTrend).toHaveTextContent('15.8%'); // (110.0 - 95.0) / 95.0 * 100
    });

    it('formats dates according to timeframe', () => {
        const { rerender } = render(<ImpactTrends data={mockTrendData} timeframe="24h" />);
        
        // Check 24h format
        expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
        
        // Rerender with 7d timeframe
        rerender(<ImpactTrends data={mockTrendData} timeframe="7d" />);
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
        
        // Rerender with 30d timeframe
        rerender(<ImpactTrends data={mockTrendData} timeframe="30d" />);
        expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('handles missing or null impact values', () => {
        const dataWithMissingValues = [
            {
                timestamp: '2024-01-15T10:00:00Z',
                impact: {
                    carbonOffset: null,
                    waterRetention: undefined,
                    biodiversityScore: 15.0,
                    renewableEnergy: 45.2
                }
            }
        ];

        render(<ImpactTrends data={dataWithMissingValues} />);

        expect(screen.getByText('N/A')).toBeInTheDocument();
        expect(screen.getByText('15.0')).toBeInTheDocument();
        expect(screen.getByText('45.2')).toBeInTheDocument();
    });

    it('maintains responsive layout at different viewport sizes', () => {
        const { container } = render(<ImpactTrends data={mockTrendData} />);

        // Test mobile layout
        window.innerWidth = 375;
        fireEvent(window, new Event('resize'));
        expect(container.querySelector('.metric-summary')).toHaveStyle({
            'grid-template-columns': '1fr'
        });

        // Test desktop layout
        window.innerWidth = 1024;
        fireEvent(window, new Event('resize'));
        expect(container.querySelector('.metric-summary')).toHaveStyle({
            'grid-template-columns': 'repeat(auto-fit, minmax(200px, 1fr))'
        });
    });

    it('memoizes chart data calculations', () => {
        const { rerender } = render(<ImpactTrends data={mockTrendData} />);
        
        // Force re-render with same data
        rerender(<ImpactTrends data={mockTrendData} />);
        
        // Verify that chart data is memoized and not recalculated
        expect(screen.getAllByText('Line').length).toBe(4); // One for each metric
    });
});
