# VoiceVault

A secure voice recording and management application with advanced AI-powered features and cross-platform synchronization. Built with a modern microservices architecture using NestJS as the dominant framework, with hybrid Express.js integration for specific services.

## Features

### Secure Voice Recording
- End-to-end encryption
- Secure storage
- Access control
- Voice library management
- API token authentication
- Cross-platform synchronization

### Advanced Audio Processing
- Real-time voice analysis
- Emotion detection
- Tone analysis
- Clarity assessment
- Confidence scoring
- Groq AI integration for improved inference
- Voice library integration

### Cross-Platform Support
- Web application
- Desktop client
- Mobile app (iOS & Android)
- Responsive design
- Automatic data synchronization
- Offline support

### Smart Organization
- Voice library management
- QR code sharing
- API token management
- Voice library connections
- Share functionality
- Cross-platform data sync

## Architecture

### Microservices Architecture
VoiceVault is built using a modern microservices architecture with:

- **NestJS** - Primary framework for most services (authentication, voice processing, AI analysis)
- **Express.js** - Legacy services and specific lightweight endpoints
- **Hybrid Approach** - Seamless integration between NestJS and Express.js services
- **Service Communication** - RESTful APIs and event-driven architecture
- **Containerized Deployment** - Docker and Kubernetes support

### Framework Stack

#### Backend Services
- **NestJS** ^10.0.0 - Primary microservices framework
- **Express.js** ^4.21.2 - Legacy services and lightweight endpoints
- **TypeScript** ^5.7.2 - Primary programming language
- **Node.js** 18+ - Runtime environment

#### Frontend Applications
- **React** ^18.3.1 - Web and desktop client framework
- **React Native** 0.73.4 - Mobile application framework
- **Expo** ~50.0.17 - Mobile development platform
- **Electron** - Desktop application wrapper

#### Database & Storage
- **PostgreSQL** ^8.13.1 - Primary relational database
- **MongoDB** (Mongoose ^8.9.3) - Document storage for specific services
- **Redis** - Caching and session management

#### AI/ML & Processing
- **TensorFlow.js** ^4.22.0 - Machine learning and voice analysis
- **Google AI** - Advanced voice processing services
- **Groq AI** - Real-time inference and analysis

## System Requirements

### Server Infrastructure
- Node.js 18+
- PostgreSQL 12+
- MongoDB 4.4+
- Redis 6+
- Docker & Kubernetes (recommended)
- 8GB RAM minimum (microservices)
- 50GB storage minimum

### Desktop Application
- Windows 10/11, macOS 10.15+, or Linux
- 4GB RAM minimum
- WebRTC support
- Audio input device

### Mobile Application
- iOS 13+ or Android 8+
- Camera and microphone permissions
- Biometric authentication support
- 2GB RAM minimum
- 500MB free storage

## Installation

### Prerequisites
- Node.js 18+
- pnpm 8.0+
- Docker (recommended)
- PostgreSQL 12+
- MongoDB 4.4+
- Redis 6+

### Full Stack Setup

1. Clone the repository:
```bash
git clone https://github.com/GoDeskio/ittia.git
cd ittia
```

2. Install all dependencies:
```bash
pnpm install:all
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Microservices Deployment

#### Using Docker Compose (Recommended)
```bash
# Start all services including databases
docker-compose up -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Manual Service Setup

1. **Database Setup:**
```bash
# PostgreSQL setup
pnpm run db:migrate

# MongoDB setup (if using document services)
pnpm run db:seed
```

2. **Start NestJS Services:**
```bash
# Main NestJS application
cd server
pnpm run start:nest

# Development mode with hot reload
pnpm run start:nest:dev
```

3. **Start Express.js Services:**
```bash
# Legacy Express services
cd server
pnpm run start:express

# Or start minimal Express server
pnpm run start:minimal
```

4. **Start All Backend Services:**
```bash
# Start both NestJS and Express services
pnpm run start:all
```

### Frontend Applications

#### Web Client (React)
```bash
cd client
pnpm install
pnpm run build
pnpm start
```

#### Desktop Application (Electron + React)
```bash
cd desktop-client
pnpm install
pnpm run build
pnpm run electron
```

#### Mobile Application (React Native + Expo)
```bash
cd mobile-client
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Development
pnpm run start
pnpm run android  # or ios

# Production builds
pnpm run build:android
pnpm run build:ios
```

### Development Commands

#### Root Level Commands
```bash
# Install all project dependencies
pnpm install:all

# Build all applications
pnpm run build

# Run development servers
pnpm run dev

# Run tests across all projects
pnpm run test

# Clean all build artifacts
pnpm run clean
```

#### Service-Specific Commands
```bash
# NestJS services
pnpm run dev:nest
pnpm run build:nest
pnpm run test:nest

# Express services
pnpm run dev:express
pnpm run build:express
pnpm run test:express

# Frontend applications
pnpm run dev:client
pnpm run dev:desktop
pnpm run dev:mobile
```

## Voice Analysis Features

### Groq AI Integration
- Powered by Mixtral-8x7b-32768 model
- Real-time voice processing
- Context-aware responses
- Voice library integration
- Emotion and tone analysis

### Voice Characteristics Analysis
- Emotion detection
- Tone analysis
- Clarity assessment
- Confidence scoring
- Volume level monitoring

### Voice Library Integration
- QR code sharing
- API token management
- Secure connections
- Library access control
- Cross-platform compatibility

## Cross-Platform Synchronization

### Mobile to Desktop Sync
- Automatic data synchronization
- Offline support
- Background sync
- Conflict resolution
- Local file cleanup

### Sync Features
- Voice recording sync
- Library management sync
- Profile data sync
- Metadata preservation
- Secure transfer

### Offline Capabilities
- Local storage
- Queue management
- Automatic retry
- Network status monitoring
- Data consistency

## API Integration

### Microservices API Architecture

#### Authentication Service API
- **JWT Token Management** - Secure token generation and validation
- **Role-Based Access Control** - User permissions and roles
- **OAuth Integration** - Third-party authentication providers
- **API Key Management** - Service-to-service authentication
- **Session Management** - User session handling

#### Voice Processing Service API
- **Audio Upload** - Multi-format audio file processing
- **Real-time Analysis** - Live voice processing
- **Emotion Detection** - AI-powered emotion analysis
- **Voice Characteristics** - Tone, clarity, confidence scoring
- **Batch Processing** - Multiple file processing

#### Voice Library Service API
- **Library Management** - Create, update, delete voice libraries
- **Access Control** - Permission-based library access
- **QR Code Generation** - Shareable library links
- **Cross-platform Sync** - Data synchronization across devices
- **Search & Filter** - Advanced library search capabilities

#### AI Analysis Service API
- **TensorFlow Integration** - Machine learning model execution
- **Groq AI Processing** - Advanced inference and analysis
- **Custom Model Support** - User-defined analysis models
- **Real-time Inference** - Live AI processing
- **Batch Analysis** - Bulk data processing

### API Gateway Features
- **Request Routing** - Intelligent service routing
- **Load Balancing** - Traffic distribution across services
- **Rate Limiting** - API usage control
- **Request/Response Transformation** - Data format conversion
- **Monitoring & Analytics** - API usage tracking
- **Security Policies** - Centralized security enforcement

### Service Discovery
- **Dynamic Registration** - Automatic service registration
- **Health Monitoring** - Service availability tracking
- **Circuit Breaker** - Fault tolerance patterns
- **Retry Logic** - Automatic request retry
- **Fallback Mechanisms** - Graceful degradation

## Security

### Data Protection
- End-to-end encryption
- Secure storage
- Access control
- API token security
- Voice data protection

### Authentication
- JWT tokens
- API key management
- Biometric support
- Session management
- Role-based access

## Technology Stack & Dependencies

### Backend Services

#### NestJS Microservices (Primary)
- **NestJS** ^10.0.0 - Primary framework for microservices
- **TypeScript** ^5.7.2 - Programming language
- **Class Validator** - Input validation
- **Class Transformer** - Data transformation
- **Passport** - Authentication strategies
- **JWT** - Token-based authentication
- **Swagger** - API documentation

#### Express.js Services (Legacy/Hybrid)
- **Express.js** ^4.21.2 - Web framework
- **bcryptjs** ^2.4.3 - Password hashing
- **jsonwebtoken** ^9.0.2 - JWT tokens
- **helmet** ^8.0.0 - Security headers
- **cors** ^2.8.5 - Cross-origin requests
- **express-rate-limit** ^7.4.1 - Rate limiting
- **compression** ^1.7.5 - Response compression
- **morgan** ^1.10.0 - HTTP logging

#### Database & Storage
- **PostgreSQL** (pg ^8.13.1) - Primary relational database
- **MongoDB** (mongoose ^8.9.3) - Document storage
- **Redis** ^4.6.7 - Caching and sessions
- **TypeORM** - Database ORM for NestJS services

#### AI/ML & Processing
- **TensorFlow.js** (@tensorflow/tfjs-node ^4.22.0) - Machine learning
- **Google Auth Library** ^9.15.0 - Google services
- **Axios** ^1.7.9 - HTTP client for external APIs

#### File Processing
- **Multer** ^1.4.5-lts.1 - File upload handling
- **UUID** ^11.0.3 - Unique identifier generation

### Frontend Applications

#### Web Client (React)
- **React** ^18.3.1 - Frontend framework
- **React DOM** ^18.3.1 - DOM rendering
- **React Router DOM** ^6.28.0 - Client-side routing
- **TypeScript** ^5.7.2 - Programming language
- **Material-UI (MUI)** ^6.2.0 - Component library
  - @mui/icons-material ^6.2.0
  - @mui/lab 6.0.0-beta.17
  - @mui/x-tree-view ^8.7.0
- **Emotion** ^11.13.5 - CSS-in-JS styling
- **Styled Components** ^6.1.13 - CSS-in-JS styling
- **Axios** ^1.7.9 - HTTP client
- **date-fns** ^4.1.0 - Date utilities

#### Desktop Client (Electron)
- **Electron** - Desktop app framework
- **React** ^18.2.0 - Frontend framework
- **React DOM** ^18.2.0 - DOM rendering
- **Material-UI (MUI)** ^5.15.0 - Component library
- **Emotion** ^11.11.0 - CSS-in-JS styling
- **TypeScript** ^4.9.5 - Programming language

#### Mobile Client (React Native + Expo)
- **React Native** 0.73.4 - Mobile framework
- **Expo** ~50.0.17 - Development platform
- **React** 18.3.1 - Base React library
- **TypeScript** ^5.7.2 - Programming language
- **React Navigation** ^6.1.18 - Navigation library
  - @react-navigation/stack ^6.4.1
  - @react-navigation/bottom-tabs ^6.6.1
- **React Native Paper** ^5.12.5 - Material Design components
- **React Native Vector Icons** ^10.2.0 - Icon library
- **Expo AV** ~13.10.6 - Audio/video handling
- **Expo File System** ~16.0.9 - File operations
- **Expo Secure Store** ~12.8.1 - Secure storage
- **Expo Local Authentication** ~13.8.0 - Biometric auth
- **AsyncStorage** 2.1.0 - Local storage
- **Axios** ^1.7.9 - HTTP client

### Development & Testing

#### Build Tools
- **Create React App** (react-scripts 5.0.1) - React build toolchain
- **TypeScript Compiler** - TypeScript compilation
- **Expo CLI** - Mobile development tools
- **ESLint** ^9.17.0 - Code linting
- **Prettier** - Code formatting

#### Testing Frameworks
- **Jest** ^29.7.0 - Testing framework (all platforms)
- **React Testing Library** ^16.1.0 - React component testing
- **React Native Testing Library** ^12.8.1 - React Native testing
- **Supertest** - API endpoint testing
- **ts-jest** ^29.2.5 - TypeScript Jest integration

#### Package Management
- **pnpm** ^8.15.0 - Package manager
- **pnpm workspaces** - Monorepo management

### DevOps & Deployment

#### Containerization
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **Kubernetes** - Container orchestration

#### CI/CD
- **GitLab CI** - Continuous integration
- **GitHub Actions** - Automated workflows

### Service Communication
- **REST APIs** - HTTP-based service communication
- **WebSocket** - Real-time communication
- **Event-driven Architecture** - Microservice communication
- **API Gateway** - Service routing and management

## Microservices Architecture

### Service Organization

#### NestJS Services (Primary)
1. **Authentication Service** - User management, JWT tokens, role-based access
2. **Voice Processing Service** - Audio analysis, emotion detection, AI processing
3. **Voice Library Service** - Voice data management, library operations
4. **AI Analysis Service** - TensorFlow.js integration, Groq AI processing
5. **File Management Service** - Upload, storage, and retrieval operations
6. **Notification Service** - Real-time notifications and alerts
7. **Sync Service** - Cross-platform data synchronization

#### Express.js Services (Legacy/Hybrid)
1. **API Gateway** - Request routing and load balancing
2. **Health Check Service** - System monitoring and health endpoints
3. **Static File Service** - Asset serving and CDN integration
4. **Legacy Endpoints** - Backward compatibility for existing integrations

### Service Communication Patterns

#### Inter-Service Communication
- **HTTP/REST** - Synchronous service-to-service calls
- **Message Queues** - Asynchronous event processing
- **Event Bus** - Publish/subscribe pattern for loose coupling
- **Service Discovery** - Dynamic service registration and discovery

#### Data Management
- **Database per Service** - Each service owns its data
- **Shared Database** - Common data accessed by multiple services
- **Event Sourcing** - Audit trail and state reconstruction
- **CQRS** - Command Query Responsibility Segregation

### Deployment Architecture

#### Container Strategy
```yaml
# Docker Compose Services
services:
  # Databases
  postgres:
    image: postgres:15
  mongodb:
    image: mongo:6
  redis:
    image: redis:7
  
  # NestJS Services
  auth-service:
    build: ./server/auth
  voice-service:
    build: ./server/voice
  ai-service:
    build: ./server/ai
  
  # Express Services
  api-gateway:
    build: ./server/gateway
  legacy-service:
    build: ./server/legacy
  
  # Frontend Applications
  web-client:
    build: ./client
  desktop-client:
    build: ./desktop-client
```

#### Kubernetes Deployment
- **Namespace Isolation** - Separate environments
- **Service Mesh** - Advanced traffic management
- **Auto-scaling** - Dynamic resource allocation
- **Load Balancing** - Traffic distribution
- **Health Checks** - Service monitoring

## Monitoring & Observability

### Application Monitoring
- **Health Checks** - Service availability monitoring
- **Metrics Collection** - Performance and usage metrics
- **Distributed Tracing** - Request flow across services
- **Log Aggregation** - Centralized logging system
- **Error Tracking** - Exception monitoring and alerting

### Performance Monitoring
- **Response Time Tracking** - API performance metrics
- **Resource Usage** - CPU, memory, and disk monitoring
- **Database Performance** - Query optimization and monitoring
- **Cache Hit Rates** - Redis performance tracking
- **AI Model Performance** - ML inference monitoring

### Business Metrics
- **User Activity** - Voice recording and analysis usage
- **Service Adoption** - Feature usage analytics
- **Error Rates** - Service reliability metrics
- **Sync Performance** - Cross-platform synchronization metrics

## Development Workflow

### Local Development Setup
1. **Prerequisites Installation** - Node.js, pnpm, Docker
2. **Environment Configuration** - Database setup, API keys
3. **Service Startup** - NestJS and Express services
4. **Frontend Development** - React applications
5. **Testing** - Unit, integration, and e2e tests

### Microservices Development
1. **Service Creation** - NestJS service scaffolding
2. **API Design** - OpenAPI/Swagger documentation
3. **Database Schema** - Migration and seeding
4. **Testing Strategy** - Service-specific testing
5. **Integration Testing** - Cross-service testing

### Deployment Pipeline
1. **Code Quality** - ESLint, Prettier, TypeScript checks
2. **Testing** - Automated test execution
3. **Build Process** - Docker image creation
4. **Deployment** - Kubernetes or Docker Compose
5. **Monitoring** - Health checks and alerting

## Contributing

### Development Guidelines
1. **Fork the repository** and create a feature branch
2. **Follow coding standards** - ESLint, Prettier configuration
3. **Write comprehensive tests** - Unit and integration tests
4. **Update documentation** - API docs and README updates
5. **Submit pull request** with detailed description

### Microservices Contribution
1. **Service Architecture** - Follow NestJS best practices
2. **API Documentation** - Swagger/OpenAPI specifications
3. **Database Changes** - Migration scripts and rollback plans
4. **Testing Requirements** - Service and integration tests
5. **Performance Considerations** - Load testing and optimization

### Code Review Process
1. **Automated Checks** - CI/CD pipeline validation
2. **Peer Review** - Code quality and architecture review
3. **Security Review** - Security best practices validation
4. **Performance Review** - Performance impact assessment
5. **Documentation Review** - Technical documentation updates

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
