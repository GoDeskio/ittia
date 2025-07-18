import axios from 'axios';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

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
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    // In React Native, we'll use AsyncStorage for token management
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
      'Content-Type': 'multipart/form-data',
    };
  }

  /**
   * Set auth token (call this after login)
   */
  setAuthToken(token: string) {
    this.authToken = token;
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
  async cloneVoice(name: string, description: string, audioUris: string[]): Promise<Voice> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      for (let i = 0; i < audioUris.length; i++) {
        const uri = audioUris[i];
        const filename = `audio_${i}.wav`;
        
        // @ts-ignore - React Native FormData accepts this format
        formData.append('audioFiles', {
          uri,
          type: 'audio/wav',
          name: filename,
        });
      }

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
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/elevenlabs/text-to-speech`,
        { text, voiceId, options },
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );

      // Save blob to file system and return URI
      const filename = `tts_${Date.now()}.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Convert blob to base64 and save
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            await FileSystem.writeAsStringAsync(fileUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            resolve(fileUri);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  /**
   * Convert speech to speech with different voice
   */
  async speechToSpeech(
    audioUri: string, 
    voiceId: string, 
    options?: {
      stability?: number;
      similarity_boost?: number;
    }
  ): Promise<string> {
    try {
      const formData = new FormData();
      
      // @ts-ignore - React Native FormData accepts this format
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });
      
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

      // Save blob to file system and return URI
      const filename = `sts_${Date.now()}.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Convert blob to base64 and save
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            await FileSystem.writeAsStringAsync(fileUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            resolve(fileUri);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      console.error('Error in speech-to-speech:', error);
      throw error;
    }
  }

  /**
   * Process audio with metadata extraction
   */
  async processAudioWithMetadata(
    audioUri: string,
    location?: { latitude: number; longitude: number }
  ): Promise<{ metadata: AudioMetadata; filename: string }> {
    try {
      const formData = new FormData();
      
      // @ts-ignore - React Native FormData accepts this format
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });
      
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
  async analyzeEmotion(audioUri: string): Promise<any> {
    try {
      const formData = new FormData();
      
      // @ts-ignore - React Native FormData accepts this format
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

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
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Save audio file locally with metadata
   */
  async saveAudioWithMetadata(
    audioUri: string,
    metadata: AudioMetadata,
    filename?: string
  ): Promise<{ audioPath: string; metadataPath: string }> {
    try {
      const timestamp = Date.now();
      const audioFilename = filename || `recording_${timestamp}.wav`;
      const metadataFilename = `metadata_${timestamp}.json`;
      
      const audioPath = `${FileSystem.documentDirectory}${audioFilename}`;
      const metadataPath = `${FileSystem.documentDirectory}${metadataFilename}`;

      // Copy audio file
      await FileSystem.copyAsync({
        from: audioUri,
        to: audioPath,
      });

      // Save metadata
      await FileSystem.writeAsStringAsync(
        metadataPath,
        JSON.stringify(metadata, null, 2)
      );

      return { audioPath, metadataPath };
    } catch (error) {
      console.error('Error saving audio with metadata:', error);
      throw error;
    }
  }
}

export default new ElevenLabsService();