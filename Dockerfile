# ===========================================
# Pantry — Docker Image
# Multi-stage build: frontend + backend
# ===========================================

# --- Stage 1: Build frontend ---
FROM node:22-alpine AS frontend-build

# A variável precisa estar NESTE stage para o Vite conseguir ler no 'npm run build'!
ARG API_URL
ENV API_URL=$API_URL

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

# Install production deps + static server
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev && npm install -g serve

# Copy compiled backend
COPY --from=backend-build /app/api/dist ./dist

# Copy built frontend into a static directory
COPY --from=frontend-build /app/web/dist ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment defaults
ENV API_PORT=3000
ENV API_HOST=0.0.0.0
ENV API_DB_PATH=/app/data/pantry.db

EXPOSE 3000
EXPOSE 80

# Volume for persistent database
VOLUME ["/app/data"]

# Run both: API and Frontend
CMD ["sh", "-c", "serve -s public -l 80 & node dist/index.js"]
