# VoiceVault Desktop Client

The VoiceVault desktop application provides a powerful interface for voice recording, processing, and management on Windows, macOS, and Linux.

## Prerequisites

### Windows
- Windows 10 or later
- Node.js >= 18
- Visual Studio Build Tools
- WebRTC support
- Audio input device

### macOS
- macOS 12.0 or later
- Node.js >= 18
- Xcode Command Line Tools
- WebRTC support
- Audio input device

### Linux
- Ubuntu 20.04+ or equivalent
- Node.js >= 18
- Build essentials
- WebRTC support
- Audio input device

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your production settings:
# - API endpoint
# - API keys
# - Feature flags
```

3. Configure Electron:
```javascript
// electron/main.js
const isDev = process.env.NODE_ENV === 'development';
const appPath = isDev ? process.cwd() : process.resourcesPath;
```

## Building

### Development

1. Start development server:
```bash
pnpm run dev
```

2. Start Electron:
```bash
pnpm run electron:dev
```

### Production

1. Build web assets:
```bash
pnpm run build
```

2. Build desktop application:
```bash
# Windows
pnpm run electron:build:win

# macOS
pnpm run electron:build:mac

# Linux
pnpm run electron:build:linux
```

## Features

- High-quality voice recording
- Real-time audio processing
- Advanced audio effects
- Voice library management
- Emotion detection
- Voice analysis
- Secure storage
- Offline support
- Cross-platform compatibility

## Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm run e2e
```

### Performance Testing
```bash
pnpm run test:performance
```

## Troubleshooting

### Common Issues

1. Audio device not detected:
- Check system audio settings
- Verify WebRTC permissions
- Restart application

2. Build errors:
```bash
# Clean build
pnpm run clean
# Rebuild
pnpm run build
```

3. Electron issues:
- Clear Electron cache
- Update Electron version
- Check system requirements

## Security

- End-to-end encryption
- Secure storage
- Certificate pinning
- Secure key storage
- App signing
- Code signing
- Auto-updates

## Performance Optimization

- Memory management
- CPU optimization
- Disk I/O optimization
- Network optimization
- Cache management
- Resource cleanup

## Development Guidelines

### Code Structure
```
src/
  ├── components/     # UI components
  ├── pages/         # Page components
  ├── services/      # API and services
  ├── store/         # State management
  ├── utils/         # Utility functions
  ├── hooks/         # Custom React hooks
  ├── types/         # TypeScript types
  └── assets/        # Static assets
```

### Best Practices

1. TypeScript
- Use strict mode
- Define interfaces
- Avoid any type
- Use type guards

2. React
- Use functional components
- Implement proper error boundaries
- Follow React hooks rules
- Optimize renders

3. Electron
- Use IPC for communication
- Handle window management
- Implement proper app lifecycle
- Follow security guidelines

## Support

For desktop-specific issues:
1. Check the [desktop documentation](https://github.com/GoDeskio/ittia/wiki/Desktop)
2. Open an issue with the `desktop` label
3. Contact the desktop team at desktop@voicevault.com 