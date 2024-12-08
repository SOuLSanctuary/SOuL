class ErrorHandler {
    static handleLocationError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                return {
                    type: 'LOCATION_PERMISSION',
                    message: 'Location access denied. Please enable location services to play.',
                    severity: 'high'
                };
            case error.POSITION_UNAVAILABLE:
                return {
                    type: 'LOCATION_UNAVAILABLE',
                    message: 'Location information is unavailable. Please check your GPS settings.',
                    severity: 'medium'
                };
            case error.TIMEOUT:
                return {
                    type: 'LOCATION_TIMEOUT',
                    message: 'Location request timed out. Please try again.',
                    severity: 'low'
                };
            default:
                return {
                    type: 'LOCATION_UNKNOWN',
                    message: 'An unknown error occurred while getting location.',
                    severity: 'medium'
                };
        }
    }

    static handleNetworkError(error) {
        if (!navigator.onLine) {
            return {
                type: 'NETWORK_OFFLINE',
                message: 'You are offline. Please check your internet connection.',
                severity: 'high'
            };
        }

        if (error.name === 'TimeoutError') {
            return {
                type: 'NETWORK_TIMEOUT',
                message: 'Connection timed out. Please try again.',
                severity: 'medium'
            };
        }

        return {
            type: 'NETWORK_ERROR',
            message: 'Network error occurred. Please check your connection.',
            severity: 'medium'
        };
    }

    static handleBlockchainError(error) {
        if (error.message.includes('rate limit')) {
            return {
                type: 'RATE_LIMIT',
                message: 'Too many requests. Please wait a moment and try again.',
                severity: 'medium',
                retryAfter: 60000 // 1 minute
            };
        }

        if (error.message.includes('insufficient funds')) {
            return {
                type: 'INSUFFICIENT_FUNDS',
                message: 'Insufficient funds for this transaction.',
                severity: 'high'
            };
        }

        return {
            type: 'BLOCKCHAIN_ERROR',
            message: 'Transaction failed. Please try again.',
            severity: 'medium'
        };
    }

    static handleGameError(error) {
        if (error.type === 'COLLECTIBLE_NOT_FOUND') {
            return {
                type: 'COLLECTIBLE_ERROR',
                message: 'Collectible not found or already collected.',
                severity: 'low'
            };
        }

        if (error.type === 'ENERGY_DEPLETED') {
            return {
                type: 'ENERGY_ERROR',
                message: 'Not enough energy. Please wait or use energy items.',
                severity: 'medium'
            };
        }

        return {
            type: 'GAME_ERROR',
            message: 'Game error occurred. Please try again.',
            severity: 'low'
        };
    }

    static async retryOperation(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }
        
        throw lastError;
    }

    static getErrorRecoveryAction(error) {
        switch (error.type) {
            case 'LOCATION_PERMISSION':
                return {
                    action: 'REQUEST_PERMISSION',
                    message: 'Open Settings to enable location services'
                };
            case 'NETWORK_OFFLINE':
                return {
                    action: 'CHECK_CONNECTION',
                    message: 'Check internet connection and try again'
                };
            case 'RATE_LIMIT':
                return {
                    action: 'WAIT',
                    message: 'Please wait before trying again',
                    waitTime: error.retryAfter
                };
            case 'ENERGY_ERROR':
                return {
                    action: 'RESTORE_ENERGY',
                    message: 'Use energy items or wait for energy to restore'
                };
            default:
                return {
                    action: 'RETRY',
                    message: 'Try again'
                };
        }
    }
}

export default ErrorHandler;
