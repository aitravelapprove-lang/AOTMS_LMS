# Node.js LTS Debian Slim image (Fewer network/DNS issues than Alpine on Windows Docker)
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies with network optimizations
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
