export interface EmotionAnalysis {
  id: string;
  userId: string;
  word: string;
  audioUrl: string;
  qrCodeUrl: string;
  emotion: 'angry' | 'happy' | 'neutral' | 'sad';
  confidence: number;
  color: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  apiToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmotionMetadata {
  word: string;
  emotion: string;
  color: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  apiToken: string;
  qrCode: string;
} 