FROM node:18-alpine

# Install required packages
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY app/package*.json ./app/
COPY app/soulmate/server/package*.json ./app/soulmate/server/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd app && npm install --legacy-peer-deps --force
RUN cd app/soulmate/server && npm install --legacy-peer-deps

# Copy app source
COPY . .

# Create SSL directories
RUN mkdir -p /etc/ssl/private /etc/ssl/certs

# Copy SSL certificates from build context
COPY ssl/private/app.soulsanctuary.cloud.key /etc/ssl/private/
COPY ssl/certs/app.soulsanctuary.cloud.crt /etc/ssl/certs/

# Set proper permissions for SSL files
RUN chmod 600 /etc/ssl/private/app.soulsanctuary.cloud.key
RUN chmod 644 /etc/ssl/certs/app.soulsanctuary.cloud.crt

# Build the app
RUN cd app && NODE_OPTIONS="--max-old-space-size=4096" DISABLE_ESLINT_PLUGIN=true npm run build

# Expose ports
EXPOSE 8080 443

# Start the server
CMD ["node", "app/soulmate/server/server.js"]
