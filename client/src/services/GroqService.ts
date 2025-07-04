import axios from 'axios';

// Groq API configuration
<<<<<<< HEAD
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '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';
=======
const GROQ_API_KEY = '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';
>>>>>>> a1853dfd1097a4a53e26cd4724fea2fe5476425c
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';

// Interface for Groq chat message
interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Interface for Groq response
interface GroqResponse {
  id: string;
  choices: Array<{
    message: GroqMessage;
    finish_reason: string;
  }>;
}

/**
 * GroqService
 * Handles interactions with the Groq API for voice inference and chat completions
 */
class GroqService {
  private static instance: GroqService;
  private headers: Record<string, string>;

  private constructor() {
    this.headers = {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get singleton instance of GroqService
   */
  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  /**
   * Process voice input and get AI response
   * @param voiceInput - The transcribed voice input
   * @param context - Additional context for the conversation
   * @returns Promise with the AI response
   */
  public async processVoiceInput(
    voiceInput: string,
    context?: {
      voiceLibrary?: string;
      previousMessages?: GroqMessage[];
    }
  ): Promise<string> {
    try {
      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: `You are a voice assistant specialized in voice analysis and processing. 
                   You have access to the user's voice library: ${context?.voiceLibrary || 'Not specified'}.
                   Provide clear, concise responses focused on voice-related queries.`
        },
        ...(context?.previousMessages || []),
        {
          role: 'user',
          content: voiceInput
        }
      ];

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.95,
          stream: false
        },
        { headers: this.headers }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error processing voice input with Groq:', error);
      throw new Error('Failed to process voice input');
    }
  }

  /**
   * Analyze voice characteristics
   * @param audioData - Base64 encoded audio data
   * @returns Promise with voice analysis results
   */
  public async analyzeVoice(audioData: string): Promise<{
    emotion: string;
    tone: string;
    clarity: number;
    confidence: number;
  }> {
    try {
      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'Analyze the following voice data and provide detailed characteristics.'
            },
            {
              role: 'user',
              content: `Analyze this voice data: ${audioData}`
            }
          ],
          temperature: 0.3,
          max_tokens: 256
        },
        { headers: this.headers }
      );

      // Parse the response to extract voice characteristics
      const analysis = JSON.parse(response.data.choices[0].message.content);
      return {
        emotion: analysis.emotion || 'neutral',
        tone: analysis.tone || 'neutral',
        clarity: analysis.clarity || 0.8,
        confidence: analysis.confidence || 0.9
      };
    } catch (error) {
      console.error('Error analyzing voice with Groq:', error);
      throw new Error('Failed to analyze voice');
    }
  }
}

export default GroqService; 