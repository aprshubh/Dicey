# Multi-stage Dockerfile for Dicey Frontend

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js index.html ./

# Install dependencies
RUN npm ci

# Copy source and public assets
COPY src/ ./src/
COPY public/ ./public/

# Build static bundle
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
