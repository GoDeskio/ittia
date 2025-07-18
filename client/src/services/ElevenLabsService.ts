import axios from 'axios';

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface VoiceLibrary {
  premadeVoices: Voice[];
  clonedVoices: Voice[];
  generatedVoices: Voice[];
}

export interface WordMetadata {
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
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  timestamp: Date;
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  words: WordMetadata[];
  overallEmotion: any;
  recordingLocation?: any;
  recordingTime: Date;
}

export class ElevenLabsService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.authToken = localStorage.getItem('authToken');
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }

  private getMultipartHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
    };
  }

  /**
   * Get all available voices
   */
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/elevenlabs/voices`, {
        headers: this.getHeaders(),
      });
      return response.data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Get organized voice library
   */
  async getVoiceLibrary(): Promise<VoiceLibrary> {
    try {
      const response = await axios.get(`${this.baseURL}/api/elevenlabs/voice-library`, {
        headers: this.getHeaders(),
      });
      return response.data.library;
    } catch (error) {
      console.error('Error fetching voice library:', error);
      throw error;
    }
  }

  /**
   * Clone a voice from audio files
   */
  async cloneVoice(name: string, description: string, audioFiles: File[]): Promise<Voice> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      audioFiles.forEach((file, index) => {
        formData.append('audioFiles', file);
      });

      const response = await axios.post(
        `${this.baseURL}/api/elevenlabs/clone-voice`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );

      return response.data.voice;
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(
    text: string, 
    voiceId: string, 
    options?: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
    }
  ): Promise<Blob> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/elevenlabs/text-to-speech`,
        { text, voiceId, options },
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  /**
   * Convert speech to speech with different voice
   */
  async speechToSpeech(
    audioFile: File, 
    voiceId: string, 
    options?: {
      stability?: number;
      similarity_boost?: number;
    }
  ): Promise<Blob> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('voiceId', voiceId);
      formData.append('options', JSON.stringify(options || {}));

      const response = await axios.post(
        `${this.baseURL}/api/elevenlabs/speech-to-speech`,
        formData,
        {
          headers: this.getMultipartHeaders(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in speech-to-speech:', error);
      throw error;
    }
  }

  /**
   * Process audio with metadata extraction
   */
  async processAudioWithMetadata(
    audioFile: File,
    location?: { latitude: number; longitude: number }
  ): Promise<{ metadata: AudioMetadata; filename: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      const response = await axios.post(
        `${this.baseURL}/api/elevenlabs/process-audio`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );

      return {
        metadata: response.data.metadata,
        filename: response.data.filename,
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/elevenlabs/voice/${voiceId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  }

  /**
   * Analyze emotion in audio
   */
  async analyzeEmotion(audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await axios.post(
        `${this.baseURL}/api/elevenlabs/analyze-emotion`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );

      return response.data.emotionData;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      throw error;
    }
  }

  /**
   * Get current location for metadata
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Update auth token
   */
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear auth token
   */
  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }
}

export default new ElevenLabsService();