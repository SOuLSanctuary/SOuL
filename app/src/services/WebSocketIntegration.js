import WebSocketManager from './WebSocketManager';
import { useEffect, useContext, createContext, useState } from 'react';

// Create WebSocket Context
export const WebSocketContext = createContext(null);

class WebSocketIntegration {
    constructor(serverUrl, authToken, gameStateManager, wsManager = null) {
        if (!gameStateManager) {
            throw new Error('gameStateManager is required');
        }
        this.gameStateManager = gameStateManager;
        this.wsManager = wsManager || new WebSocketManager(gameStateManager);
        this.serverUrl = serverUrl;
        this.authToken = authToken;
    }

    async initialize() {
        try {
            const connected = await this.wsManager.connect(this.serverUrl, this.authToken);
            if (connected) {
                this.setupEventHandlers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize WebSocket integration:', error);
            this.gameStateManager.handleSystemError(error);
            return false;
        }
    }

    setupEventHandlers() {
        // Game State Updates
        this.wsManager.on('GAME_STATE_UPDATE', (payload) => {
            this.gameStateManager.updateGameState(payload);
        });

        // Environmental Updates
        this.wsManager.on('ENV_IMPACT_UPDATE', (payload) => {
            this.gameStateManager.updateEnvironmentalImpact(payload);
        });

        // Team Updates
        this.wsManager.on('TEAM_UPDATE', (payload) => {
            this.gameStateManager.updateTeamState(payload);
        });

        // System Messages
        this.wsManager.on('SYS_ERROR', (payload) => {
            this.gameStateManager.handleSystemError(payload);
        });

        // Connection status updates
        this.wsManager.on('connection', (status) => {
            this.gameStateManager.updateConnectionStatus(status);
        });
    }

    send(message) {
        if (this.wsManager.isConnected) {
            this.wsManager.send(message);
        } else {
            this.wsManager.pendingMessages.push(message);
        }
    }

    cleanup() {
        this.wsManager.cleanup();
        this.gameStateManager.updateConnectionStatus({ status: 'disconnected' });
    }
}

// React Hook for WebSocket Integration
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}

// WebSocket Provider Component
export function WebSocketProvider({ children, serverUrl, authToken, gameStateManager, wsManager = null }) {
    const [wsIntegration, setWsIntegration] = useState(null);

    useEffect(() => {
        const integration = new WebSocketIntegration(serverUrl, authToken, gameStateManager, wsManager);
        integration.initialize().then((success) => {
            if (success) {
                setWsIntegration(integration);
            }
        });

        return () => {
            if (integration) {
                integration.cleanup();
            }
        };
    }, [serverUrl, authToken, gameStateManager, wsManager]);

    return (
        <WebSocketContext.Provider value={wsIntegration}>
            {children}
        </WebSocketContext.Provider>
    );
}

export default WebSocketIntegration;
