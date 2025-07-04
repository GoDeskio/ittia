import axios from 'axios';
import { AudioFile, WordFile, EmotionMetadata, GeoLocation } from '../types/audio';

// Comprehensive Emotion color mapping
export const EmotionColors = {
  // Joy/Happiness Spectrum
  joyful: '#FFD700',          // Gold
  happy: '#FFA500',           // Orange
  elated: '#FF8C00',          // Dark Orange
  excited: '#FF7F50',         // Coral
  cheerful: '#FFB6C1',        // Light Pink
  content: '#98FB98',         // Pale Green
  satisfied: '#90EE90',       // Light Green
  pleased: '#87CEEB',         // Sky Blue
  amused: '#FFE4B5',         // Moccasin
  proud: '#DDA0DD',          // Plum

  // Love/Affection Spectrum
  loving: '#FF69B4',          // Hot Pink
  affectionate: '#FFB6C1',    // Light Pink
  romantic: '#FF1493',        // Deep Pink
  passionate: '#FF0000',      // Red
  tender: '#FFC0CB',         // Pink
  compassionate: '#FFE4E1',   // Misty Rose
  warm: '#FFA07A',           // Light Salmon

  // Surprise Spectrum
  surprised: '#00FFFF',       // Cyan
  amazed: '#E0FFFF',         // Light Cyan
  astonished: '#40E0D0',     // Turquoise
  shocked: '#48D1CC',        // Medium Turquoise
  stunned: '#7FFFD4',        // Aquamarine
  awestruck: '#B0E0E6',      // Powder Blue

  // Fear Spectrum
  fearful: '#800080',         // Purple
  scared: '#8B008B',         // Dark Magenta
  terrified: '#9400D3',      // Dark Violet
  anxious: '#9370DB',         // Medium Purple
  nervous: '#BA55D3',        // Medium Orchid
  worried: '#DDA0DD',        // Plum
  panicked: '#EE82EE',       // Violet
  stressed: '#DA70D6',       // Orchid

  // Anger Spectrum
  angry: '#FF4500',          // Red Orange
  furious: '#FF0000',        // Pure Red
  outraged: '#DC143C',       // Crimson
  irritated: '#CD5C5C',      // Indian Red
  frustrated: '#B22222',     // Fire Brick
  annoyed: '#A52A2A',        // Brown
  hostile: '#8B0000',        // Dark Red
  enraged: '#FF6347',        // Tomato

  // Sadness Spectrum
  sad: '#4682B4',            // Steel Blue
  depressed: '#36648B',      // Steel Blue 4
  melancholic: '#4B0082',    // Indigo
  gloomy: '#483D8B',         // Dark Slate Blue
  disappointed: '#6A5ACD',   // Slate Blue
  hopeless: '#7B68EE',       // Medium Slate Blue
  grieving: '#000080',       // Navy
  heartbroken: '#191970',    // Midnight Blue

  // Neutral/Calm Spectrum
  neutral: '#E0E0E0',        // Light Gray
  calm: '#87CEEB',           // Sky Blue
  relaxed: '#B0C4DE',        // Light Steel Blue
  peaceful: '#ADD8E6',       // Light Blue
  tranquil: '#B0E0E6',       // Powder Blue
  serene: '#AFEEEE',         // Pale Turquoise
  composed: '#E6E6FA',       // Lavender

  // Disgust/Aversion Spectrum
  disgusted: '#556B2F',      // Dark Olive Green
  repulsed: '#6B8E23',       // Olive Drab
  revolted: '#808000',       // Olive
  nauseated: '#698B22',      // Dark Olive Green 4
  averse: '#8FBC8F',         // Dark Sea Green

  // Confusion/Uncertainty Spectrum
  confused: '#DEB887',       // Burlywood
  puzzled: '#D2B48C',        // Tan
  uncertain: '#BC8F8F',      // Rosy Brown
  perplexed: '#F4A460',      // Sandy Brown
  hesitant: '#DAA520',       // Goldenrod
  doubtful: '#CD853F',       // Peru

  // Fatigue/Boredom Spectrum
  tired: '#708090',          // Slate Gray
  exhausted: '#778899',      // Light Slate Gray
  sleepy: '#696969',         // Dim Gray
  bored: '#A9A9A9',          // Dark Gray
  drained: '#808080',        // Gray
  lethargic: '#C0C0C0',      // Silver

  // Interest/Curiosity Spectrum
  interested: '#00CED1',     // Dark Turquoise
  curious: '#20B2AA',        // Light Sea Green
  intrigued: '#48D1CC',      // Medium Turquoise
  fascinated: '#40E0D0',     // Turquoise
  engaged: '#00FA9A',        // Medium Spring Green

  // Anticipation Spectrum
  anticipating: '#9ACD32',   // Yellow Green
  eager: '#32CD32',          // Lime Green
  expectant: '#228B22',      // Forest Green
  hopeful: '#00FF7F',        // Spring Green
  optimistic: '#3CB371',     // Medium Sea Green

  // Confidence Spectrum
  confident: '#FFD700',      // Gold
  determined: '#DAA520',     // Goldenrod
  motivated: '#B8860B',      // Dark Goldenrod
  inspired: '#BDB76B',       // Dark Khaki
  empowered: '#F0E68C',      // Khaki

  // Contemplation Spectrum
  thoughtful: '#E6E6FA',     // Lavender
  reflective: '#D8BFD8',     // Thistle
  meditative: '#DDA0DD',     // Plum
  contemplative: '#DA70D6',  // Orchid
  introspective: '#BA55D3',  // Medium Orchid

  // Social Emotions
  shy: '#FFE4E1',           // Misty Rose
  guilty: '#8B4513',        // Saddle Brown
  ashamed: '#A0522D',       // Sienna
  envious: '#006400',       // Dark Green
  jealous: '#228B22',       // Forest Green
  lonely: '#4682B4',        // Steel Blue
  grateful: '#DDA0DD',      // Plum
  nostalgic: '#DEB887',     // Burlywood

  // Complex Emotional States
  overwhelmed: '#800080',    // Purple
  vulnerable: '#DB7093',     // Pale Violet Red
  victorious: '#FFD700',     // Gold
  defeated: '#696969',       // Dim Gray
  indifferent: '#C0C0C0',   // Silver
  ambivalent: '#BDB76B',    // Dark Khaki
} as const;

export type Emotion = keyof typeof EmotionColors;

class AudioProcessingService {
  private static instance: AudioProcessingService;
  private readonly API_BASE_URL = '/api/audio';

  private constructor() {}

  public static getInstance(): AudioProcessingService {
    if (!AudioProcessingService.instance) {
      AudioProcessingService.instance = new AudioProcessingService();
    }
    return AudioProcessingService.instance;
  }

  private async getCurrentLocation(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          try {
            // Attempt to get address using reverse geocoding
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
            );

            if (response.data && response.data.address) {
              location.address = {
                street: response.data.address.road,
                city: response.data.address.city,
                state: response.data.address.state,
                country: response.data.address.country,
                postalCode: response.data.address.postcode,
              };
            }
          } catch (error) {
            console.warn('Could not fetch address details:', error);
          }

          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  // Save raw audio to cache with enhanced metadata
  public async saveToCache(audioBlob: Blob): Promise<AudioFile> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      
      // Add enhanced metadata
      const metadata = {
        format: {
          container: audioBlob.type.split('/')[1],
          size_bytes: audioBlob.size,
        },
        tags: {
          recordingDevice: navigator.userAgent,
          environment: 'web-browser',
          category: 'user-recording'
        },
        location: location,
      };
      
      formData.append('metadata', JSON.stringify(metadata));

      const response = await axios.post(`${this.API_BASE_URL}/cache`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error saving audio to cache:', error);
      throw error;
    }
  }

  // Get all cached audio files
  public async getCachedFiles(): Promise<AudioFile[]> {
    const response = await axios.get(`${this.API_BASE_URL}/cache`);
    return response.data;
  }

  // Process audio file into words with emotion detection
  public async processAudioFile(audioId: string, options?: {
    speakerName?: string;
    speakerGender?: string;
    speakerAge?: number;
    category?: string;
    notes?: string;
  }): Promise<void> {
    await axios.post(`${this.API_BASE_URL}/process/${audioId}`, {
      options,
      detectEmotion: true, // Enable emotion detection
    });
  }

  // Get all word files from the library
  public async getWordLibrary(): Promise<WordFile[]> {
    const response = await axios.get(`${this.API_BASE_URL}/library`);
    return response.data;
  }

  // Delete a cached audio file
  public async deleteCachedFile(audioId: string): Promise<void> {
    await axios.delete(`${this.API_BASE_URL}/cache/${audioId}`);
  }

  // Delete a word file from the library
  public async deleteWordFile(wordId: string): Promise<void> {
    await axios.delete(`${this.API_BASE_URL}/library/${wordId}`);
  }

  // Get processing status and progress
  public async getProcessingStatus(audioId: string): Promise<{
    status: string;
    progress: number;
    wordCount?: number;
    error?: string;
  }> {
    const response = await axios.get(`${this.API_BASE_URL}/status/${audioId}`);
    return response.data;
  }

  // Update metadata for a word file
  public async updateWordMetadata(wordId: string, metadata: Partial<WordFile>): Promise<WordFile> {
    const response = await axios.patch(`${this.API_BASE_URL}/library/${wordId}`, metadata);
    return response.data;
  }

  // Get emotion details for a specific word
  public async getWordEmotion(wordId: string): Promise<EmotionMetadata> {
    const response = await axios.get(`${this.API_BASE_URL}/library/${wordId}/emotion`);
    return response.data;
  }

  // Search word library with emotion filters
  public async searchWordLibrary(params: {
    word?: string;
    confidence?: number;
    category?: string;
    partOfSpeech?: string;
    speakerName?: string;
    emotion?: Emotion;
    emotionIntensity?: number;
    location?: {
      latitude: number;
      longitude: number;
      radiusKm: number;
    };
    startDate?: Date;
    endDate?: Date;
  }): Promise<WordFile[]> {
    const response = await axios.get(`${this.API_BASE_URL}/library/search`, { params });
    return response.data;
  }

  // Get emotion statistics for a time period
  public async getEmotionStats(params: {
    startDate: Date;
    endDate: Date;
    speakerName?: string;
    location?: {
      latitude: number;
      longitude: number;
      radiusKm: number;
    };
  }): Promise<{
    emotionDistribution: Record<Emotion, number>;
    averageIntensity: number;
    locationHeatmap: {
      latitude: number;
      longitude: number;
      emotion: Emotion;
      intensity: number;
    }[];
  }> {
    const response = await axios.get(`${this.API_BASE_URL}/stats/emotion`, { params });
    return response.data;
  }
}

export default AudioProcessingService;
export type { AudioFile, WordFile } from '../types/audio'; 