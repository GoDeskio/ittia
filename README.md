# VoiceVault

A secure voice recording and management application with advanced AI-powered features.

## Features

### Secure Voice Recording
- End-to-end encryption
- Secure storage
- Access control
- Voice library management
- API token authentication

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
- Mobile app
- Responsive design

### Smart Organization
- Voice library management
- QR code sharing
- API token management
- Voice library connections
- Share functionality

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

## Installation

### Server Setup

1. Clone the repository:
```bash
git clone https://github.com/GoDeskio/ittia.git
cd VoiceVault
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:migrate
```

5. Start the server:
```bash
npm start
```

### Desktop Application

1. Install dependencies:
```bash
cd client
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the application:
```bash
npm start
```

### Mobile Application

1. Install dependencies:
```bash
cd mobile-client
npm install
```

2. Build the application:
```bash
# For iOS
npm run build:ios

# For Android
npm run build:android
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
