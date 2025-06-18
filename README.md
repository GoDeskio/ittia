# VoiceVault

VoiceVault is a comprehensive voice recording and management system with desktop and mobile applications. It provides secure storage, real-time transcription, and advanced audio processing capabilities.

## Features

- **Secure Voice Recording**
  - End-to-end encryption
  - Biometric authentication
  - Secure cloud storage
  - Automatic backup

- **Advanced Audio Processing**
  - Real-time transcription
  - Noise reduction
  - Voice enhancement
  - Multiple format support

- **Cross-Platform Support**
  - Desktop application (Windows, macOS, Linux)
  - Mobile application (iOS, Android)
  - Web interface

- **Smart Organization**
  - Automatic categorization
  - Searchable transcripts
  - Tags and folders
  - Cloud sync

## System Requirements

### Desktop Application
- Node.js >= 18.0.0
- Windows 10/11, macOS 10.15+, or Linux
- 4GB RAM minimum
- 1GB free disk space

### Mobile Application
- iOS 13.0+ or Android 8.0+
- 2GB RAM minimum
- 500MB free storage

### Server
- Node.js >= 18.0.0
- PostgreSQL 14+
- Redis 6+
- 4GB RAM minimum
- 10GB free disk space

## Installation

### Server Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize the database:
```bash
npm run db:init
```

4. Start the server:
```bash
npm run dev
```

### Desktop Application

1. Install dependencies:
```bash
cd desktop-client
npm run install-deps
```

2. Start the application:
```bash
# Development
npm run electron-dev

# Production build
npm run electron-pack
```

### Mobile Application

1. Install dependencies:
```bash
cd mobile-client
npm run install-deps
```

2. Start the application:
```bash
# iOS
npm run ios

# Android
npm run android
```

### GitLab Setup

1. Run the GitLab setup script:
```bash
cd mobile-client/android
./setup-gitlab.ps1
```

2. Configure GitLab CI/CD variables:
   - Go to your GitLab project settings
   - Navigate to Settings > CI/CD > Variables
   - Add the following variables:
     - `ANDROID_SIGNING_KEY`: Your base64 encoded keystore
     - `ANDROID_SIGNING_PASSWORD`: Your keystore password

3. Push your code to GitLab:
```bash
cd mobile-client/android
./push-to-gitlab.ps1
```

## Dependency Management

The project includes a robust dependency management system:

### Desktop and Mobile Applications

Both applications support the following dependency management commands:

```bash
# Install dependencies
npm run install-deps

# Validate dependency versions
npm run validate-deps

# Update dependencies
npm run update-deps

# Check for security vulnerabilities
npm run check-security
```

The dependency manager ensures:
- Node.js version compatibility
- Clean dependency installation
- Proper lock file generation
- Security vulnerability checks
- Platform-specific requirements

## Development

### Project Structure

```
voicevault/
├── server/                 # Backend server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── tests/             # Server tests
├── desktop-client/        # Desktop application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── tests/             # Desktop tests
├── mobile-client/         # Mobile application
│   ├── src/
│   │   ├── components/    # React Native components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── tests/             # Mobile tests
└── scripts/               # Shared scripts
    └── dependency-manager.js  # Dependency management
```

### Testing

```bash
# Server tests
cd server
npm test

# Desktop tests
cd desktop-client
npm test

# Mobile tests
cd mobile-client
npm test
```

### Building

```bash
# Desktop application
cd desktop-client
npm run electron-pack

# Mobile application
cd mobile-client
# iOS
npm run ios
# Android
npm run android
```

## Security

- End-to-end encryption for all voice recordings
- Secure authentication with biometric support
- Regular security audits
- Automatic vulnerability checks
- Secure cloud storage with encryption at rest

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
