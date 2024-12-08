import { act } from '@testing-library/react';
import WebSocketManager from '../WebSocketManager';

jest.useFakeTimers();

describe('WebSocketManager', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            updateGameState: jest.fn(),
            updateEnvironmentalImpact: jest.fn(),
            updateTeamState: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn(() => mockWebSocket);

        wsManager = new WebSocketManager(mockGameStateManager);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('Connection Management', () => {
        it('validates connection parameters', async () => {
            await expect(wsManager.connect()).rejects.toThrow('URL and auth token are required');
            await expect(wsManager.connect('ws://test.com')).rejects.toThrow('URL and auth token are required');
        });

        it('handles successful connection', async () => {
            const url = 'ws://test.com';
            const token = 'test-token';
            const connectPromise = wsManager.connect(url, token);

            // Simulate successful WebSocket connection
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen();

            // Simulate successful authentication
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'AUTH_SUCCESS'
                })
            });

            const result = await connectPromise;
            expect(result).toBe(true);
            expect(wsManager.isConnected).toBe(true);
            expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
                status: 'connected'
            });
        });

        it('handles authentication timeout', async () => {
            const connectPromise = wsManager.connect('ws://test.com', 'test-token');
            
            await act(async () => {
                jest.advanceTimersByTime(wsManager.authTimeout + 100);
            });

            const result = await connectPromise;
            expect(result).toBe(false);
            expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
                status: 'error',
                errorType: 'auth',
                message: 'Authentication timeout'
            });
        });
    });

    describe('Message Handling', () => {
        beforeEach(async () => {
            const connectPromise = wsManager.connect('ws://test.com', 'test-token');
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen();
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'AUTH_SUCCESS'
                })
            });
            await connectPromise;
        });

        it('handles game state updates', () => {
            const payload = { state: 'test' };
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'GAME_STATE_UPDATE',
                    payload
                })
            });

            expect(mockGameStateManager.updateGameState).toHaveBeenCalledWith(payload);
        });

        it('handles environmental updates', () => {
            const payload = { impact: 100 };
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'ENV_IMPACT_UPDATE',
                    payload
                })
            });

            expect(mockGameStateManager.updateEnvironmentalImpact).toHaveBeenCalledWith(payload);
        });

        it('handles team updates', () => {
            const payload = { team: 'test' };
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'TEAM_UPDATE',
                    payload
                })
            });

            expect(mockGameStateManager.updateTeamState).toHaveBeenCalledWith(payload);
        });

        it('handles server errors', () => {
            const payload = { code: 'ERROR', message: 'Test error' };
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'ERROR',
                    payload
                })
            });

            expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(payload);
            expect(wsManager.serverErrorCount).toBe(1);
        });

        it('handles malformed messages', () => {
            mockWebSocket.onmessage({
                data: 'invalid json'
            });

            expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'PARSE_ERROR'
                })
            );
        });
    });

    describe('Message Queue', () => {
        it('queues messages when disconnected', () => {
            wsManager.isConnected = false;
            const message = { type: 'TEST', payload: { data: 'test' } };
            
            wsManager.send(message);
            expect(wsManager.pendingMessages).toContainEqual(message);
        });

        it('sends queued messages upon reconnection', async () => {
            wsManager.isConnected = false;
            const messages = [
                { type: 'TEST1', payload: { data: 'test1' } },
                { type: 'TEST2', payload: { data: 'test2' } }
            ];

            messages.forEach(msg => wsManager.send(msg));
            expect(wsManager.pendingMessages).toHaveLength(2);

            const connectPromise = wsManager.connect('ws://test.com', 'test-token');
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen();
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'AUTH_SUCCESS'
                })
            });
            await connectPromise;

            expect(mockWebSocket.send).toHaveBeenCalledTimes(2);
            expect(wsManager.pendingMessages).toHaveLength(0);
        });
    });

    describe('Reconnection Logic', () => {
        it('implements exponential backoff', () => {
            wsManager.reconnectAttempts = 0;
            const firstDelay = wsManager.calculateBackoffTime();
            expect(firstDelay).toBeGreaterThanOrEqual(wsManager.baseDelay);
            expect(firstDelay).toBeLessThanOrEqual(wsManager.baseDelay + 1000);

            wsManager.reconnectAttempts = 3;
            const thirdDelay = wsManager.calculateBackoffTime();
            expect(thirdDelay).toBeGreaterThanOrEqual(wsManager.baseDelay * Math.pow(2, 3));
            expect(thirdDelay).toBeLessThanOrEqual(wsManager.baseDelay * Math.pow(2, 3) + 1000);
        });

        it('respects max reconnection attempts', async () => {
            const maxAttemptsListener = jest.fn();
            wsManager.on('max_reconnect_attempts', maxAttemptsListener);

            wsManager.reconnectAttempts = wsManager.maxReconnectAttempts;
            await wsManager.scheduleReconnection();

            expect(maxAttemptsListener).toHaveBeenCalledWith({
                attempts: wsManager.maxReconnectAttempts
            });
        });

        it('resets error count after timeout', async () => {
            wsManager.serverErrorCount = 2;
            wsManager.lastError = new Error('Test error');

            await act(async () => {
                jest.advanceTimersByTime(wsManager.serverErrorResetTimeout);
            });

            expect(wsManager.serverErrorCount).toBe(0);
            expect(wsManager.lastError).toBeNull();
        });
    });

    describe('Cleanup', () => {
        it('cleans up resources properly', async () => {
            const connectPromise = wsManager.connect('ws://test.com', 'test-token');
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen();
            mockWebSocket.onmessage({
                data: JSON.stringify({
                    type: 'AUTH_SUCCESS'
                })
            });
            await connectPromise;

            wsManager.cleanup();

            expect(mockWebSocket.close).toHaveBeenCalled();
            expect(wsManager.isConnected).toBe(false);
            expect(wsManager.pendingMessages).toHaveLength(0);
            expect(wsManager.reconnectAttempts).toBe(0);
            expect(wsManager.serverErrorCount).toBe(0);
            expect(wsManager.lastError).toBeNull();
        });
    });

    describe('Message Validation', () => {
        beforeEach(async () => {
            const connectPromise = wsManager.connect('ws://test.com', 'test-token');
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen();
            mockWebSocket.onmessage({
                data: JSON.stringify({ type: 'AUTH_SUCCESS' })
            });
            await connectPromise;
        });

        it('handles malformed JSON messages', () => {
            mockWebSocket.onmessage({ data: 'invalid json' });
            expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'message_error',
                    message: expect.stringContaining('Invalid message format')
                })
            );
        });

        it('validates message structure', () => {
            mockWebSocket.onmessage({ data: JSON.stringify({}) });
            expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'message_error',
                    message: expect.stringContaining('Invalid message type')
                })
            );
        });

        it('queues messages when disconnected', () => {
            wsManager.isConnected = false;
            const message = { type: 'TEST', payload: {} };
            wsManager.send(message);
            expect(wsManager.pendingMessages).toContainEqual(message);
        });
    });

    describe('Heartbeat Mechanism', () => {
        beforeEach(async () => {
            const connectPromise = wsManager.connect('ws://test.com', 'test-token');
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen();
            mockWebSocket.onmessage({
                data: JSON.stringify({ type: 'AUTH_SUCCESS' })
            });
            await connectPromise;
        });

        it('responds to heartbeat messages', () => {
            mockWebSocket.onmessage({
                data: JSON.stringify({ type: 'HEARTBEAT' })
            });
            
            expect(mockWebSocket.send).toHaveBeenCalledWith(
                JSON.stringify({ type: 'HEARTBEAT_ACK' })
            );
        });

        it('maintains connection with regular heartbeats', () => {
            // Simulate multiple heartbeats
            for (let i = 0; i < 3; i++) {
                mockWebSocket.onmessage({
                    data: JSON.stringify({ type: 'HEARTBEAT' })
                });
                
                expect(wsManager.isConnected).toBe(true);
                expect(mockWebSocket.send).toHaveBeenCalledWith(
                    JSON.stringify({ type: 'HEARTBEAT_ACK' })
                );
            }
        });
    });
});

describe('WebSocketManager - Server Error Handling', () => {
    let wsManager;
    let mockGameStateManager;

    beforeEach(() => {
        jest.useFakeTimers();
        mockGameStateManager = {
            updateGameState: jest.fn(),
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleReconnection: jest.fn(),
            handleDisconnect: jest.fn()
        };
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('handles server errors and tracks error count', async () => {
        const errorPayload = { code: 'SERVER_ERROR', message: 'Internal server error' };
        const errorListener = jest.fn();
        wsManager.on('server_error', errorListener);

        wsManager.handleMessage(JSON.stringify({ type: 'SYS_ERROR', payload: errorPayload }));

        expect(wsManager.serverErrorCount).toBe(1);
        expect(wsManager.lastError).toEqual(errorPayload);
        expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(errorPayload);
        expect(errorListener).toHaveBeenCalledWith(errorPayload);
    });

    test('initiates reconnection after max server errors', async () => {
        const errorPayload = { code: 'SERVER_ERROR', message: 'Internal server error' };
        const disconnectSpy = jest.spyOn(wsManager, 'disconnect');

        // Simulate multiple server errors
        for (let i = 0; i < wsManager.maxServerErrors; i++) {
            wsManager.handleMessage(JSON.stringify({ type: 'SYS_ERROR', payload: errorPayload }));
        }

        expect(wsManager.serverErrorCount).toBe(wsManager.maxServerErrors);
        expect(disconnectSpy).toHaveBeenCalled();
    });

    test('resets server error count after timeout', async () => {
        const errorPayload = { code: 'SERVER_ERROR', message: 'Internal server error' };

        wsManager.handleMessage(JSON.stringify({ type: 'SYS_ERROR', payload: errorPayload }));
        expect(wsManager.serverErrorCount).toBe(1);

        await act(async () => {
            jest.advanceTimersByTime(wsManager.serverErrorResetTimeout);
        });

        expect(wsManager.serverErrorCount).toBe(0);
        expect(wsManager.lastError).toBeNull();
    });

    test('handles reconnect request from server', async () => {
        const payload = { reason: 'server_maintenance' };
        const disconnectSpy = jest.spyOn(wsManager, 'disconnect');

        wsManager.handleMessage(JSON.stringify({ type: 'RECONNECT_REQUEST', payload }));

        expect(disconnectSpy).toHaveBeenCalled();
    });

    test('implements exponential backoff with jitter for reconnection', async () => {
        wsManager.reconnectAttempts = 2;
        const backoffTime = wsManager.calculateBackoffTime();

        // Base delay is 1000ms, with 2 attempts it should be between 4000-5000ms
        expect(backoffTime).toBeGreaterThanOrEqual(4000);
        expect(backoffTime).toBeLessThanOrEqual(5000);
    });

    test('emits max_reconnect_attempts event when max attempts reached', async () => {
        const maxAttemptsListener = jest.fn();
        wsManager.on('max_reconnect_attempts', maxAttemptsListener);
        wsManager.reconnectAttempts = wsManager.maxReconnectAttempts;
        wsManager.lastError = new Error('Test error');

        wsManager.handleReconnection();
        jest.runAllTimers();

        expect(maxAttemptsListener).toHaveBeenCalledWith({
            attempts: wsManager.maxReconnectAttempts,
            lastError: wsManager.lastError
        });
    });
});

describe('WebSocketManager - Reconnection Logic', () => {
    let wsManager;
    let mockGameStateManager;

    beforeEach(() => {
        jest.useFakeTimers();
        mockGameStateManager = {
            updateGameState: jest.fn(),
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleReconnection: jest.fn(),
            handleDisconnect: jest.fn()
        };
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should attempt reconnection with exponential backoff', async () => {
        const mockError = new Error('Connection lost');
        wsManager.reconnectAttempts = 0;

        wsManager.handleConnectionError(mockError);
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({ status: 'error' });

        // First retry
        jest.advanceTimersByTime(1000); // Base delay
        expect(wsManager.reconnectAttempts).toBe(1);

        // Second retry
        jest.advanceTimersByTime(2000); // 2 * base delay
        expect(wsManager.reconnectAttempts).toBe(2);

        // Third retry
        jest.advanceTimersByTime(4000); // 4 * base delay
        expect(wsManager.reconnectAttempts).toBe(3);
    });

    it('should stop reconnecting after max attempts', async () => {
        const mockError = new Error('Connection lost');
        wsManager.reconnectAttempts = wsManager.maxReconnectAttempts - 1;

        wsManager.handleConnectionError(mockError);
        jest.advanceTimersByTime(30000); // Max delay

        expect(wsManager.reconnectAttempts).toBe(wsManager.maxReconnectAttempts);
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenLastCalledWith({ status: 'error' });
    });

    it('should reset error count after timeout', () => {
        wsManager.serverErrorCount = 2;
        wsManager.lastError = new Error('Test error');

        wsManager.resetServerErrorCount();
        expect(wsManager.serverErrorCount).toBe(0);
        expect(wsManager.lastError).toBeNull();
    });
});

describe('WebSocketManager - Message Handling', () => {
    let wsManager;
    let mockGameStateManager;

    beforeEach(() => {
        mockGameStateManager = {
            updateGameState: jest.fn(),
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleReconnection: jest.fn(),
            handleDisconnect: jest.fn()
        };
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    it('should handle malformed messages gracefully', () => {
        const invalidMessage = 'invalid json';
        wsManager.handleMessage(invalidMessage);

        expect(mockGameStateManager.handleSystemError).toHaveBeenCalled();
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
            status: 'error'
        });
    });

    it('should process valid messages correctly', () => {
        const validMessage = JSON.stringify({
            type: 'GAME_STATE_UPDATE',
            payload: { score: 100 }
        });

        wsManager.handleMessage(validMessage);
        expect(mockGameStateManager.updateGameState).toHaveBeenCalledWith({ score: 100 });
    });
});

describe('WebSocketManager - Message Queue', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleGameStateUpdate: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
        
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    test('queues messages when disconnected', async () => {
        const message = { type: 'ACTION', payload: { action: 'test' } };
        wsManager.sendMessage(message);
        expect(wsManager.pendingMessages).toContainEqual(message);
    });

    test('sends queued messages upon reconnection', async () => {
        const messages = [
            { type: 'ACTION', payload: { action: 'test1' } },
            { type: 'ACTION', payload: { action: 'test2' } }
        ];

        // Queue messages while disconnected
        messages.forEach(msg => wsManager.sendMessage(msg));
        expect(wsManager.pendingMessages.length).toBe(2);

        // Connect and verify messages are sent
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        mockWebSocket.simulateMessage(JSON.stringify({ 
            type: 'AUTH_RESPONSE', 
            payload: { success: true } 
        }));

        expect(wsManager.pendingMessages.length).toBe(0);
    });
});

describe('WebSocketManager - Edge Cases', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleGameStateUpdate: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
        
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    test('handles malformed server messages', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        mockWebSocket.simulateMessage('invalid json');
        expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith({
            code: 'MESSAGE_PARSE_ERROR',
            message: 'Failed to parse message'
        });
    });

    test('handles network fluctuations', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        // Simulate connection drop
        mockWebSocket.simulateClose();
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
            status: 'disconnected'
        });

        // Verify reconnection attempt
        expect(wsManager.reconnectAttempts).toBeGreaterThan(0);
    });

    test('respects max reconnection attempts', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        
        // Simulate multiple connection failures
        for (let i = 0; i <= wsManager.maxReconnectAttempts; i++) {
            mockWebSocket.simulateClose();
        }

        expect(wsManager.reconnectAttempts).toBe(wsManager.maxReconnectAttempts);
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenLastCalledWith({
            status: 'error',
            errorType: 'connection',
            message: 'Max reconnection attempts reached'
        });
    });
});

describe('WebSocketManager - Authentication Flow', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleGameStateUpdate: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
        
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    test('handles authentication timeout', async () => {
        jest.useFakeTimers();
        
        const connectPromise = wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        // Fast-forward past the auth timeout
        jest.advanceTimersByTime(6000);
        
        await expect(connectPromise).rejects.toThrow('Authentication timeout');
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
            status: 'error',
            errorType: 'auth',
            message: 'Authentication timeout'
        });

        jest.useRealTimers();
    });

    test('handles authentication failure', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { 
                success: false,
                error: 'Invalid token'
            }
        }));

        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
            status: 'error',
            errorType: 'auth',
            message: 'Invalid token'
        });
    });

    test('handles successful authentication flow', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        expect(wsManager.isConnected).toBe(true);
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith({
            status: 'connected'
        });
    });
});

describe('WebSocketManager - Connection State Management', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        jest.useFakeTimers();
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleGameStateUpdate: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
        
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('transitions through connection states correctly', async () => {
        const connectPromise = wsManager.connect('ws://test.com', 'test-token');
        
        // Should start in connecting state
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'connecting' })
        );

        // Simulate WebSocket open
        mockWebSocket.simulateOpen();
        
        // Should move to authenticating state
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'authenticating' })
        );

        // Simulate successful auth response
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        // Should be in connected state
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'connected' })
        );

        await connectPromise;
    });

    test('handles disconnection state transition', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        mockWebSocket.simulateClose();
        
        expect(mockGameStateManager.updateConnectionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'disconnected' })
        );
    });
});

describe('WebSocketManager - Heartbeat Mechanism', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        jest.useFakeTimers();
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleGameStateUpdate: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
        
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('sends heartbeat messages at regular intervals', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        // Simulate successful auth
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        // Fast forward to trigger heartbeat
        jest.advanceTimersByTime(wsManager.heartbeatIntervalMs);
        
        // Should have sent a heartbeat message
        expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: 'HEARTBEAT' })
        );
    });

    test('handles missing heartbeat responses', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        // Simulate successful auth
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        // Fast forward past heartbeat interval and timeout
        jest.advanceTimersByTime(wsManager.heartbeatIntervalMs + wsManager.heartbeatTimeoutMs);
        
        // Should trigger connection error
        expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith(
            expect.objectContaining({
                code: 'CONNECTION_ERROR',
                message: 'Heartbeat timeout'
            })
        );
    });

    test('processes heartbeat responses correctly', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        
        // Simulate successful auth
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        // Fast forward to trigger heartbeat
        jest.advanceTimersByTime(wsManager.heartbeatIntervalMs);
        
        // Simulate heartbeat response
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'HEARTBEAT_RESPONSE'
        }));

        // Fast forward past timeout - should not trigger error
        jest.advanceTimersByTime(wsManager.heartbeatTimeoutMs);
        
        expect(mockGameStateManager.handleSystemError).not.toHaveBeenCalled();
    });
});

describe('WebSocketManager - Message Validation', () => {
    let wsManager;
    let mockGameStateManager;
    let mockWebSocket;

    beforeEach(() => {
        mockGameStateManager = {
            handleSystemError: jest.fn(),
            updateConnectionStatus: jest.fn(),
            handleGameStateUpdate: jest.fn()
        };

        mockWebSocket = new MockWebSocket('ws://test.com');
        global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
        
        wsManager = new WebSocketManager(mockGameStateManager);
    });

    test('validates message format', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        // Invalid message (not an object)
        wsManager.send('invalid');
        expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith({
            code: 'INVALID_MESSAGE',
            message: expect.stringContaining('message must be an object')
        });

        // Missing type
        wsManager.send({});
        expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith({
            code: 'INVALID_MESSAGE',
            message: expect.stringContaining('message.type must be a string')
        });

        // Invalid ACTION message
        wsManager.send({ type: 'ACTION' });
        expect(mockGameStateManager.handleSystemError).toHaveBeenCalledWith({
            code: 'INVALID_MESSAGE',
            message: expect.stringContaining('payload must be an object')
        });
    });

    test('allows valid messages', async () => {
        await wsManager.connect('ws://test.com', 'test-token');
        mockWebSocket.simulateOpen();
        mockWebSocket.simulateMessage(JSON.stringify({
            type: 'AUTH_RESPONSE',
            payload: { success: true }
        }));

        // Valid ACTION message
        wsManager.send({
            type: 'ACTION',
            payload: { action: 'test' }
        });
        expect(mockGameStateManager.handleSystemError).not.toHaveBeenCalled();

        // Valid HEARTBEAT message
        wsManager.send({ type: 'HEARTBEAT' });
        expect(mockGameStateManager.handleSystemError).not.toHaveBeenCalled();
    });
});

class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
        this.send = jest.fn();
        this.close = jest.fn();
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
    }

    simulateOpen() {
        this.readyState = WebSocket.OPEN;
        if (this.onopen) {
            this.onopen();
        }
    }

    simulateMessage(data) {
        if (this.onmessage) {
            this.onmessage({ data });
        }
    }

    simulateClose() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) {
            this.onclose();
        }
    }
}
