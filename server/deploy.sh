#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Copy environment file
echo "Setting up environment..."
cp .env.production .env

# Build the application (if needed)
echo "Building application..."
npm run build

# Start the server using PM2
echo "Starting server with PM2..."
pm2 delete soul-sanctuary-api || true
pm2 start src/server.js --name soul-sanctuary-api --env production

echo "Deployment complete!"
