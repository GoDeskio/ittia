# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml ./
COPY client/pnpm-lock.yaml ./client/ 2>/dev/null || true
COPY server/pnpm-lock.yaml ./server/ 2>/dev/null || true
COPY shared/pnpm-lock.yaml ./shared/ 2>/dev/null || true

# Install dependencies
RUN pnpm install
RUN cd client && pnpm install
RUN cd server && pnpm install
RUN cd shared && pnpm install

# Copy source code
COPY . .

# Build applications
RUN pnpm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install PostgreSQL client and Redis CLI for health checks
RUN apk add --no-cache postgresql-client redis

# Install pnpm in production stage
RUN npm install -g pnpm

# Copy built artifacts and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/server/pnpm-lock.yaml ./server/ 2>/dev/null || true
COPY --from=builder /app/client/pnpm-lock.yaml ./client/ 2>/dev/null || true
COPY --from=builder /app/scripts/wait-for-dependencies.sh ./scripts/wait-for-dependencies.sh

# Make the startup script executable
RUN chmod +x ./scripts/wait-for-dependencies.sh

# Install production dependencies only
RUN pnpm install --prod
RUN cd server && pnpm install --prod

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application with dependency checking
CMD ["./scripts/wait-for-dependencies.sh", "pnpm", "start"]