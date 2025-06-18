export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface EmotionMetadata {
  primary: {
    emotion: string;
    confidence: number;
    color: string;
  };
  secondary?: {
    emotion: string;
    confidence: number;
    color: string;
  };
  intensity: number;
  variability: number;
  timeline: {
    timestamp: number;
    emotion: string;
    intensity: number;
  }[];
}

export interface BaseAudioMetadata {
  id: string;
  name: string;
  path: string;
  duration: number;
  createdAt: Date;
  status: 'processing' | 'completed' | 'error';
  format: {
    container: string;
    codec: string;
    sampleRate: number;
    channels: number;
    bitDepth?: number;
    bitRate?: number;
  };
  waveform: number[];
  duration_ms: number;
  size_bytes: number;
  transcription: {
    text: string;
    language: string;
    confidence: number;
  };
  tags: {
    recordingDevice?: string;
    environment?: string;
    speakerName?: string;
    speakerGender?: string;
    speakerAge?: number;
    emotion?: string;
    category?: string;
    notes?: string;
  };
  emotion: EmotionMetadata;
  location: GeoLocation;
}

export interface AudioFile extends BaseAudioMetadata {
  processingProgress?: number;
  wordCount?: number;
  averageWordConfidence?: number;
  noiseLevel?: number;
  segments?: {
    start: number;
    end: number;
    word: string;
    confidence: number;
  }[];
}

export interface WordFile extends BaseAudioMetadata {
  originalAudioId: string;
  word: string;
  confidence: number;
  phonemes: {
    phoneme: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  position: {
    start: number;
    end: number;
    wordIndex: number;
  };
  context: {
    previousWord?: string;
    nextWord?: string;
    sentence: string;
  };
  acousticFeatures: {
    pitch: number[];
    intensity: number[];
    formants: number[][];
    voicing: boolean[];
  };
  classification: {
    partOfSpeech: string;
    isStopWord: boolean;
    sentiment?: number;
    isFiller: boolean;
  };
} 