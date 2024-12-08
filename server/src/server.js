const express = require('express');
const path = require('path');
const http = require('http');
const WebSocketServer = require('./websocket/WebSocketServer');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../../app/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../app/build', 'index.html'));
});

const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
