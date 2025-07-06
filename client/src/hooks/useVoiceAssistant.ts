import { useState, useCallback } from 'react';
import VoiceContextGenerator, { VoiceContext, VoiceGenerationParams } from '../services/VoiceContextGenerator';
import ConversationalAI, { 
  ConversationContext, 
  Message, 
  ConversationResponse 
} from '../services/ConversationalAI';

interface UseVoiceAssistantProps {
  initialContext?: Partial<ConversationContext>;
  voiceParams?: Partial<VoiceGenerationParams>;
}

export const useVoiceAssistant = ({
  initialContext = {},
  voiceParams = {},
}: UseVoiceAssistantProps = {}) => {
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [voiceContext, setVoiceContext] = useState<VoiceContext | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the conversation and voice context
  const initialize = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const [conversationCtx, voiceCtx] = await Promise.all([
        ConversationalAI.initializeConversation(initialContext),
        VoiceContextGenerator.generateVoiceContext({
          baseVoice: 'neutral',
          emotionalContext: 'neutral',
          speedMultiplier: 1,
          pitchAdjustment: 0,
          clarity: 1,
          ...voiceParams,
        }),
      ]);

      setConversationContext(conversationCtx);
      setVoiceContext(voiceCtx);
    } catch (err) {
      setError('Failed to initialize voice assistant');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [initialContext, voiceParams]);

  // Generate a response with matching voice characteristics
  const generateResponse = useCallback(async (
    message: string,
    emotion?: string,
    intensity?: number
  ): Promise<ConversationResponse | null> => {
    if (!conversationContext || !voiceContext) {
      setError('Voice assistant not initialized');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let currentVoiceContext = voiceContext;

      // If emotion is specified, generate an emotional variant
      if (emotion && intensity !== undefined) {
        currentVoiceContext = await VoiceContextGenerator.generateEmotionalVariant(
          voiceContext,
          emotion,
          intensity
        );
      }

      // Generate the AI response
      const response = await ConversationalAI.generateResponse(
        message,
        conversationContext,
        currentVoiceContext
      );

      // Update the conversation context with the new message
      setConversationContext(prev => prev ? {
        ...prev,
        previousMessages: [...prev.previousMessages, response.message],
      } : null);

      return response;
    } catch (err) {
      setError('Failed to generate response');
      console.error(err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [conversationContext, voiceContext]);

  // Blend multiple voice contexts
  const blendVoices = useCallback(async (
    contexts: VoiceContext[],
    weights: number[]
  ): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    try {
      const blendedContext = await VoiceContextGenerator.blendVoiceContexts(
        contexts,
        weights
      );
      setVoiceContext(blendedContext);
    } catch (err) {
      setError('Failed to blend voice contexts');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Adjust the conversation style
  const adjustConversationStyle = useCallback(async (
    style: {
      tone?: string;
      formality?: 'casual' | 'neutral' | 'formal';
      length?: 'short' | 'medium' | 'long';
    }
  ): Promise<void> => {
    if (!conversationContext) {
      setError('Voice assistant not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const lastMessage = conversationContext.previousMessages[
        conversationContext.previousMessages.length - 1
      ];

      if (lastMessage) {
        const adjustedMessage = await ConversationalAI.adjustResponseStyle(
          lastMessage.content,
          style
        );

        // Update the last message in the context
        setConversationContext(prev => {
          if (!prev) return null;
          const messages = [...prev.previousMessages];
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content: adjustedMessage,
          };
          return { ...prev, previousMessages: messages };
        });
      }
    } catch (err) {
      setError('Failed to adjust conversation style');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [conversationContext]);

  return {
    conversationContext,
    voiceContext,
    isProcessing,
    error,
    initialize,
    generateResponse,
    blendVoices,
    adjustConversationStyle,
  };
};

export default useVoiceAssistant; 