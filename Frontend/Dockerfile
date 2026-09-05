# Stage 1: Build the React SPA
FROM node:20-slim AS builder
WORKDIR /app

# Set memory limit to prevent Node OOM (Exit code 134)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Serve built assets with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
