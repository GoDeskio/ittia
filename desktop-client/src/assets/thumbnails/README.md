# Thumbnails Directory

This directory contains thumbnail images for the desktop application.

## Purpose
- Store thumbnail images for voice recordings
- Store preview images for audio files
- Store user profile thumbnails
- Store any other small preview images used in the desktop UI

## Supported Formats
- PNG
- JPG/JPEG
- WebP
- SVG (for icons)

## Naming Convention
- Use descriptive names: `voice-recording-thumbnail.png`
- Use kebab-case for file names
- Include dimensions if multiple sizes: `profile-64x64.png`, `profile-128x128.png`

## Usage
Import thumbnails in React components:
```typescript
import thumbnailImage from '../assets/thumbnails/example-thumbnail.png';
```