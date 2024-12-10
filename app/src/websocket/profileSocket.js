const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');

class ProfileWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map of walletAddress to WebSocket connection
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Get token from query string
        const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
        if (!token) {
          ws.close(4001, 'Authentication required');
          return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const walletAddress = decoded.walletAddress;

        // Store the connection
        this.clients.set(walletAddress, ws);

        // Setup message handling
        ws.on('message', async (message) => {
          try {
            const data = JSON.parse(message);
            await this.handleMessage(walletAddress, data);
          } catch (error) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          this.clients.delete(walletAddress);
        });

        // Send initial profile data
        const profile = await Profile.findOne({ walletAddress });
        if (profile) {
          ws.send(JSON.stringify({ type: 'profile', data: profile }));
        }

      } catch (error) {
        ws.close(4002, 'Authentication failed');
      }
    });
  }

  async handleMessage(walletAddress, message) {
    const ws = this.clients.get(walletAddress);
    if (!ws) return;

    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'subscribe':
        // Subscribe to other users' updates
        if (message.data && message.data.users) {
          // Store subscriptions for this user
          ws.subscriptions = message.data.users;
        }
        break;

      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  // Broadcast profile update to all subscribed clients
  broadcastProfileUpdate(walletAddress, profile) {
    this.clients.forEach((ws, clientWalletAddress) => {
      if (
        clientWalletAddress === walletAddress || // Send to profile owner
        (ws.subscriptions && ws.subscriptions.includes(walletAddress)) // Send to subscribers
      ) {
        ws.send(JSON.stringify({
          type: 'profileUpdate',
          data: {
            walletAddress,
            profile
          }
        }));
      }
    });
  }
}

module.exports = ProfileWebSocket;
