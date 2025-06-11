# VoiceVault

A modern voice-based authentication and management system with AI-powered features.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [GitLab Setup](#gitlab-setup)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Critical Security Changes for Production](#critical-security-changes-for-production)

## Prerequisites

### Development Tools
- Node.js (v18 or later)
- npm (v8 or later)
- Git
- Docker Desktop
- kubectl CLI
- GitLab account

### Cloud Infrastructure
- Kubernetes cluster (v1.19+)
- Container Registry access
- Domain name (for production)

### Access and Credentials
- GitLab account with repository access
- Kubernetes cluster access credentials
- Container registry credentials

## Local Development Setup

1. Clone the repository:
```bash
git clone https://gitlab.com/your-username/voicevault.git
cd voicevault
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install
cd ..

# Install server dependencies
cd server && npm install
cd ..

# Install shared dependencies
cd shared && npm install
cd ..
```

3. Set up environment variables:
```bash
# Copy example env files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Start development servers:
```bash
# Start all services
npm run dev
```

## Docker Setup

1. Build and run with Docker Compose (development):
```bash
# Build and start services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

2. Build production image:
```bash
docker build -t voicevault:latest .
```

## GitLab Setup

1. Create a new GitLab repository:
   - Go to GitLab.com
   - Click "New Project"
   - Choose "Create blank project"
   - Name it "voicevault"
   - Set visibility level (recommended: Private)

2. Push existing repository:
```bash
git remote add gitlab https://gitlab.com/your-username/voicevault.git
git push -u gitlab main
```

3. Set up GitLab Container Registry:
   - Navigate to your project's "Packages & Registries" > "Container Registry"
   - Note down the registry path

4. Configure GitLab CI/CD Variables:
   - Go to Settings > CI/CD > Variables
   - Add the following variables:
     - `KUBE_CONFIG` (Base64 encoded kubeconfig file)
     - `DOCKER_REGISTRY_USER`
     - `DOCKER_REGISTRY_PASSWORD`
     - `DOCKER_REGISTRY_URL`
     - `DATABASE_URL`
     - `REDIS_URL`

## Kubernetes Deployment

1. Create Kubernetes namespace:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Create secrets:
```bash
# Create base64 encoded secrets
echo -n 'your-database-url' | base64
echo -n 'your-redis-url' | base64

# Update k8s/secrets.yaml with encoded values
kubectl apply -f k8s/secrets.yaml
```

3. Deploy application:
```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verify deployment
kubectl get pods -n voicevault
kubectl get services -n voicevault
```

## CI/CD Pipeline

Create `.gitlab-ci.yml` in your repository:

```yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_REGISTRY: $DOCKER_REGISTRY_URL
  DOCKER_IMAGE: $DOCKER_REGISTRY_URL/$CI_PROJECT_PATH

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $DOCKER_REGISTRY_USER -p $DOCKER_REGISTRY_PASSWORD $DOCKER_REGISTRY
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
    - docker tag $DOCKER_IMAGE:$CI_COMMIT_SHA $DOCKER_IMAGE:latest
    - docker push $DOCKER_IMAGE:latest

test:
  stage: test
  image: node:18-alpine
  script:
    - npm install
    - npm run test

deploy:
  stage: deploy
  image: 
    name: bitnami/kubectl:latest
    entrypoint: ['']
  script:
    - echo "$KUBE_CONFIG" | base64 -d > kubeconfig.yaml
    - export KUBECONFIG=kubeconfig.yaml
    - kubectl apply -f k8s/namespace.yaml
    - kubectl apply -f k8s/secrets.yaml
    - |
      cat <<EOF > k8s/deployment.yaml
      $(cat k8s/deployment.yaml | sed "s|voicevault:latest|$DOCKER_IMAGE:$CI_COMMIT_SHA|g")
      EOF
    - kubectl apply -f k8s/deployment.yaml
    - kubectl apply -f k8s/service.yaml
  only:
    - main
```

## Monitoring and Maintenance

### Health Checks
Monitor application health:
```bash
# Check pod status
kubectl get pods -n voicevault

# View pod logs
kubectl logs -f <pod-name> -n voicevault

# Check service status
kubectl get services -n voicevault
```

### Scaling
Scale the application:
```bash
# Scale replicas
kubectl scale deployment voicevault -n voicevault --replicas=5

# Auto-scaling (if configured)
kubectl get hpa -n voicevault
```

### Updates and Rollbacks
```bash
# Update deployment
kubectl set image deployment/voicevault voicevault=$DOCKER_IMAGE:new-tag -n voicevault

# Rollback deployment
kubectl rollout undo deployment/voicevault -n voicevault
```

## Architecture

The application consists of several components:
- Frontend (React.js)
- Backend API (Node.js/Express)
- PostgreSQL database
- Redis cache
- Voice processing services
- AI conversation services

### System Requirements
- CPU: Minimum 2 cores recommended
- Memory: Minimum 4GB RAM
- Storage: 20GB+ for application and databases
- Network: Stable internet connection with minimum 10Mbps

## Support and Documentation

For additional support:
- Check the [GitLab repository issues](https://gitlab.com/your-username/voicevault/issues)
- Review the [API Documentation](./docs/api.md)
- Contact the development team

## License

[Your License Type] - See LICENSE file for details

## Critical Security Changes for Production

Before deploying to production, the following security issues must be addressed:

### Client-Side Security Issues

1. High Severity:
   - Package: `svgo` (SVG optimization tool)
   - Issue: Inefficient Regular Expression Complexity in `nth-check`
   - Impact: Potential ReDoS (Regular Expression Denial of Service) attacks
   - Fix: Update `svgo` and its dependencies when a patched version is available

2. Moderate Severity:
   - Package: `postcss` (< 8.4.31)
   - Issue: Line return parsing vulnerability
   - Fix: Update to latest version when compatible with other dependencies

3. Moderate Severity:
   - Package: `webpack-dev-server`
   - Issue: Potential source code exposure in non-Chromium browsers
   - Fix: Update to latest version when compatible

### Server-Side Security Issues

1. Low Severity:
   - Packages: `brace-expansion`, `minimatch`, and TypeScript/ESLint related tools
   - Issue: Regular Expression Denial of Service vulnerabilities
   - Impact: Development tools only, no production impact
   - Fix: Update development dependencies when compatible versions are available

### Security Recommendations

1. Production Deployment:
   - Use `npm ci` instead of `npm install` to ensure exact dependency versions
   - This prevents automatic updates to potentially vulnerable packages

2. Dependency Management:
   - Create a separate task to test dependency updates
   - Test thoroughly in staging environment before production updates
   - Keep track of security advisories for critical dependencies

3. Regular Audits:
   - Run `npm audit` regularly to check for new vulnerabilities
   - Document all known issues and their mitigation strategies
   - Prioritize fixing high and moderate severity issues

4. Build Process:
   - Ensure production builds exclude development dependencies
   - Use proper environment variables for production configuration
   - Implement Content Security Policy (CSP) headers
