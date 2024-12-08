const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class WebSocketServer {
    constructor(server, gameState, environmentalImpact) {
        this.wss = new WebSocket.Server({ server });
        this.gameState = gameState;
        this.environmentalImpact = environmentalImpact;
        this.clients = new Map(); // clientId -> {ws, userId, gameData}
        this.rooms = new Map();   // roomId -> Set of clientIds
        
        this.setupWebSocketServer();
        this.startHeartbeat();
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            const clientId = uuidv4();
            
            ws.on('message', async (message) => {
                try {
                    await this.handleMessage(clientId, ws, message);
                } catch (error) {
                    console.error('Error handling message:', error);
                    this.sendError(ws, error.message);
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(clientId);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnect(clientId);
            });
        });
    }

    async handleMessage(clientId, ws, message) {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'AUTH':
                await this.handleAuth(clientId, ws, data.token);
                break;
                
            case 'GAME_ACTION':
                await this.handleGameAction(clientId, data.payload);
                break;
                
            case 'ENV_ACTION':
                await this.handleEnvironmentalAction(clientId, data.payload);
                break;
                
            case 'JOIN_ROOM':
                await this.handleJoinRoom(clientId, data.payload.roomId);
                break;
                
            case 'LEAVE_ROOM':
                await this.handleLeaveRoom(clientId, data.payload.roomId);
                break;
                
            case 'TEAM_ACTION':
                await this.handleTeamAction(clientId, data.payload);
                break;
                
            case 'SYS_PONG':
                this.handlePong(clientId);
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    async handleAuth(clientId, ws, token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
            
            // Initialize client data
            this.clients.set(clientId, {
                ws,
                userId,
                lastPong: Date.now(),
                gameData: await this.gameState.getPlayerState(userId)
            });

            // Send successful auth response
            this.send(ws, {
                type: 'AUTH_RESPONSE',
                payload: { success: true }
            });

            // Send initial game state
            this.sendGameState(clientId);
            
        } catch (error) {
            console.error('Authentication failed:', error);
            this.send(ws, {
                type: 'AUTH_RESPONSE',
                payload: { success: false, error: 'Authentication failed' }
            });
            ws.close();
        }
    }

    async handleGameAction(clientId, payload) {
        const client = this.clients.get(clientId);
        if (!client) return;

        try {
            // Process game action
            const result = await this.gameState.processAction(client.userId, payload);
            
            // Broadcast updates to relevant clients
            this.broadcastGameUpdate(result);
            
        } catch (error) {
            console.error('Game action failed:', error);
            this.sendError(client.ws, error.message);
        }
    }

    async handleEnvironmentalAction(clientId, payload) {
        const client = this.clients.get(clientId);
        if (!client) return;

        try {
            // Verify and process environmental action
            const impact = await this.environmentalImpact.trackAction(client.userId, payload);
            
            // Update game state with environmental impact
            await this.gameState.updateEnvironmentalImpact(client.userId, impact);
            
            // Broadcast environmental update
            this.broadcastEnvironmentalUpdate(client.userId, impact);
            
        } catch (error) {
            console.error('Environmental action failed:', error);
            this.sendError(client.ws, error.message);
        }
    }

    async handleTeamAction(clientId, payload) {
        const client = this.clients.get(clientId);
        if (!client) return;

        try {
            // Process team action
            const result = await this.gameState.processTeamAction(client.userId, payload);
            
            // Broadcast team update
            this.broadcastTeamUpdate(result);
            
        } catch (error) {
            console.error('Team action failed:', error);
            this.sendError(client.ws, error.message);
        }
    }

    async handleJoinRoom(clientId, roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(clientId);
        
        // Notify room members
        this.broadcastToRoom(roomId, {
            type: 'ROOM_UPDATE',
            payload: {
                action: 'JOIN',
                userId: this.clients.get(clientId)?.userId
            }
        });
    }

    async handleLeaveRoom(clientId, roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.delete(clientId);
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
            
            // Notify remaining room members
            this.broadcastToRoom(roomId, {
                type: 'ROOM_UPDATE',
                payload: {
                    action: 'LEAVE',
                    userId: this.clients.get(clientId)?.userId
                }
            });
        }
    }

    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // Remove from all rooms
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.has(clientId)) {
                this.handleLeaveRoom(clientId, roomId);
            }
        }

        // Clean up client data
        this.clients.delete(clientId);
    }

    // Broadcasting methods
    broadcastGameUpdate(update) {
        const { affectedPlayers, gameState } = update;
        
        affectedPlayers.forEach(playerId => {
            for (const [clientId, client] of this.clients.entries()) {
                if (client.userId === playerId) {
                    this.send(client.ws, {
                        type: 'GAME_STATE_UPDATE',
                        payload: gameState
                    });
                }
            }
        });
    }

    broadcastEnvironmentalUpdate(userId, impact) {
        // Find teams/rooms that should receive this update
        const relevantRooms = this.findRelevantRooms(userId);
        
        relevantRooms.forEach(roomId => {
            this.broadcastToRoom(roomId, {
                type: 'ENV_IMPACT_UPDATE',
                payload: {
                    userId,
                    impact
                }
            });
        });
    }

    broadcastTeamUpdate(update) {
        const { teamId, teamState } = update;
        
        // Broadcast to all team members
        this.broadcastToTeam(teamId, {
            type: 'TEAM_UPDATE',
            payload: teamState
        });
    }

    broadcastToRoom(roomId, message) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
                this.send(client.ws, message);
            }
        });
    }

    broadcastToTeam(teamId, message) {
        for (const [clientId, client] of this.clients.entries()) {
            if (client.gameData.teamId === teamId) {
                this.send(client.ws, message);
            }
        }
    }

    // Utility methods
    send(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    sendError(ws, error) {
        this.send(ws, {
            type: 'SYS_ERROR',
            payload: { error }
        });
    }

    findRelevantRooms(userId) {
        const relevantRooms = new Set();
        
        for (const [roomId, room] of this.rooms.entries()) {
            for (const clientId of room) {
                const client = this.clients.get(clientId);
                if (client && client.userId === userId) {
                    relevantRooms.add(roomId);
                    break;
                }
            }
        }
        
        return Array.from(relevantRooms);
    }

    // Heartbeat system
    startHeartbeat() {
        setInterval(() => {
            const now = Date.now();
            
            for (const [clientId, client] of this.clients.entries()) {
                if (now - client.lastPong > 30000) { // 30 seconds timeout
                    console.log('Client timed out:', clientId);
                    client.ws.terminate();
                    this.handleDisconnect(clientId);
                } else {
                    this.send(client.ws, { type: 'SYS_PING' });
                }
            }
        }, 15000); // Check every 15 seconds
    }

    handlePong(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.lastPong = Date.now();
        }
    }
}

module.exports = WebSocketServer;
