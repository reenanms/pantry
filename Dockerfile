# ===========================================
# Pantry — Docker Image
# Multi-stage build: frontend + backend
# ===========================================

# --- Stage 1: Build frontend ---
FROM node:22-alpine AS frontend-build

WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# --- Stage 2: Build backend ---
FROM node:22-alpine AS backend-build

WORKDIR /app/api
COPY api/package.json api/package-lock.json ./
RUN npm ci
COPY api/ ./
RUN npx tsc

# --- Stage 3: Production ---
FROM node:22-alpine

WORKDIR /app

# Install production deps only
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled backend
COPY --from=backend-build /app/api/dist ./dist

# Copy built frontend into a static directory
COPY --from=frontend-build /app/web/dist ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment defaults
ENV PORT=6150
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/pantry.db

EXPOSE 6150

# Volume for persistent database
VOLUME ["/app/data"]

CMD ["node", "dist/index.js"]
