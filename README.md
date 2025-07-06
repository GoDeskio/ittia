# VoiceVault

A secure voice recording and management application with advanced AI-powered features and cross-platform synchronization.

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

## System Requirements

### Server
- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- 4GB RAM minimum
- 20GB storage minimum

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

### Server Setup

1. Clone the repository:
```bash
git clone https://github.com/GoDeskio/ittia.git
cd VoiceVault
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
pnpm run db:migrate
```

5. Start the server:
```bash
pnpm start
```

### Desktop Application

1. Install dependencies:
```bash
cd client
pnpm install
```

2. Build the application:
```bash
pnpm run build
```

3. Start the application:
```bash
pnpm start
```

### Mobile Application

1. Install dependencies:
```bash
cd mobile-client
pnpm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration:
# - API URL
# - Groq API Key
# - Other required keys
```

3. Build the application:
```bash
# For iOS
pnpm run build:ios

# For Android
pnpm run build:android
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

### Authentication
- API token generation
- Secure token storage
- Token visibility control
- Token refresh mechanism

### Voice Library API
- Library creation
- Access management
- Voice data storage
- Analysis integration
- Sharing capabilities

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

## Dependencies

### Server
- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- Express.js
- Socket.IO
- JWT

### Desktop Client
- Electron
- React
- TypeScript
- WebRTC
- Material-UI

### Mobile Client
- React Native
- Expo
- TypeScript
- AsyncStorage
- NetInfo
- Expo AV
- Expo FileSystem

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
