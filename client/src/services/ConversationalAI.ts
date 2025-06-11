import axios from 'axios';
import { VoiceContext } from './VoiceContextGenerator';

export interface ConversationContext {
  topic: string;
  mood: string;
  previousMessages: Message[];
  userPreferences: {
    conversationStyle: string;
    responseLength: 'short' | 'medium' | 'long';
    formality: 'casual' | 'neutral' | 'formal';
    creativity: number; // 0-1
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  voiceContext?: VoiceContext;
  emotionalContext?: {
    emotion: string;
    intensity: number;
  };
}

export interface ConversationResponse {
  message: Message;
  suggestedResponses: string[];
  voiceContext: VoiceContext;
}

export const ConversationalAI = {
  async initializeConversation(context: Partial<ConversationContext>): Promise<ConversationContext> {
    try {
      const response = await axios.post('/api/conversation/initialize', context);
      return response.data;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw error;
    }
  },

  async generateResponse(
    message: string,
    context: ConversationContext,
    voiceContext?: VoiceContext
  ): Promise<ConversationResponse> {
    try {
      const response = await axios.post('/api/conversation/generate', {
        message,
        context,
        voiceContext,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  },

  async analyzeConversationContext(messages: Message[]): Promise<ConversationContext> {
    try {
      const response = await axios.post('/api/conversation/analyze', { messages });
      return response.data;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      throw error;
    }
  },

  async generateContextualResponses(
    context: ConversationContext,
    prompt: string,
    count: number = 3
  ): Promise<string[]> {
    try {
      const response = await axios.post('/api/conversation/suggestions', {
        context,
        prompt,
        count,
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  },

  async adjustResponseStyle(
    message: string,
    style: {
      tone?: string;
      formality?: 'casual' | 'neutral' | 'formal';
      length?: 'short' | 'medium' | 'long';
    }
  ): Promise<string> {
    try {
      const response = await axios.post('/api/conversation/adjust-style', {
        message,
        style,
      });
      return response.data.adjustedMessage;
    } catch (error) {
      console.error('Error adjusting response style:', error);
      throw error;
    }
  },

  async generateEmotionalResponse(
    baseMessage: string,
    emotion: string,
    intensity: number
  ): Promise<{
    message: string;
    voiceContext: VoiceContext;
  }> {
    try {
      const response = await axios.post('/api/conversation/emotional-response', {
        message: baseMessage,
        emotion,
        intensity,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating emotional response:', error);
      throw error;
    }
  },
};

export default ConversationalAI; 