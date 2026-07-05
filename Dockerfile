# ══════════════════════════════════════════════════════════════
# ZyraTech Hub — Multi-stage Dockerfile
# Optimized for production: small image, fast builds, secure
# ══════════════════════════════════════════════════════════════

# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20 AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine
RUN apt-get update -y && apt-get install -y openssl libssl-dev

# Copy package files first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript → JavaScript
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────
FROM node:20 AS production

WORKDIR /app

# Install OpenSSL for Prisma engine at runtime
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN groupadd -g 1001 zyratech && \
    useradd -m -u 1001 -g zyratech zyratech

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma Client in production image
RUN npx prisma generate

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist

# Copy seed script for initial setup
COPY prisma/seed.js ./prisma/seed.js

# Set ownership
RUN chown -R zyratech:zyratech /app

# Switch to non-root user
USER zyratech

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
# Prisma migrations are handled by docker-compose command
CMD ["node", "dist/index.js"]
