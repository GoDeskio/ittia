export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface EmotionMetadata {
  emotion: string;
  confidence: number;
  timestamp: number;
  intensity?: number;
  valence?: number;
  arousal?: number;
}

export interface AudioFile {
  _id: string;
  id: string; // For compatibility
  filename: string;
  originalName: string;
  name: string; // Display name
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
  channels: number;
  bitrate: number;
  createdAt: string;
  updatedAt: string;
  processed: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  emotions?: EmotionMetadata[];
  location?: GeoLocation;
  tags?: string[];
  transcription?: string;
  userId: string;
  path: string;
  url?: string;
}

export interface WordFile {
  _id: string;
  id: string; // For compatibility
  filename: string;
  originalName: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  path: string;
  url?: string;
  content?: string;
  wordCount?: number;
  language?: string;
  tags?: string[];
  word: string;
  confidence: number;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: string;
}

export interface AudioAnalysis {
  emotions: EmotionMetadata[];
  transcription?: string;
  keywords?: string[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  audioFeatures?: {
    tempo?: number;
    pitch?: number;
    volume?: number;
    spectralCentroid?: number;
  };
}