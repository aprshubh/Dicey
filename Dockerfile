# Multi-stage Dockerfile for Dicey Fullstack (Frontend + Backend on single port)

# ---------------------------------------------------------------------------
# Stage 1: Build React Frontend
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Build Express & Socket.IO Backend
# ---------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app/Backend

COPY Backend/package*.json Backend/tsconfig.json ./
RUN npm ci

COPY Backend/src/ ./src/
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production Runner
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Install production dependencies for Backend
COPY Backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled backend code
COPY --from=backend-builder /app/Backend/dist ./dist

# Copy built frontend SPA assets
COPY --from=frontend-builder /app/Frontend/dist ./client

# Use non-root node user for container security
USER node

EXPOSE 10000

CMD ["node", "dist/server.js"]
