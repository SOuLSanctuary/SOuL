const express = require('express');
const path = require('path');
const http = require('http');
const WebSocketServer = require('./websocket/WebSocketServer');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the React app
// Try both potential build locations
const buildPaths = [
  path.join(__dirname, '../../../app/build'),
  path.join(__dirname, '../../app/build'),
  path.join(__dirname, '../app/build'),
  path.join(__dirname, 'app/build'),
  path.join(__dirname, '../../../build'),
  path.join(__dirname, '../../build'),
  path.join(__dirname, '../build'),
  path.join(__dirname, 'build')
];

// Find the first build path that exists
let validBuildPath = buildPaths.find(buildPath => {
  try {
    require('fs').accessSync(buildPath);
    console.log('Found valid build path:', buildPath);
    return true;
  } catch (err) {
    console.log('Build path not found:', buildPath);
    return false;
  }
}) || buildPaths[0]; // fallback to first path if none found

app.use(express.static(validBuildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(validBuildPath, 'index.html'));
});

const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Using build path:', validBuildPath);
});
