const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const cors = require('cors');
const WebSocketServer = require('./websocket/WebSocketServer');
const { logInfo, logError, logWarning } = require('./utils/logger');
const profileRoutes = require('./routes/profile');

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://soulsanctuary.cloud']
  : ['http://localhost:3000', 'http://localhost:3006'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Only add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logError('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Force HTTPS redirect
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
  }
  next();
});

// Register routes
app.use('/api', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const health = { 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  logInfo('Health check passed', health);
  res.status(200).json(health);
});

// Request logging middleware
app.use((req, res, next) => {
  logInfo(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
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
    logInfo('Found valid build path:', { path: buildPath });
    return true;
  } catch (err) {
    logWarning('Build path not found:', { path: buildPath });
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
    next(err);
  }
});

const server = http.createServer(app);

// Initialize WebSocket server with error handling
const wss = new WebSocketServer(server);

// Handle server errors
server.on('error', (err) => {
  logError('Server error:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception:', err);
  shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection:', { reason, promise });
  shutdown();
});

// Graceful shutdown function
function shutdown() {
  logInfo('Initiating graceful shutdown...');
  server.close(() => {
    logInfo('Server closed');
    process.exit(1);
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logError('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
server.listen(port, () => {
  logInfo('Server started', {
    port,
    buildPath: validBuildPath,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
