# Repository Information Overview

## Repository Summary
VoiceVault is a secure voice recording and management application with advanced AI-powered features and cross-platform synchronization. It offers end-to-end encryption, real-time voice analysis, emotion detection, and supports multiple platforms including web, desktop, and mobile.

## Repository Structure
- **client**: Web client application built with React
- **server**: Backend server built with Node.js and Express
- **mobile-client**: Mobile application built with React Native and Expo
- **desktop-client**: Desktop application built with Electron
- **shared**: Shared code and utilities used across projects
- **k8s**: Kubernetes configuration files for deployment
- **scripts**: Utility scripts for development and deployment

## Projects

### Server
**Configuration File**: server/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js 18+
**Build System**: tsc (TypeScript Compiler)
**Package Manager**: pnpm

#### Dependencies
**Main Dependencies**:
- express: ^4.18.2
- pg: ^8.11.0
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.0
- @google/generative-ai: ^0.2.0
- redis: ^4.6.7

#### Build & Installation
```bash
cd server
pnpm install
pnpm run build
pnpm start
```

#### Docker
**Dockerfile**: Dockerfile
**Image**: node:18-alpine
**Configuration**: Multi-stage build with separate build and production stages

#### Testing
**Framework**: Jest
**Test Location**: server/tests
**Run Command**:
```bash
cd server
pnpm test
```

### Web Client
**Configuration File**: client/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js 18+
**Build System**: react-scripts (Create React App)
**Package Manager**: pnpm

#### Dependencies
**Main Dependencies**:
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.10.0
- @mui/material: ^5.15.3
- axios: ^1.3.5
- styled-components: ^6.1.8

#### Build & Installation
```bash
cd client
pnpm install
pnpm run build
pnpm start
```

#### Testing
**Framework**: Jest
**Test Location**: client/src/**/*.test.tsx
**Run Command**:
```bash
cd client
pnpm test
```

### Mobile Client
**Configuration File**: mobile-client/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js 18+
**Build System**: Expo
**Package Manager**: pnpm

#### Dependencies
**Main Dependencies**:
- react-native: 0.73.4
- expo: ~50.0.6
- @react-navigation/native: ^6.1.9
- expo-av: ~13.10.5
- expo-file-system: ~16.0.5
- axios: ^1.6.7

#### Build & Installation
```bash
cd mobile-client
pnpm install
pnpm run android # or ios
```

#### Testing
**Framework**: Jest
**Test Location**: mobile-client/tests
**Run Command**:
```bash
cd mobile-client
pnpm test
```

### Desktop Client
**Configuration File**: desktop-client/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js 18+
**Build System**: Electron + React
**Package Manager**: pnpm

#### Dependencies
**Main Dependencies**:
- electron: ^28.1.0
- react: ^18.2.0
- react-dom: ^18.2.0
- @mui/material: ^5.15.3
- electron-is-dev: ^2.0.0
- electron-store: ^8.1.0

#### Build & Installation
```bash
cd desktop-client
pnpm install
pnpm run electron-pack
```

#### Testing
**Framework**: Jest (via react-scripts)
**Run Command**:
```bash
cd desktop-client
pnpm test
```

### Kubernetes Configuration
**Configuration Files**: k8s/*.yaml

#### Key Resources
**Main Files**:
- k8s/namespace.yaml
- k8s/configmap.yaml
- k8s/secrets.yaml
- k8s/deployment.yaml
- k8s/service.yaml

#### Dependency Sequencing
The Kubernetes deployment uses init containers to ensure dependencies are ready:
1. check-db-ready: Verifies PostgreSQL is available before starting the application
2. check-redis-ready: Confirms Redis is operational before starting the application
3. Main container: Starts only after all dependencies are confirmed ready

#### Usage & Operations
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## Docker Configuration
**Dockerfile**: Dockerfile
**Compose File**: docker-compose.yml
**Services**:
- postgres: PostgreSQL database (primary dependency)
- redis: Redis cache (secondary dependency)
- app: Main application container (starts after dependencies)

**Dependency Sequencing**:
The application is configured to start dependencies in the correct order:
1. PostgreSQL database (most critical)
2. Redis cache (secondary)
3. Main application (starts only after dependencies are healthy)

**Run Command**:
```bash
docker-compose up -d
```

**Health Checks**:
- Database: Checks PostgreSQL connection with pg_isready
- Redis: Verifies Redis connection with ping command
- Application: Provides /health and /health/dependencies endpoints