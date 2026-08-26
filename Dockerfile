# Dockerfile for ACEssment Catherine - Fly.io Deployment
# Multi-stage build optimized for pnpm workspaces

ARG NODE_VERSION=20

# Stage 1: Base image with pnpm
FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@9
WORKDIR /app

# Stage 2: Install dependencies ONLY for library + catherine
FROM base AS deps
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./

# Copy only library + generator-panel + catherine package.json
COPY packages/library/package.json ./packages/library/
COPY packages/generator-panel/package.json ./packages/generator-panel/
COPY packages/catherine/package.json ./packages/catherine/

# Install dependencies ONLY for library + generator-panel + catherine
RUN --mount=type=secret,id=GIT_MANAGE_NPM_TOKEN \
  export GIT_MANAGE_NPM_TOKEN=$(cat /run/secrets/GIT_MANAGE_NPM_TOKEN) && \
  pnpm install --frozen-lockfile --filter @acessment/core-oes --filter @acessment/generator-panel --filter @acessment/catherine

# Stage 3: Build the library and catherine
FROM base AS builder
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./

# Copy ONLY library + generator-panel + catherine source code
COPY packages/library/ ./packages/library/
COPY packages/generator-panel/ ./packages/generator-panel/
COPY packages/catherine/ ./packages/catherine/

# Copy node_modules ONLY for library + generator-panel + catherine
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/library/node_modules ./packages/library/node_modules
COPY --from=deps /app/packages/generator-panel/node_modules ./packages/generator-panel/node_modules
COPY --from=deps /app/packages/catherine/node_modules ./packages/catherine/node_modules

# Accept build-time arguments for VITE_* environment variables
ARG VITE_REACT_BASE_URL
ARG VITE_APIDOMAIN
ARG VITE_API_ENDPOINT
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_EMAIL_DOMAIN
ARG VITE_AUTH_DOMAIN
ARG VITE_S3_PUBLIC_URL
ARG VITE_ENCRYPTION_SECRET_KEY

# Set environment variables
ENV REACT_BASE_URL=$REACT_BASE_URL \
  VITE_REACT_BASE_URL=$VITE_REACT_BASE_URL \
  VITE_APIDOMAIN=$VITE_APIDOMAIN \
  VITE_API_ENDPOINT=$VITE_API_ENDPOINT \
  VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
  VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
  VITE_EMAIL_DOMAIN=$VITE_EMAIL_DOMAIN \
  VITE_AUTH_DOMAIN=$VITE_AUTH_DOMAIN \
  VITE_S3_PUBLIC_URL=$VITE_S3_PUBLIC_URL \
  VITE_ENCRYPTION_SECRET_KEY=$VITE_ENCRYPTION_SECRET_KEY 

# Build library and generator-panel first, then catherine
RUN --mount=type=secret,id=GIT_MANAGE_NPM_TOKEN \
  export GIT_MANAGE_NPM_TOKEN=$(cat /run/secrets/GIT_MANAGE_NPM_TOKEN) && \
  pnpm --filter @acessment/generator-panel build && \
  pnpm --filter @acessment/core-oes build && \
  pnpm --filter @acessment/catherine build

# Debug: Show what was built
RUN echo "=== Built catherine ===" && \
  ls -la packages/catherine/build/ || echo "No build output found"

# Stage 4: Production runtime
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
  PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 reactrouter && \
  apk add --no-cache wget

# Copy workspace configuration files (needed for pnpm workspace context)
COPY --from=builder --chown=reactrouter:nodejs /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=reactrouter:nodejs /app/package.json ./

# Copy FULL node_modules with .pnpm store (preserves all symlinks and workspace structure)
COPY --from=deps --chown=reactrouter:nodejs /app/node_modules ./node_modules

# Copy library package (built output + package.json)
COPY --from=builder --chown=reactrouter:nodejs /app/packages/library/dist ./packages/library/dist
COPY --from=builder --chown=reactrouter:nodejs /app/packages/library/package.json ./packages/library/package.json

# Copy generator-panel package (built output + package.json)
COPY --from=builder --chown=reactrouter:nodejs /app/packages/generator-panel/dist ./packages/generator-panel/dist
COPY --from=builder --chown=reactrouter:nodejs /app/packages/generator-panel/package.json ./packages/generator-panel/package.json

# Copy catherine package (build output + package.json + public + node_modules symlinks)
COPY --from=builder --chown=reactrouter:nodejs /app/packages/catherine/build ./packages/catherine/build
COPY --from=builder --chown=reactrouter:nodejs /app/packages/catherine/public ./packages/catherine/public
COPY --from=builder --chown=reactrouter:nodejs /app/packages/catherine/package.json ./packages/catherine/package.json
COPY --from=deps --chown=reactrouter:nodejs /app/packages/catherine/node_modules ./packages/catherine/node_modules

# Change to catherine directory (where package.json and build output are)
WORKDIR /app/packages/catherine

# Switch to non-root user
USER reactrouter

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application using the workspace-relative binary path
CMD ["node_modules/.bin/react-router-serve", "./build/server/server/index.js"]
