class MockWebSocketManager {
    constructor() {
        this.eventHandlers = new Map();
        this.isConnected = false;
        this.pendingMessages = [];
        this.reconnectAttempts = 0;
        this.serverErrorCount = 0;
        this.authToken = null;
        
        // Enhanced mock functions
        this.connect = jest.fn().mockImplementation(async (url, token) => {
            if (!url || !token) {
                throw new Error('URL and auth token are required');
            }
            this.authToken = token;
            this.isConnected = true;
            this.emit('connection_status', { status: 'connected' });
            return true;
        });
        
        this.send = jest.fn().mockImplementation((message) => {
            if (!this.isConnected) {
                this.pendingMessages.push(message);
                return false;
            }
            return true;
        });
        
        this.cleanup = jest.fn().mockImplementation(() => {
            this.isConnected = false;
            this.pendingMessages = [];
            this.reconnectAttempts = 0;
            this.serverErrorCount = 0;
            this.authToken = null;
            this.eventHandlers.clear();
            this.emit('connection_status', { status: 'disconnected' });
        });
        
        this.on = jest.fn().mockImplementation((event, handler) => {
            if (!this.eventHandlers.has(event)) {
                this.eventHandlers.set(event, new Set());
            }
            this.eventHandlers.get(event).add(handler);
        });
        
        this.off = jest.fn().mockImplementation((event, handler) => {
            if (this.eventHandlers.has(event)) {
                this.eventHandlers.get(event).delete(handler);
            }
        });
        
        this.emit = jest.fn().mockImplementation((event, data) => {
            if (this.eventHandlers.has(event)) {
                this.eventHandlers.get(event).forEach(handler => handler(data));
            }
        });
        
        // Add simulation methods for testing
        this.simulateDisconnect = () => {
            this.isConnected = false;
            this.emit('connection_status', { status: 'disconnected' });
        };
        
        this.simulateReconnect = () => {
            this.isConnected = true;
            this.emit('connection_status', { status: 'connected' });
        };
        
        this.simulateError = (error) => {
            this.emit('error', error);
        };
    }
}

export default MockWebSocketManager;
