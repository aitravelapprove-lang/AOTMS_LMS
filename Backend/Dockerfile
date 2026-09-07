# Node.js LTS Debian Slim image
FROM node:20-slim

# Install Python3, GCC, G++ for native 100% offline fast execution
RUN apt-get update && apt-get install -y python3 gcc g++ && rm -rf /var/lib/apt/lists/*

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
