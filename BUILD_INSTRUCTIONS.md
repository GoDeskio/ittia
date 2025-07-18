# VoiceVault Build Instructions

## Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **Git**: For version control
3. **PostgreSQL**: For database (optional for frontend-only builds)
4. **ElevenLabs API Key**: Sign up at [elevenlabs.io](https://elevenlabs.io/)

## Environment Setup

Create `.env` files in each application directory:

### Server (.env)
```
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/voicevault
JWT_SECRET=your-jwt-secret-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### Desktop (.env)
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## Build Process

### 1. Server Build
```bash
cd server
npm install --legacy-peer-deps
npm run build
npm start
```

### 2. Client Build
```bash
cd client
npm install --legacy-peer-deps
npm run build
npm start
```

### 3. Mobile Build (requires Expo CLI)
```bash
npm install -g @expo/cli
cd mobile-client
npm install --legacy-peer-deps
expo start
```

### 4. Desktop Build
```bash
cd desktop-client
npm install --legacy-peer-deps
npm run electron-pack
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Run as administrator on Windows
2. **Port Conflicts**: Change ports in .env files
3. **Memory Issues**: Increase Node.js memory: `export NODE_OPTIONS="--max-old-space-size=4096"`
4. **Dependency Conflicts**: Use `--legacy-peer-deps` flag

### Build Verification:

After successful builds, you should see:
- `server/dist/` - Compiled server code
- `client/build/` - Static web assets
- `mobile-client/` - Expo development server
- `desktop-client/dist/` - Electron executables

## ElevenLabs Integration Features

✅ **Voice Cloning**: Clone voices from audio samples
✅ **Speech-to-Speech**: Convert recordings to different voices  
✅ **Emotion Detection**: Word-level emotion analysis
✅ **Location Tracking**: GPS coordinates per word
✅ **Metadata Storage**: Comprehensive audio metadata
✅ **Cross-Platform**: Web, mobile, desktop support

## Support

If builds continue to fail:
1. Check Node.js version: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Try yarn instead: `yarn install`
4. Check system dependencies (Python, build tools)
5. Review full error logs for specific issues
