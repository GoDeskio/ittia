import axios from 'axios';

<<<<<<< HEAD
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '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';
=======
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
>>>>>>> a1853dfd1097a4a53e26cd4724fea2fe5476425c
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

interface VoiceAnalysis {
  emotion: string;
  tone: string;
  clarity: number;
  confidence: number;
}

interface ProcessContext {
  userId?: string;
  libraryId?: string | null;
  voiceAnalysis?: VoiceAnalysis;
}

export class GroqService {
  private static instance: GroqService;
  private apiKey: string;

  private constructor() {
<<<<<<< HEAD
=======
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined');
    }
>>>>>>> a1853dfd1097a4a53e26cd4724fea2fe5476425c
    this.apiKey = GROQ_API_KEY;
  }

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  /**
   * Process voice input and generate a response
   * @param input - The voice input text
   * @param context - Additional context for processing
   * @returns The generated response
   */
  public async processVoiceInput(
    input: string,
    context: ProcessContext
  ): Promise<string> {
    try {
      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: `You are a helpful voice assistant. ${
            context.voiceAnalysis
              ? `The user's voice shows ${context.voiceAnalysis.emotion} emotion and a ${context.voiceAnalysis.tone} tone.`
              : ''
          }`,
        },
        {
          role: 'user',
          content: input,
        },
      ];

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error processing voice input:', error);
      throw new Error('Failed to process voice input');
    }
  }

  /**
   * Analyze voice characteristics
   * @param audioData - Base64 encoded audio data
   * @returns Voice analysis results
   */
  public async analyzeVoice(audioData: string): Promise<VoiceAnalysis> {
    try {
      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: 'Analyze the following voice input and provide detailed characteristics.',
        },
        {
          role: 'user',
          content: `Analyze this voice data: ${audioData}`,
        },
      ];

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages,
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      return {
        emotion: analysis.emotion || 'neutral',
        tone: analysis.tone || 'neutral',
        clarity: analysis.clarity || 0,
        confidence: analysis.confidence || 0,
      };
    } catch (error) {
      console.error('Error analyzing voice:', error);
      throw new Error('Failed to analyze voice');
    }
  }
} 