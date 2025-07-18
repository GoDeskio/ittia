# Thumbnails Directory

This directory contains thumbnail images for the mobile application.

## Purpose
- Store thumbnail images for voice recordings
- Store preview images for audio files
- Store user profile thumbnails
- Store any other small preview images used in the mobile UI

## Supported Formats
- PNG
- JPG/JPEG
- WebP
- SVG (for icons)

## Naming Convention
- Use descriptive names: `voice-recording-thumbnail.png`
- Use kebab-case for file names
- Include dimensions if multiple sizes: `profile-64x64.png`, `profile-128x128.png`
- Consider different screen densities: `@2x`, `@3x` suffixes for high-DPI displays

## Usage
Import thumbnails in React Native components:
```typescript
import thumbnailImage from '../assets/thumbnails/example-thumbnail.png';

// Or use require for dynamic imports
const thumbnailSource = require('../assets/thumbnails/example-thumbnail.png');
```

## Mobile Considerations
- Optimize images for mobile devices (smaller file sizes)
- Consider different screen densities and provide multiple resolutions
- Use appropriate compression to balance quality and performance