import EventEmitter from 'events';

class WebSocketManager extends EventEmitter {
    constructor(gameStateManager, options = {}) {
        super();
        this.gameStateManager = gameStateManager;
        this.ws = null;
        this.isConnected = false;
        this.wsUrl = null;
        this.authToken = null;
        this.pendingMessages = [];
        this.reconnectAttempts = 0;
        this.serverErrorCount = 0;
        this.lastError = null;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.baseDelay = options.baseDelay || 1000;
        this.maxDelay = options.maxDelay || 30000;
        this.serverErrorResetTimeout = options.serverErrorResetTimeout || 60000;
        this.maxServerErrors = options.maxServerErrors || 3;
        this.authTimeout = options.authTimeout || 5000;
        this.eventListeners = {
            maxReconnectAttempts: [],
            error: []
        };
    }

    async connect(serverUrl, authToken) {
        if (!serverUrl || !authToken) {
            throw new Error('URL and auth token are required');
        }

        this.wsUrl = serverUrl;
        this.authToken = authToken;

        return new Promise((resolve, reject) => {
            try {
                if (this.ws) {
                    this.cleanup();
                }

                this.ws = new WebSocket(serverUrl);
                let authTimer = setTimeout(() => {
                    this.handleAuthenticationTimeout();
                    resolve(false);
                }, this.authTimeout);

                this.ws.onopen = () => {
                    this.send({ type: 'AUTH', payload: { token: authToken } });
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'AUTH_SUCCESS') {
                            clearTimeout(authTimer);
                            this.isConnected = true;
                            this.reconnectAttempts = 0;
                            this.serverErrorCount = 0;
                            this.updateConnectionStatus('connected');
                            this.sendPendingMessages();
                            resolve(true);
                        } else if (message.type === 'AUTH_ERROR') {
                            clearTimeout(authTimer);
                            this.handleAuthenticationError(message.payload);
                            resolve(false);
                        } else {
                            this.handleMessage(message);
                        }
                    } catch (error) {
                        this.gameStateManager.handleSystemError({
                            type: 'message_error',
                            message: 'Invalid message format',
                            error
                        });
                    }
                };

                this.ws.onerror = (error) => {
                    clearTimeout(authTimer);
                    this.handleConnectionError(error);
                    resolve(false);
                };

                this.ws.onclose = () => {
                    clearTimeout(authTimer);
                    this.handleConnectionClosed();
                };
            } catch (error) {
                this.handleConnectionError(error);
                resolve(false);
            }
        });
    }

    handleMessage(message) {
        if (!message.type) {
            this.gameStateManager.handleSystemError({
                type: 'message_error',
                message: 'Invalid message type'
            });
            return;
        }

        try {
            switch (message.type) {
                case 'GAME_STATE_UPDATE':
                case 'GAME_STATE':
                    this.gameStateManager.updateGameState(message.payload);
                    break;
                case 'ENVIRONMENTAL_IMPACT':
                case 'ENV_IMPACT_UPDATE':
                    this.gameStateManager.updateEnvironmentalImpact(message.payload);
                    break;
                case 'TEAM_UPDATE':
                    this.gameStateManager.updateTeamState(message.payload);
                    break;
                case 'ERROR':
                case 'SYS_ERROR':
                    this.handleServerError(message.payload);
                    break;
                case 'HEARTBEAT':
                    this.handleHeartbeat();
                    break;
                case 'RECONNECT_REQUEST':
                    this.handleReconnectRequest(message.payload);
                    break;
                default:
                    console.warn(`Unhandled message type: ${message.type}`);
            }
        } catch (error) {
            this.gameStateManager.handleSystemError({
                type: 'message_error',
                message: `Error processing message: ${error.message}`,
                error
            });
        }
    }

    send(message) {
        if (!message || typeof message !== 'object') {
            console.error('Invalid message format');
            return false;
        }

        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                this.handleSystemError({
                    type: 'send_error',
                    message: 'Failed to send message',
                    error
                });
                return false;
            }
        } else {
            this.pendingMessages.push(message);
            return false;
        }
    }

    sendMessage(message) {
        return this.send(message);
    }

    handleConnectionError(error) {
        this.lastError = error;
        this.isConnected = false;
        this.updateConnectionStatus('error', { error });
        this.scheduleReconnection();
    }

    handleServerError(error) {
        this.serverErrorCount++;
        this.lastError = error;
        this.gameStateManager.handleSystemError(error);
        this.emit('error', error);
        
        if (this.serverErrorCount >= this.maxServerErrors) {
            this.cleanup();
            this.scheduleReconnection();
        } else {
            setTimeout(() => {
                if (this.serverErrorCount > 0) {
                    this.serverErrorCount--;
                }
            }, this.serverErrorResetTimeout);
        }
    }

    handleConnectionClosed() {
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
        this.scheduleReconnection();
    }

    handleAuthenticationError(error) {
        this.cleanup();
        this.updateConnectionStatus('error', {
            errorType: 'auth',
            message: error.message || 'Authentication failed'
        });
    }

    handleAuthenticationTimeout() {
        this.cleanup();
        this.updateConnectionStatus('error', {
            errorType: 'auth',
            message: 'Authentication timeout'
        });
    }

    handleHeartbeat() {
        this.send({ type: 'HEARTBEAT_ACK' });
    }

    handleReconnectRequest(payload) {
        this.cleanup();
        this.scheduleReconnection(payload.delay);
    }

    scheduleReconnection(initialDelay = null) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit('max_reconnect_attempts', {
                attempts: this.maxReconnectAttempts,
                error: this.lastError
            });
            this.updateConnectionStatus('error', {
                errorType: 'max_reconnect',
                message: 'Maximum reconnection attempts reached'
            });
            return;
        }

        const delay = initialDelay || this.calculateBackoffTime();
        this.reconnectAttempts++;
        this.updateConnectionStatus('reconnecting', {
            attempt: this.reconnectAttempts,
            maxAttempts: this.maxReconnectAttempts
        });

        setTimeout(() => {
            if (this.ws?.readyState === WebSocket.CLOSED) {
                this.connect(this.wsUrl, this.authToken);
            }
        }, delay);
    }

    calculateBackoffTime() {
        const jitter = Math.random() * 1000;
        const delay = Math.min(
            this.baseDelay * Math.pow(2, this.reconnectAttempts),
            this.maxDelay
        );
        return delay + jitter;
    }

    updateConnectionStatus(status, details = {}) {
        const timestamp = Date.now();
        this.gameStateManager.updateConnectionStatus({
            status,
            timestamp,
            ...details
        });
    }

    sendPendingMessages() {
        while (this.pendingMessages.length > 0) {
            const message = this.pendingMessages.shift();
            this.send(message);
        }
    }

    resetServerErrorCount() {
        this.serverErrorCount = 0;
        this.lastError = null;
    }

    disconnect() {
        this.cleanup();
    }

    cleanup() {
        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
}

export default WebSocketManager;
