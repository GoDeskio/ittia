# VoiceVault Server

The VoiceVault server provides the backend infrastructure for voice recording, processing, and management services.

## Prerequisites

### System Requirements
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- FFmpeg >= 4.4
- Python >= 3.8
- GPU support (optional, for ML features)

### Dependencies
- TensorFlow (for ML features)
- OpenCV (for image processing)
- FFmpeg (for audio processing)
- PostgreSQL (for data storage)
- Redis (for caching and real-time features)

## Setup

1. Install system dependencies:

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y \
    postgresql \
    postgresql-contrib \
    redis-server \
    ffmpeg \
    python3 \
    python3-pip \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev
```

### macOS
```bash
brew update
brew install \
    postgresql \
    redis \
    ffmpeg \
    python3 \
    openssl \
    pkg-config
```

### Windows
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Install Redis from https://github.com/microsoftarchive/redis/releases
- Install FFmpeg from https://ffmpeg.org/download.html
- Install Python from https://www.python.org/downloads/

2. Configure PostgreSQL:
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE voicevault;
CREATE USER voicevault WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE voicevault TO voicevault;
\q
```

3. Configure Redis:
```bash
# Edit redis.conf
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis
```

4. Install Node.js dependencies:
```bash
pnpm install
```

5. Install Python dependencies:
```bash
pip3 install -r requirements.txt
```

6. Configure environment:
```bash
cp .env.example .env
# Edit .env with your production settings:
# - Database credentials
# - Redis credentials
# - API keys
# - Feature flags
# - ML model paths
```

## Building

### Development
```bash
pnpm run dev
```

### Production
```bash
pnpm run build
pnpm start
```

## API Documentation

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Voice Recording
- POST /api/voice/record
- GET /api/voice/list
- GET /api/voice/:id
- DELETE /api/voice/:id

### Processing
- POST /api/process/audio
- POST /api/process/emotion
- POST /api/process/transcribe

### User Management
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/settings
- PUT /api/users/settings

## Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm run test:integration
```

### Load Tests
```bash
pnpm run test:load
```

## Deployment

### Docker
```bash
# Build image
docker build -t voicevault-server .

# Run container
docker run -d \
    --name voicevault-server \
    -p 3000:3000 \
    -v /path/to/data:/app/data \
    --env-file .env \
    voicevault-server
```

### Kubernetes
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voicevault-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voicevault-server
  template:
    metadata:
      labels:
        app: voicevault-server
    spec:
      containers:
      - name: voicevault-server
        image: voicevault-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: voicevault-data
```

## Monitoring

### Health Checks
- GET /health
- GET /health/detailed

### Metrics
- GET /metrics
- Prometheus integration
- Grafana dashboards

### Logging
- Winston logger
- ELK stack integration
- Log rotation

## Security

- JWT authentication
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Security headers
- SSL/TLS configuration

## Backup Strategy

1. Database backup:
```bash
# Create backup
pg_dump -U voicevault voicevault > backup.sql

# Restore backup
psql -U voicevault voicevault < backup.sql
```

2. File storage backup:
```bash
# Backup audio files
rsync -avz /path/to/audio/files backup-server:/backup/audio/

# Backup ML models
rsync -avz /path/to/models backup-server:/backup/models/
```

## Support

For server-specific issues:
1. Check the [server documentation](https://github.com/GoDeskio/ittia/wiki/Server)
2. Open an issue with the `server` label
3. Contact the server team at server@voicevault.com 