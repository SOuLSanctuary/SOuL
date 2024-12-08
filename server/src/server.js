const express = require('express');
const path = require('path');
const http = require('http');
const WebSocketServer = require('./websocket/WebSocketServer');

const app = express();
const port = process.env.PORT || 3000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// Serve static files
app.use(express.static(validBuildPath));

// Handle React routing
app.get('*', (req, res, next) => {
  try {
    res.sendFile(path.join(validBuildPath, 'index.html'));
  } catch (err) {
    next(err); // Pass errors to error handling middleware
  }
});

const server = http.createServer(app);

// Initialize WebSocket server with error handling
const wss = new WebSocketServer(server);

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Gracefully shutdown after uncaught exception
  shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Gracefully shutdown after unhandled rejection
  shutdown();
});

// Graceful shutdown function
function shutdown() {
  console.log('Initiating graceful shutdown...');
  server.close(() => {
    console.log('Server closed');
    process.exit(1);
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Using build path:', validBuildPath);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
