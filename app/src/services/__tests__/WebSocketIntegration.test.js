import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import WebSocketIntegration, { WebSocketProvider, useWebSocket } from '../WebSocketIntegration';
import MockWebSocketManager from '../__mocks__/WebSocketManager';

const mockWsUrl = 'ws://localhost:8080';
const mockAuthToken = 'test-auth-token';

describe('WebSocketIntegration', () => {
    let wsIntegration;
    let mockGameStateManager;

    beforeEach(() => {
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            updateGameState: jest.fn(),
            updateEnvironmentalImpact: jest.fn(),
            updateTeamState: jest.fn()
        };
    });

    describe('Initialization', () => {
        it('initializes successfully with valid parameters', async () => {
            const wsManager = new MockWebSocketManager();
            wsIntegration = new WebSocketIntegration(mockWsUrl, mockAuthToken, mockGameStateManager, wsManager);
            const result = await wsIntegration.initialize();
            
            expect(result).toBe(true);
            expect(wsManager.connect).toHaveBeenCalledWith(mockWsUrl, mockAuthToken);
            expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'connected' })
            );
        });

        it('handles connection error', async () => {
            const wsManager = new MockWebSocketManager();
            wsManager.connect.mockRejectedValueOnce(new Error('Connection failed'));
            
            wsIntegration = new WebSocketIntegration(mockWsUrl, mockAuthToken, mockGameStateManager, wsManager);
            const result = await wsIntegration.initialize();
            
            expect(result).toBe(false);
            expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(
                expect.any(Error)
            );
        });

        it('handles missing parameters', () => {
            expect(() => {
                new WebSocketIntegration(mockWsUrl, mockAuthToken);
            }).toThrow('gameStateManager is required');
        });
    });

    describe('Event Handling', () => {
        let wsManager;

        beforeEach(async () => {
            wsManager = new MockWebSocketManager();
            wsIntegration = new WebSocketIntegration(mockWsUrl, mockAuthToken, mockGameStateManager, wsManager);
            await wsIntegration.initialize();
        });

        it('handles game state updates', () => {
            const payload = { state: 'test' };
            wsManager.emit('GAME_STATE_UPDATE', payload);
            expect(mockGameStateManager.updateGameState).toHaveBeenCalledWith(payload);
        });

        it('handles environmental updates', () => {
            const payload = { impact: 100 };
            wsManager.emit('ENV_IMPACT_UPDATE', payload);
            expect(mockGameStateManager.updateEnvironmentalImpact).toHaveBeenCalledWith(payload);
        });

        it('handles team updates', () => {
            const payload = { team: 'test-team' };
            wsManager.emit('TEAM_UPDATE', payload);
            expect(mockGameStateManager.updateTeamState).toHaveBeenCalledWith(payload);
        });

        it('handles connection status changes', () => {
            wsManager.simulateDisconnect();
            expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'disconnected' })
            );

            wsManager.simulateReconnect();
            expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'connected' })
            );
        });

        it('handles errors', () => {
            const error = new Error('Test error');
            wsManager.simulateError(error);
            expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(error);
        });
    });

    describe('Message Handling', () => {
        let wsManager;

        beforeEach(async () => {
            wsManager = new MockWebSocketManager();
            wsIntegration = new WebSocketIntegration(mockWsUrl, mockAuthToken, mockGameStateManager, wsManager);
            await wsIntegration.initialize();
        });

        it('sends messages when connected', () => {
            const message = { type: 'TEST', payload: { data: 'test' } };
            wsIntegration.send(message);
            expect(wsManager.send).toHaveBeenCalledWith(message);
            expect(wsManager.pendingMessages).toHaveLength(0);
        });

        it('queues messages when disconnected', () => {
            wsManager.simulateDisconnect();
            const message = { type: 'TEST', payload: { data: 'test' } };
            wsIntegration.send(message);
            expect(wsManager.pendingMessages).toContainEqual(message);
        });

        it('sends queued messages upon reconnection', () => {
            wsManager.simulateDisconnect();
            const message1 = { type: 'TEST1', payload: { data: 'test1' } };
            const message2 = { type: 'TEST2', payload: { data: 'test2' } };
            
            wsIntegration.send(message1);
            wsIntegration.send(message2);
            
            expect(wsManager.pendingMessages).toHaveLength(2);
            
            wsManager.simulateReconnect();
            expect(wsManager.send).toHaveBeenCalledWith(message1);
            expect(wsManager.send).toHaveBeenCalledWith(message2);
            expect(wsManager.pendingMessages).toHaveLength(0);
        });
    });

    describe('Cleanup', () => {
        it('cleans up resources properly', async () => {
            const wsManager = new MockWebSocketManager();
            wsIntegration = new WebSocketIntegration(mockWsUrl, mockAuthToken, mockGameStateManager, wsManager);
            await wsIntegration.initialize();

            wsIntegration.cleanup();
            
            expect(wsManager.cleanup).toHaveBeenCalled();
            expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'disconnected' })
            );
            expect(wsManager.eventHandlers.size).toBe(0);
        });
    });
});

describe('WebSocket React Integration', () => {
    let TestComponent;
    
    beforeEach(() => {
        TestComponent = () => {
            const ws = useWebSocket();
            return <div data-testid="ws-status">WebSocket Status: {ws.isConnected ? 'connected' : 'not connected'}</div>;
        };
    });

    it('provides WebSocket context', async () => {
        const wsManager = new MockWebSocketManager();
        const { getByTestId } = render(
            <WebSocketProvider 
                serverUrl={mockWsUrl} 
                authToken={mockAuthToken}
                gameStateManager={mockGameStateManager}
                wsManager={wsManager}
            >
                <TestComponent />
            </WebSocketProvider>
        );
        
        await waitFor(() => {
            expect(getByTestId('ws-status')).toHaveTextContent('WebSocket Status: connected');
        });
    });

    it('handles connection changes in context', async () => {
        const wsManager = new MockWebSocketManager();
        const { getByTestId } = render(
            <WebSocketProvider 
                serverUrl={mockWsUrl} 
                authToken={mockAuthToken}
                gameStateManager={mockGameStateManager}
                wsManager={wsManager}
            >
                <TestComponent />
            </WebSocketProvider>
        );

        await waitFor(() => {
            expect(getByTestId('ws-status')).toHaveTextContent('WebSocket Status: connected');
        });

        wsManager.simulateDisconnect();
        await waitFor(() => {
            expect(getByTestId('ws-status')).toHaveTextContent('WebSocket Status: not connected');
        });
    });

    it('throws error when used outside provider', () => {
        expect(() => {
            render(<TestComponent />);
        }).toThrow('useWebSocket must be used within a WebSocketProvider');
    });
});
