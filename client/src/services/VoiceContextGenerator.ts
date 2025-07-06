import axios from 'axios';

export interface VoiceContext {
  pitch: number;
  tempo: number;
  timbre: string;
  emotionalTone: string;
  clarity: number;
  accent: string;
  speechPatterns: {
    pauseFrequency: number;
    wordEmphasis: string[];
    rhythm: string;
  };
  voiceCharacteristics: {
    depth: number;
    warmth: number;
    brightness: number;
    roughness: number;
  };
}

export interface VoiceGenerationParams {
  baseVoice: string;
  emotionalContext: string;
  speedMultiplier: number;
  pitchAdjustment: number;
  clarity: number;
  customParameters?: Record<string, any>;
}

export const VoiceContextGenerator = {
  async analyzeVoiceSample(audioBlob: Blob): Promise<VoiceContext> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await axios.post('/api/voice/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing voice sample:', error);
      throw error;
    }
  },

  async generateVoiceContext(params: VoiceGenerationParams): Promise<VoiceContext> {
    try {
      const response = await axios.post('/api/voice/generate-context', params);
      return response.data;
    } catch (error) {
      console.error('Error generating voice context:', error);
      throw error;
    }
  },

  async matchVoiceCharacteristics(sourceContext: VoiceContext, targetText: string): Promise<Blob> {
    try {
      const response = await axios.post('/api/voice/match-characteristics', {
        sourceContext,
        targetText,
      }, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error matching voice characteristics:', error);
      throw error;
    }
  },

  async blendVoiceContexts(contexts: VoiceContext[], weights: number[]): Promise<VoiceContext> {
    try {
      const response = await axios.post('/api/voice/blend-contexts', {
        contexts,
        weights,
      });

      return response.data;
    } catch (error) {
      console.error('Error blending voice contexts:', error);
      throw error;
    }
  },

  async generateEmotionalVariant(
    baseContext: VoiceContext,
    emotion: string,
    intensity: number
  ): Promise<VoiceContext> {
    try {
      const response = await axios.post('/api/voice/emotional-variant', {
        baseContext,
        emotion,
        intensity,
      });

      return response.data;
    } catch (error) {
      console.error('Error generating emotional variant:', error);
      throw error;
    }
  },
};

export default VoiceContextGenerator; 