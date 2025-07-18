import { ElevenLabs } from 'elevenlabs';
import * as fs from 'fs';
import * as path from 'path';
import * as wav from 'node-wav';
import ffmpeg from 'fluent-ffmpeg';
import Sentiment from 'sentiment';
import compromise from 'compromise';
import * as geoip from 'geoip-lite';

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
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  timestamp: Date;
}

interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  words: WordMetadata[];
  overallEmotion: any;
  recordingLocation?: any;
  recordingTime: Date;
}

export class ElevenLabsService {
  private client: ElevenLabs;
  private sentimentAnalyzer: Sentiment;

  constructor() {
    this.client = new ElevenLabs({
      apiKey: process.env.ELEVENLABS_API_KEY || '',
    });
    this.sentimentAnalyzer = new Sentiment();
  }

  /**
   * Get all available voices from Eleven Labs
   */
  async getVoices() {
    try {
      const voices = await this.client.voices.getAll();
      return voices.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Clone a voice from audio samples
   */
  async cloneVoice(name: string, description: string, audioFiles: Buffer[]) {
    try {
      // Convert audio files to the required format
      const processedFiles = await Promise.all(
        audioFiles.map(async (buffer, index) => {
          const tempPath = path.join(__dirname, `temp_audio_${index}.wav`);
          fs.writeFileSync(tempPath, buffer);
          return tempPath;
        })
      );

      const voice = await this.client.voices.add({
        name,
        description,
        files: processedFiles.map(filePath => fs.createReadStream(filePath)),
      });

      // Clean up temporary files
      processedFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      return voice;
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using a specific voice
   */
  async textToSpeech(text: string, voiceId: string, options?: any) {
    try {
      const audio = await this.client.generate({
        voice: voiceId,
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options?.stability || 0.5,
          similarity_boost: options?.similarity_boost || 0.5,
          style: options?.style || 0.0,
          use_speaker_boost: options?.use_speaker_boost || true,
        },
      });

      return audio;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  /**
   * Perform speech-to-speech conversion
   */
  async speechToSpeech(audioBuffer: Buffer, voiceId: string, options?: any) {
    try {
      const tempInputPath = path.join(__dirname, 'temp_input.wav');
      fs.writeFileSync(tempInputPath, audioBuffer);

      const audio = await this.client.speechToSpeech({
        voice_id: voiceId,
        audio: fs.createReadStream(tempInputPath),
        model_id: 'eleven_english_sts_v2',
        voice_settings: {
          stability: options?.stability || 0.5,
          similarity_boost: options?.similarity_boost || 0.5,
        },
      });

      // Clean up
      if (fs.existsSync(tempInputPath)) {
        fs.unlinkSync(tempInputPath);
      }

      return audio;
    } catch (error) {
      console.error('Error in speech-to-speech:', error);
      throw error;
    }
  }

  /**
   * Process audio file and extract word-level metadata
   */
  async processAudioWithMetadata(
    audioBuffer: Buffer,
    clientIP?: string,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<AudioMetadata> {
    try {
      // Parse WAV file
      const wavData = wav.decode(audioBuffer);
      
      // Get location data
      let locationData;
      if (userLocation) {
        locationData = userLocation;
      } else if (clientIP) {
        const geoData = geoip.lookup(clientIP);
        if (geoData) {
          locationData = {
            latitude: geoData.ll[0],
            longitude: geoData.ll[1],
            city: geoData.city,
            country: geoData.country,
          };
        }
      }

      // Convert audio to text with timestamps (placeholder - would need actual speech-to-text service)
      const transcription = await this.transcribeWithTimestamps(audioBuffer);
      
      // Analyze sentiment and emotions for each word
      const wordsWithMetadata: WordMetadata[] = await Promise.all(
        transcription.words.map(async (wordData: any) => {
          const emotionAnalysis = this.analyzeWordEmotion(wordData.word);
          
          return {
            word: wordData.word,
            startTime: wordData.start,
            endTime: wordData.end,
            confidence: wordData.confidence,
            emotion: emotionAnalysis,
            location: locationData,
            timestamp: new Date(),
          };
        })
      );

      // Overall emotion analysis
      const fullText = transcription.words.map((w: any) => w.word).join(' ');
      const overallEmotion = this.sentimentAnalyzer.analyze(fullText);

      return {
        duration: wavData.sampleRate ? wavData.channelData[0].length / wavData.sampleRate : 0,
        sampleRate: wavData.sampleRate,
        channels: wavData.channelData.length,
        words: wordsWithMetadata,
        overallEmotion,
        recordingLocation: locationData,
        recordingTime: new Date(),
      };
    } catch (error) {
      console.error('Error processing audio metadata:', error);
      throw error;
    }
  }

  /**
   * Analyze emotion for a single word
   */
  private analyzeWordEmotion(word: string) {
    const sentimentResult = this.sentimentAnalyzer.analyze(word);
    const doc = compromise(word);
    
    // Basic emotion mapping based on sentiment and word analysis
    const emotions = {
      joy: Math.max(0, sentimentResult.score / 5),
      sadness: Math.max(0, -sentimentResult.score / 5),
      anger: doc.has('#Negative') ? 0.7 : 0.1,
      fear: doc.has('#Emotion') && sentimentResult.score < -2 ? 0.6 : 0.1,
      surprise: doc.has('#Exclamation') ? 0.8 : 0.1,
      disgust: sentimentResult.score < -3 ? 0.5 : 0.1,
    };

    return {
      sentiment: sentimentResult.score,
      emotions,
    };
  }

  /**
   * Placeholder for speech-to-text with timestamps
   * In production, integrate with services like Google Speech-to-Text, Azure Speech, etc.
   */
  private async transcribeWithTimestamps(audioBuffer: Buffer) {
    // This is a placeholder implementation
    // In production, you would integrate with a real speech-to-text service
    return {
      words: [
        { word: 'placeholder', start: 0, end: 1, confidence: 0.95 },
        { word: 'transcription', start: 1, end: 2, confidence: 0.92 },
      ],
    };
  }

  /**
   * Save processed audio with metadata
   */
  async saveAudioWithMetadata(
    audioBuffer: Buffer,
    metadata: AudioMetadata,
    filename: string
  ) {
    try {
      const audioPath = path.join(__dirname, '../../uploads/audio', `${filename}.wav`);
      const metadataPath = path.join(__dirname, '../../uploads/metadata', `${filename}.json`);

      // Ensure directories exist
      const audioDir = path.dirname(audioPath);
      const metadataDir = path.dirname(metadataPath);
      
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
      }

      // Save audio file
      fs.writeFileSync(audioPath, audioBuffer);

      // Save metadata
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      return {
        audioPath,
        metadataPath,
      };
    } catch (error) {
      console.error('Error saving audio with metadata:', error);
      throw error;
    }
  }

  /**
   * Get voice library with custom voices
   */
  async getVoiceLibrary() {
    try {
      const voices = await this.getVoices();
      return {
        premadeVoices: voices.filter((v: any) => v.category === 'premade'),
        clonedVoices: voices.filter((v: any) => v.category === 'cloned'),
        generatedVoices: voices.filter((v: any) => v.category === 'generated'),
      };
    } catch (error) {
      console.error('Error fetching voice library:', error);
      throw error;
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string) {
    try {
      await this.client.voices.delete(voiceId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  }
}

export default ElevenLabsService;