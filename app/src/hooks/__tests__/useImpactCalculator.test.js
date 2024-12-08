import { renderHook, act } from '@testing-library/react-hooks';
import { useImpactCalculator, ImpactCalculatorProvider } from '../useImpactCalculator';
import { useWebSocket } from '../useWebSocket';
import { useEnvironmentalVerification } from '../useEnvironmentalVerification';

// Mock dependencies
jest.mock('../useWebSocket');
jest.mock('../useEnvironmentalVerification');

describe('useImpactCalculator', () => {
    const mockVerifyAction = jest.fn();
    const mockGetPlayerStats = jest.fn();
    const mockTrackEnvironmentalAction = jest.fn();

    beforeEach(() => {
        // Setup mock implementations
        useWebSocket.mockImplementation(() => ({
            getPlayerStats: mockGetPlayerStats,
            trackEnvironmentalAction: mockTrackEnvironmentalAction
        }));

        useEnvironmentalVerification.mockImplementation(() => ({
            verifyAction: mockVerifyAction
        }));

        // Reset mock functions
        mockVerifyAction.mockReset();
        mockGetPlayerStats.mockReset();
        mockTrackEnvironmentalAction.mockReset();
    });

    const wrapper = ({ children }) => (
        <ImpactCalculatorProvider>{children}</ImpactCalculatorProvider>
    );

    describe('calculateActionImpact', () => {
        const mockActionData = {
            type: 'TREE_PLANTING',
            quantity: 1,
            details: {
                weather: 'sunny',
                season: 'spring'
            },
            location: {
                latitude: 37.7749,
                longitude: -122.4194
            }
        };

        const mockPlayerStats = {
            actionHistory: [
                { timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000) }
            ],
            teamSize: 2
        };

        it('should calculate impact and rewards for valid action', async () => {
            mockVerifyAction.mockResolvedValue({ isValid: true, confidenceScore: 0.9 });
            mockGetPlayerStats.mockResolvedValue(mockPlayerStats);
            mockTrackEnvironmentalAction.mockResolvedValue(true);

            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            await act(async () => {
                const { impact, rewards } = await result.current.calculateActionImpact(mockActionData);

                expect(impact).toBeDefined();
                expect(impact.carbonOffset).toBeGreaterThan(0);
                expect(rewards).toBeDefined();
                expect(rewards.amount).toBeGreaterThan(0);
            });

            expect(result.current.error).toBeNull();
            expect(result.current.isCalculating).toBe(false);
        });

        it('should handle verification failure', async () => {
            mockVerifyAction.mockResolvedValue({ isValid: false, confidenceScore: 0.5 });

            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            await act(async () => {
                try {
                    await result.current.calculateActionImpact(mockActionData);
                } catch (error) {
                    expect(error.message).toBe('Action verification failed');
                }
            });

            expect(result.current.error).toBe('Action verification failed');
            expect(result.current.isCalculating).toBe(false);
        });
    });

    describe('getHistoricalImpact', () => {
        const mockActions = [
            {
                timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000),
                impact: { carbonOffset: 22, waterRetention: 100 }
            },
            {
                timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
                impact: { carbonOffset: 22, waterRetention: 100 }
            }
        ];

        beforeEach(() => {
            mockGetPlayerStats.mockResolvedValue({ actionHistory: mockActions });
        });

        it('should aggregate historical impacts correctly', async () => {
            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            await act(async () => {
                const historicalImpact = await result.current.getHistoricalImpact('7d');

                expect(historicalImpact.carbonOffset).toBe(44); // 22 * 2
                expect(historicalImpact.waterRetention).toBe(200); // 100 * 2
            });
        });

        it('should filter impacts by timeframe', async () => {
            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            await act(async () => {
                const dayImpact = await result.current.getHistoricalImpact('24h');
                expect(dayImpact.carbonOffset).toBe(22); // Only one action within 24h

                const weekImpact = await result.current.getHistoricalImpact('7d');
                expect(weekImpact.carbonOffset).toBe(44); // Both actions within 7d
            });
        });
    });

    describe('estimateActionImpact', () => {
        const mockActionData = {
            type: 'TREE_PLANTING',
            quantity: 1,
            details: { weather: 'sunny', season: 'spring' }
        };

        it('should provide impact estimation without verification', () => {
            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            const estimation = result.current.estimateActionImpact(mockActionData);

            expect(estimation).toBeDefined();
            expect(estimation.carbonOffset).toBeGreaterThan(0);
            expect(estimation.waterRetention).toBeGreaterThan(0);
        });

        it('should handle invalid action types', () => {
            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            const invalidAction = { ...mockActionData, type: 'INVALID_TYPE' };

            expect(() => {
                result.current.estimateActionImpact(invalidAction);
            }).toThrow();
        });
    });

    describe('getRewardBreakdown', () => {
        const mockImpact = {
            type: 'TREE_PLANTING',
            carbonOffset: 22,
            waterRetention: 100,
            verificationScore: 0.9
        };

        const mockPlayerStats = {
            actionHistory: [
                { timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000) }
            ],
            teamSize: 2
        };

        it('should calculate detailed reward breakdown', () => {
            const { result } = renderHook(() => useImpactCalculator(), { wrapper });

            const breakdown = result.current.getRewardBreakdown(mockImpact, mockPlayerStats);

            expect(breakdown).toBeDefined();
            expect(breakdown.amount).toBeGreaterThan(0);
            expect(breakdown.multipliers).toBeDefined();
            expect(breakdown.breakdown).toBeDefined();
            expect(breakdown.breakdown.base).toBeGreaterThan(0);
        });
    });
});
