import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImpactVisualization from '../ImpactVisualization';

// Mock Recharts components
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    Line: () => <div data-testid="line" />,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
}));

describe('ImpactVisualization', () => {
    const mockImpactData = [
        {
            timestamp: '2024-01-15T10:00:00Z',
            metrics: {
                carbon: 25.5,
                water: 500,
                biodiversity: 15,
                energy: 10
            }
        },
        {
            timestamp: '2024-01-15T11:00:00Z',
            metrics: {
                carbon: 30.2,
                water: 600,
                biodiversity: 18,
                energy: 12
            }
        }
    ];

    const mockHandlers = {
        onTimeframeChange: jest.fn(),
        onMetricSelect: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all metric buttons', () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        expect(screen.getByText('Carbon Offset')).toBeInTheDocument();
        expect(screen.getByText('Water Saved')).toBeInTheDocument();
        expect(screen.getByText('Biodiversity Score')).toBeInTheDocument();
        expect(screen.getByText('Renewable Energy')).toBeInTheDocument();
    });

    it('changes active metric when button is clicked', () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByText('Water Saved'));
        expect(mockHandlers.onMetricSelect).toHaveBeenCalledWith('water');
    });

    it('changes timeframe when selector is changed', () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '30d' } });
        expect(mockHandlers.onTimeframeChange).toHaveBeenCalledWith('30d');
    });

    it('switches between chart types', async () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        // Default is area chart
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();

        // Switch to line chart
        fireEvent.click(screen.getByTitle('Line Chart'));
        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });

        // Switch to bar chart
        fireEvent.click(screen.getByTitle('Bar Chart'));
        await waitFor(() => {
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });

    it('displays impact summary with correct values', () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        expect(screen.getByText('Total Impact')).toBeInTheDocument();
        expect(screen.getByText('Average per Day')).toBeInTheDocument();
    });

    it('processes data correctly for different timeframes', () => {
        const { rerender } = render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="24h"
                {...mockHandlers}
            />
        );

        // Test 24h view
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();

        // Test 7d view
        rerender(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();

        // Test 30d view
        rerender(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="30d"
                {...mockHandlers}
            />
        );
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles empty impact data gracefully', () => {
        render(
            <ImpactVisualization
                impactData={[]}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByText('0.0 kg CO₂')).toBeInTheDocument();
    });

    it('formats values correctly for different metrics', () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        // Test carbon format
        expect(screen.getByText(/kg CO₂/)).toBeInTheDocument();

        // Switch to water metric
        fireEvent.click(screen.getByText('Water Saved'));
        expect(screen.getByText(/L/)).toBeInTheDocument();

        // Switch to biodiversity metric
        fireEvent.click(screen.getByText('Biodiversity Score'));
        expect(screen.getByText(/points/)).toBeInTheDocument();
    });

    it('maintains chart state when data updates', async () => {
        const { rerender } = render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        // Switch to line chart
        fireEvent.click(screen.getByTitle('Line Chart'));
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();

        // Update data
        const newData = [...mockImpactData, {
            timestamp: '2024-01-15T12:00:00Z',
            metrics: {
                carbon: 35.8,
                water: 700,
                biodiversity: 20,
                energy: 15
            }
        }];

        rerender(
            <ImpactVisualization
                impactData={newData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        // Chart type should remain as line
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders custom tooltip correctly', () => {
        render(
            <ImpactVisualization
                impactData={mockImpactData}
                timeframe="7d"
                {...mockHandlers}
            />
        );

        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
});
