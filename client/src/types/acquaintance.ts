export interface Acquaintance {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  voiceProfile?: {
    samples: number;
    lastUpdated: Date;
    confidence: number;
  };
  recordings: {
    total: number;
    byEmotion: Record<string, number>;
  };
  metadata?: {
    notes?: string;
    relationship?: string;
    tags?: string[];
  };
}

export interface UnknownVoiceRecording {
  id: string;
  audioFileId: string;
  recordedAt: Date;
  duration: number;
  confidence: number;
  acquaintanceId?: string;
  emotion?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  acquaintanceIds: string[];
  subfolders?: Folder[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
} 