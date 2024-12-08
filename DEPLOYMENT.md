# SOuL Sanctuary Deployment Guide

## Prerequisites
1. Web hosting account with:
   - Node.js support (for WebSocket server)
   - SSL/TLS support (for secure WebSocket connections)
   - SSH access (recommended)

## Pre-deployment Steps

1. **Backup Current Website**
   - Download all files from soulsanctuary.cloud
   - Export any databases
   - Save current DNS settings

2. **Remove Current Theme**
   - Access your hosting control panel
   - Remove all theme files
   - Clear cache
   - Remove theme database entries

## Deployment Steps

1. **Frontend Deployment**
   - Upload the following files to your web root:
     - index.html
     - styles.css
     - script.js
     - impact-map.css
     - impact-map.js
   - Create directories:
     - /app
     - /contracts
     - /program

2. **Backend Deployment**
   - Set up Node.js environment
   - Configure WebSocket server
   - Set up process manager (PM2 recommended)

3. **SSL Configuration**
   - Enable SSL for your domain
   - Update WebSocket connections to use WSS://

4. **DNS Configuration**
   - Point your domain to the new server
   - Set up any required subdomains

## Post-deployment Checklist
- [ ] Test all WebSocket connections
- [ ] Verify all static assets are loading
- [ ] Check SSL certificate
- [ ] Test all features in production
- [ ] Monitor server logs for any errors

## Rollback Plan
In case of issues:
1. Restore backed up files
2. Restore database backup
3. Reset DNS settings if changed
