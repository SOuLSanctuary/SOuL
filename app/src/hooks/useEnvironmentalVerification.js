import { useState, useCallback, useContext, createContext } from 'react';
import EnvironmentalVerification from '../services/EnvironmentalVerification';

const EnvironmentalVerificationContext = createContext(null);

export function EnvironmentalVerificationProvider({ children }) {
    const verifier = new EnvironmentalVerification();
    
    return (
        <EnvironmentalVerificationContext.Provider value={verifier}>
            {children}
        </EnvironmentalVerificationContext.Provider>
    );
}

export function useEnvironmentalVerification() {
    const verifier = useContext(EnvironmentalVerificationContext);
    const [verificationState, setVerificationState] = useState({
        isVerifying: false,
        lastResult: null,
        error: null
    });

    const verifyAction = useCallback(async (actionData) => {
        try {
            setVerificationState(prev => ({
                ...prev,
                isVerifying: true,
                error: null
            }));

            const result = await verifier.verifyEnvironmentalAction(actionData);

            setVerificationState(prev => ({
                ...prev,
                isVerifying: false,
                lastResult: result
            }));

            return result;
        } catch (error) {
            setVerificationState(prev => ({
                ...prev,
                isVerifying: false,
                error: error.message
            }));
            throw error;
        }
    }, [verifier]);

    const verifyLocation = useCallback(async (location) => {
        try {
            return await verifier.verifyLocation(location);
        } catch (error) {
            console.error('Location verification failed:', error);
            return false;
        }
    }, [verifier]);

    const verifyEvidence = useCallback(async (evidence, actionType) => {
        try {
            return await verifier.verifyEvidence(evidence, actionType);
        } catch (error) {
            console.error('Evidence verification failed:', error);
            return false;
        }
    }, [verifier]);

    const getLocationHistory = useCallback((location) => {
        return verifier.getLocationHistory(location);
    }, [verifier]);

    return {
        ...verificationState,
        verifyAction,
        verifyLocation,
        verifyEvidence,
        getLocationHistory
    };
}

export default useEnvironmentalVerification;
