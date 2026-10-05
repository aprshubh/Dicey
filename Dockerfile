# Multi-stage Dockerfile for Dicey Backend (Root context for Render)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy Backend package files
COPY Backend/package*.json Backend/tsconfig.json ./

# Install all dependencies including build tools
RUN npm ci

# Copy Backend source code
COPY Backend/src ./src

# Compile TypeScript
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Copy package files
COPY Backend/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled files
COPY --from=builder /app/dist ./dist

# Use non-root node user
USER node

EXPOSE 10000

CMD ["node", "dist/server.js"]
