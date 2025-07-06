# VoiceVault Mobile Client

A React Native mobile application for VoiceVault, featuring voice recording, analysis, and cross-platform synchronization.

## Features

### Voice Recording
- High-quality audio capture
- Real-time voice analysis
- Emotion detection
- Tone analysis
- Clarity assessment
- Confidence scoring

### Voice Library Management
- Create and manage voice libraries
- QR code sharing
- API token management
- Library access control
- Cross-platform sync

### Cross-Platform Synchronization
- Automatic data sync with desktop
- Offline support
- Background sync
- Conflict resolution
- Local file cleanup

### Security
- End-to-end encryption
- Secure storage
- API token management
- Biometric authentication
- Session management

## System Requirements

- iOS 13+ or Android 8+
- Camera and microphone permissions
- Biometric authentication support
- 2GB RAM minimum
- 500MB free storage

## Installation

1. Install dependencies:
```bash
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

## Dependencies

### Core
- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage

### UI Components
- React Native Paper
- Expo Vector Icons
- React Native Gesture Handler
- React Native Reanimated

### Audio & Media
- Expo AV
- Expo FileSystem
- Expo MediaLibrary
- Expo ImagePicker

### Networking & Sync
- Axios
- NetInfo
- Expo FileSystem
- AsyncStorage

### Authentication & Security
- Expo SecureStore
- Expo LocalAuthentication
- JWT Decode

### Development
- TypeScript
- ESLint
- Prettier
- Jest
- React Native Testing Library

## Project Structure

```
mobile-client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
│   ├── services/         # API and service integrations
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript type definitions
│   └── constants/        # Application constants
├── assets/               # Static assets
├── App.tsx              # Root component
└── package.json         # Dependencies and scripts
```

## Key Components

### VirtualAssistant
- Voice recording and analysis
- Real-time voice processing
- Chat interface
- Voice library integration
- Cross-platform sync

### VoiceLibrarySelector
- Library management
- QR code sharing
- API token display
- Access control
- Sync integration

### SyncService
- Data synchronization
- Offline support
- Queue management
- Conflict resolution
- File cleanup

## Development

### Running the App
```bash
# Start Expo development server
pnpm start

# Run on iOS simulator
pnpm run ios

# Run on Android emulator
pnpm run android
```

### Testing
```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm run e2e
```

### Building
```bash
# Build for iOS
pnpm run build:ios

# Build for Android
pnpm run build:android
```

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