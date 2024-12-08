import { useState, useCallback, useContext, createContext } from 'react';
import ImpactCalculator from '../services/ImpactCalculator';
import { useWebSocket } from './useWebSocket';
import { useEnvironmentalVerification } from './useEnvironmentalVerification';

const ImpactCalculatorContext = createContext(null);

export function ImpactCalculatorProvider({ children }) {
    const calculator = new ImpactCalculator();
    
    return (
        <ImpactCalculatorContext.Provider value={calculator}>
            {children}
        </ImpactCalculatorContext.Provider>
    );
}

export function useImpactCalculator() {
    const calculator = useContext(ImpactCalculatorContext);
    const ws = useWebSocket();
    const { verifyAction } = useEnvironmentalVerification();
    
    const [calculationState, setCalculationState] = useState({
        isCalculating: false,
        lastImpact: null,
        lastReward: null,
        error: null
    });

    const calculateActionImpact = useCallback(async (actionData) => {
        try {
            setCalculationState(prev => ({
                ...prev,
                isCalculating: true,
                error: null
            }));

            // First verify the action
            const verificationResult = await verifyAction(actionData);
            if (!verificationResult.isValid) {
                throw new Error('Action verification failed');
            }

            // Calculate impact
            const impact = calculator.calculateImpact(actionData, verificationResult);

            // Get player stats from game state
            const playerStats = await ws.getPlayerStats();

            // Calculate rewards
            const rewards = calculator.calculateRewards(impact, playerStats);

            // Send impact and rewards to blockchain
            await ws.trackEnvironmentalAction({
                action: actionData,
                impact,
                rewards,
                verification: verificationResult
            });

            setCalculationState(prev => ({
                ...prev,
                isCalculating: false,
                lastImpact: impact,
                lastReward: rewards
            }));

            return { impact, rewards };
        } catch (error) {
            setCalculationState(prev => ({
                ...prev,
                isCalculating: false,
                error: error.message
            }));
            throw error;
        }
    }, [calculator, verifyAction, ws]);

    const getHistoricalImpact = useCallback(async (timeframe = '7d') => {
        try {
            const playerStats = await ws.getPlayerStats();
            const actions = playerStats.actionHistory.filter(action => {
                const actionDate = new Date(action.timestamp);
                const now = new Date();
                
                switch (timeframe) {
                    case '24h':
                        return now - actionDate <= 24 * 60 * 60 * 1000;
                    case '7d':
                        return now - actionDate <= 7 * 24 * 60 * 60 * 1000;
                    case '30d':
                        return now - actionDate <= 30 * 24 * 60 * 60 * 1000;
                    case 'all':
                        return true;
                    default:
                        return now - actionDate <= 7 * 24 * 60 * 60 * 1000;
                }
            });

            const impacts = actions.map(action => action.impact);
            return this.aggregateImpacts(impacts);
        } catch (error) {
            console.error('Failed to get historical impact:', error);
            throw error;
        }
    }, [ws]);

    const estimateActionImpact = useCallback((actionData) => {
        try {
            // Estimate impact without verification
            const estimatedVerification = { confidenceScore: 1.0, isValid: true };
            return calculator.calculateImpact(actionData, estimatedVerification);
        } catch (error) {
            console.error('Failed to estimate impact:', error);
            throw error;
        }
    }, [calculator]);

    const aggregateImpacts = useCallback((impacts) => {
        return impacts.reduce((total, impact) => {
            const aggregated = { ...total };
            for (const [key, value] of Object.entries(impact)) {
                if (typeof value === 'number') {
                    aggregated[key] = (aggregated[key] || 0) + value;
                }
            }
            return aggregated;
        }, {});
    }, []);

    const getRewardBreakdown = useCallback((impact, playerStats) => {
        try {
            return calculator.calculateRewards(impact, playerStats);
        } catch (error) {
            console.error('Failed to get reward breakdown:', error);
            throw error;
        }
    }, [calculator]);

    return {
        ...calculationState,
        calculateActionImpact,
        getHistoricalImpact,
        estimateActionImpact,
        getRewardBreakdown,
        aggregateImpacts
    };
}

export default useImpactCalculator;
