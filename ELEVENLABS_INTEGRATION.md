# ElevenLabs Integration Guide

This document provides comprehensive information about the ElevenLabs integration in VoiceVault, including voice cloning, speech-to-speech conversion, emotion detection, and metadata extraction.

## Features

### 🎤 Voice Recording & Processing
- High-quality audio recording with real-time visualization
- Automatic audio format conversion and optimization
- Word-level timestamp extraction
- Silence detection and audio segmentation

### 🧬 Voice Cloning
- Clone voices from audio samples (1-10 files recommended)
- Manage personal voice library
- Delete and organize cloned voices
- Preview voice samples before use

### 🔄 Speech-to-Speech Conversion
- Convert recorded speech to any available voice
- Real-time voice transformation
- Batch processing capabilities
- Quality settings adjustment (stability, similarity boost)

### 😊 Emotion Detection
- Word-level emotion analysis (joy, sadness, anger, fear, surprise, disgust)
- Overall sentiment scoring (-5 to +5 scale)
- Real-time emotion visualization
- Historical emotion tracking

### 📍 Location & Metadata
- GPS location tracking for each recording
- Timestamp recording for every word
- Confidence scores for speech recognition
- Comprehensive metadata storage

## Setup Instructions

### 1. Environment Configuration

#### Server (.env)
```bash
# ElevenLabs API Key (Required)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/voicevault

# Audio Processing Settings
AUDIO_SAMPLE_RATE=44100
AUDIO_CHANNELS=1
AUDIO_FORMAT=wav
MAX_FILE_SIZE=50MB

# Feature Flags
ENABLE_EMOTION_ANALYSIS=true
ENABLE_LOCATION_TRACKING=true
```

#### Client (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Feature Flags
REACT_APP_ENABLE_VOICE_CLONING=true
REACT_APP_ENABLE_EMOTION_ANALYSIS=true
REACT_APP_ENABLE_LOCATION_TRACKING=true
REACT_APP_ENABLE_SPEECH_TO_SPEECH=true

# Audio Settings
REACT_APP_MAX_RECORDING_DURATION=300
REACT_APP_AUDIO_SAMPLE_RATE=44100
```

#### Mobile (.env)
```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001

# Feature Flags
EXPO_PUBLIC_ENABLE_VOICE_CLONING=true
EXPO_PUBLIC_ENABLE_EMOTION_ANALYSIS=true
EXPO_PUBLIC_ENABLE_LOCATION_TRACKING=true

# Location Settings
EXPO_PUBLIC_LOCATION_ACCURACY=high
EXPO_PUBLIC_LOCATION_TIMEOUT=10000
```

### 2. Database Setup

Run the migration to create the necessary tables:

```sql
-- Run the migration file
\i server/src/migrations/004_create_audio_metadata_tables.sql
```

This creates the following tables:
- `audio_recordings` - Basic audio file information
- `audio_metadata` - Overall recording metadata
- `word_metadata` - Word-level analysis data
- `cloned_voices` - Voice cloning management
- `voice_conversions` - Speech-to-speech conversion history

### 3. Install Dependencies

#### Server
```bash
cd server
npm install
```

#### Web Client
```bash
cd client
npm install
```

#### Mobile Client
```bash
cd mobile-client
npm install
```

#### Desktop Client
```bash
cd desktop-client
npm install
```

## API Endpoints

### Voice Management
- `GET /api/elevenlabs/voices` - Get all available voices
- `GET /api/elevenlabs/voice-library` - Get organized voice library
- `POST /api/elevenlabs/clone-voice` - Clone a new voice
- `DELETE /api/elevenlabs/voice/:voiceId` - Delete a cloned voice

### Audio Processing
- `POST /api/elevenlabs/text-to-speech` - Convert text to speech
- `POST /api/elevenlabs/speech-to-speech` - Convert speech to different voice
- `POST /api/elevenlabs/process-audio` - Process audio with metadata extraction
- `POST /api/elevenlabs/analyze-emotion` - Analyze emotion in audio

## Usage Examples

### 1. Recording Audio with Metadata

```typescript
import ElevenLabsService from './services/ElevenLabsService';

// Record audio with location and emotion analysis
const handleRecording = async (audioBlob: Blob) => {
  const audioFile = new File([audioBlob], 'recording.wav');
  const location = await ElevenLabsService.getCurrentLocation();
  
  const result = await ElevenLabsService.processAudioWithMetadata(
    audioFile,
    location
  );
  
  console.log('Metadata:', result.metadata);
  // Access word-level emotions, timestamps, location data
};
```

### 2. Voice Cloning

```typescript
// Clone a voice from audio samples
const cloneVoice = async (name: string, audioFiles: File[]) => {
  const clonedVoice = await ElevenLabsService.cloneVoice(
    name,
    'My custom voice description',
    audioFiles
  );
  
  console.log('Cloned voice ID:', clonedVoice.voice_id);
};
```

### 3. Speech-to-Speech Conversion

```typescript
// Convert recorded speech to different voice
const convertSpeech = async (audioFile: File, targetVoiceId: string) => {
  const convertedAudio = await ElevenLabsService.speechToSpeech(
    audioFile,
    targetVoiceId,
    {
      stability: 0.5,
      similarity_boost: 0.5
    }
  );
  
  // Play converted audio
  const audioUrl = URL.createObjectURL(convertedAudio);
  const audio = new Audio(audioUrl);
  audio.play();
};
```

### 4. Emotion Analysis

```typescript
// Analyze emotions in recorded audio
const analyzeEmotions = async (audioFile: File) => {
  const emotionData = await ElevenLabsService.analyzeEmotion(audioFile);
  
  // Access word-level emotions
  emotionData.wordLevelEmotions.forEach(wordEmotion => {
    console.log(`Word: ${wordEmotion.word}`);
    console.log(`Dominant emotion: ${wordEmotion.emotion.dominantEmotion}`);
    console.log(`Sentiment: ${wordEmotion.emotion.sentiment}`);
  });
};
```

## Components

### Web Client Components

#### AudioRecorder
Enhanced audio recorder with ElevenLabs integration:
```typescript
<AudioRecorder
  onRecordingComplete={(blob, metadata) => {
    // Handle recording with metadata
  }}
  enableElevenLabs={true}
  enableMetadata={true}
/>
```

#### VoiceLibraryManager
Manage cloned voices and voice library:
```typescript
<VoiceLibraryManager />
```

#### AudioMetadataViewer
Display detailed audio analysis results:
```typescript
<AudioMetadataViewer
  metadata={audioMetadata}
  audioUrl={audioUrl}
  onPlayWord={(word) => {
    // Play specific word segment
  }}
/>
```

### Mobile Components

#### RecordScreen
Enhanced mobile recording screen with AI features:
- Voice selection for conversion
- Real-time emotion analysis
- Location tracking
- Metadata visualization

## Data Structure

### AudioMetadata
```typescript
interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  words: WordMetadata[];
  overallEmotion: {
    score: number;
    comparative: number;
  };
  recordingLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  recordingTime: Date;
}
```

### WordMetadata
```typescript
interface WordMetadata {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
  emotion: {
    sentiment: number;
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
      disgust: number;
    };
  };
  location?: LocationData;
  timestamp: Date;
}
```

## Performance Considerations

### Audio Processing
- Large audio files are automatically chunked for processing
- Background processing prevents UI blocking
- Temporary files are automatically cleaned up
- Audio compression reduces storage requirements

### Database Optimization
- Indexed columns for fast queries
- JSONB storage for flexible metadata
- Partitioned tables for large datasets
- Automatic cleanup of old recordings

### Caching
- Voice library cached locally
- Metadata cached for quick access
- Audio segments cached for playback
- Location data cached to reduce API calls

## Troubleshooting

### Common Issues

#### 1. ElevenLabs API Key Issues
```bash
Error: Unauthorized - Invalid API key
```
**Solution:** Verify your ElevenLabs API key in the environment variables.

#### 2. Audio Format Issues
```bash
Error: Unsupported audio format
```
**Solution:** Ensure audio files are in supported formats (WAV, MP3, M4A).

#### 3. Location Permission Issues
```bash
Error: Location access denied
```
**Solution:** Enable location permissions in browser/mobile app settings.

#### 4. Database Connection Issues
```bash
Error: Failed to connect to database
```
**Solution:** Verify database URL and run migrations.

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Server
DEBUG=elevenlabs:* npm start

# Client
REACT_APP_DEBUG_MODE=true npm start

# Mobile
EXPO_PUBLIC_DEBUG_MODE=true expo start
```

## Security Considerations

### API Key Management
- Store API keys in environment variables
- Use different keys for development/production
- Rotate keys regularly
- Monitor API usage

### Data Privacy
- Location data is optional and user-controlled
- Audio files are encrypted at rest
- Metadata is anonymized when possible
- GDPR compliance for EU users

### Rate Limiting
- API calls are rate-limited to prevent abuse
- Batch processing for multiple files
- Queue system for heavy processing
- Graceful degradation when limits reached

## Contributing

When contributing to the ElevenLabs integration:

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Consider performance implications
5. Test across all platforms (web, mobile, desktop)

## Support

For issues related to ElevenLabs integration:

1. Check the troubleshooting section
2. Review the API documentation
3. Test with minimal examples
4. Check ElevenLabs service status
5. Create detailed bug reports with logs

## License

This integration follows the same license as the main VoiceVault project.