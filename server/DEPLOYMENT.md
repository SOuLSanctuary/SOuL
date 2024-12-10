# SOuL Sanctuary API Deployment Guide

## Prerequisites

1. Ubuntu 20.04 or later
2. Node.js 18 or later
3. MongoDB
4. Nginx
5. SSL certificate (Let's Encrypt recommended)

## Step-by-Step Deployment

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials
sudo apt install -y build-essential

# Install PM2 globally
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
```

### 2. Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/soul-sanctuary
sudo chown -R $USER:$USER /var/www/soul-sanctuary
cd /var/www/soul-sanctuary

# Copy application files
# (You'll need to copy the files from your local machine to this directory)
```

### 3. Install SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.soulsanctuary.io
```

### 4. Configure Nginx

Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/soul-sanctuary
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.soulsanctuary.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.soulsanctuary.io;

    ssl_certificate /etc/letsencrypt/live/api.soulsanctuary.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.soulsanctuary.io/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    access_log /var/log/nginx/soul-sanctuary.access.log;
    error_log /var/log/nginx/soul-sanctuary.error.log;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://soulsanctuary.cloud' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://soulsanctuary.cloud' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/soul-sanctuary /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Deploy Application

```bash
cd /var/www/soul-sanctuary

# Install dependencies
npm install --production

# Copy environment file
cp .env.production .env

# Start the application with PM2
pm2 delete soul-sanctuary-api || true
pm2 start src/server.js --name soul-sanctuary-api --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 6. Verify Deployment

1. Check if the application is running:
```bash
pm2 status
```

2. Check application logs:
```bash
pm2 logs soul-sanctuary-api
```

3. Test the API:
```bash
curl -k https://api.soulsanctuary.io/health
```

### 7. Monitoring

1. Monitor the application:
```bash
pm2 monit
```

2. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/soul-sanctuary.error.log
sudo tail -f /var/log/nginx/soul-sanctuary.access.log
```

### 8. Backup

1. Setup MongoDB backups:
```bash
# Create backup directory
sudo mkdir -p /var/backups/mongodb

# Create backup script
sudo nano /etc/cron.daily/mongodb-backup
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +"%Y-%m-%d")
BACKUP_DIR="/var/backups/mongodb"
mongodump --out "$BACKUP_DIR/$DATE"
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} +
```

Make it executable:
```bash
sudo chmod +x /etc/cron.daily/mongodb-backup
```

## Troubleshooting

1. If the application fails to start:
```bash
pm2 logs soul-sanctuary-api
```

2. If Nginx fails:
```bash
sudo nginx -t
sudo systemctl status nginx
```

3. If MongoDB fails:
```bash
sudo systemctl status mongod
sudo journalctl -u mongod
```

4. If SSL certificate issues:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## Security Recommendations

1. Setup UFW firewall:
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. Configure fail2ban:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. Regular updates:
```bash
# Create update script
sudo nano /etc/cron.weekly/system-updates
```

Add this content:
```bash
#!/bin/bash
apt update
apt upgrade -y
npm audit fix
```

Make it executable:
```bash
sudo chmod +x /etc/cron.weekly/system-updates
```

## Maintenance

1. Rotate logs:
```bash
sudo nano /etc/logrotate.d/soul-sanctuary
```

Add this content:
```
/var/log/nginx/soul-sanctuary.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi \
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
```

2. Monitor disk space:
```bash
# Install monitoring tools
sudo apt install -y ncdu htop
```

## Rollback Procedure

If deployment fails:

1. Stop the new deployment:
```bash
pm2 stop soul-sanctuary-api
```

2. Restore from backup:
```bash
cd /var/www/soul-sanctuary
git checkout last-known-good-commit
npm install --production
pm2 restart soul-sanctuary-api
```

3. Restore database if needed:
```bash
mongorestore --drop /var/backups/mongodb/latest
```
