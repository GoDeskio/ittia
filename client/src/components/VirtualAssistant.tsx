import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import GroqService from '../services/GroqService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceAnalysis {
  emotion: string;
  tone: string;
  clarity: number;
  confidence: number;
}

/**
 * VirtualAssistant Component
 * 
 * A voice-enabled virtual assistant that uses Groq for improved voice inference.
 * Features:
 * - Voice input recording
 * - Real-time voice analysis
 * - Chat history
 * - Voice library integration
 */
const VirtualAssistant: React.FC = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const groqService = GroqService.getInstance();

  // Initialize media recorder
  useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              // Analyze voice characteristics
              const analysis = await groqService.analyzeVoice(base64Audio);
              setVoiceAnalysis(analysis);

              // Convert audio to text (you'll need to implement this)
              const transcribedText = await convertAudioToText(audioBlob);
              
              // Process the voice input
              await handleVoiceInput(transcribedText);
            } catch (error) {
              console.error('Error processing voice input:', error);
            }
          };
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initializeMediaRecorder();
  }, []);

  /**
   * Start voice recording
   */
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  /**
   * Stop voice recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Handle voice input processing
   */
  const handleVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await groqService.processVoiceInput(text, {
        voiceLibrary: user?.username,
        previousMessages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      setMessages(prev => [
        ...prev,
        { role: 'user', content: text, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      ]);
    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle text input submission
   */
  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const response = await groqService.processVoiceInput(inputText, {
        voiceLibrary: user?.username,
        previousMessages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      setMessages(prev => [
        ...prev,
        { role: 'user', content: inputText, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      ]);
      setInputText('');
    } catch (error) {
      console.error('Error processing text input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
      }}
    >
      {/* Voice analysis display */}
      {voiceAnalysis && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Emotion: ${voiceAnalysis.emotion}`} color="primary" />
          <Chip label={`Tone: ${voiceAnalysis.tone}`} color="secondary" />
          <Chip label={`Clarity: ${(voiceAnalysis.clarity * 100).toFixed(0)}%`} />
          <Chip label={`Confidence: ${(voiceAnalysis.confidence * 100).toFixed(0)}%`} />
        </Box>
      )}

      {/* Chat messages */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflowY: 'auto',
          bgcolor: currentTheme === 'dark' ? 'background.default' : 'background.paper',
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                color: 'white',
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Paper>

      {/* Input controls */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>

        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          disabled={isProcessing}
          onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
        />

        <Button
          variant="contained"
          endIcon={isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleTextSubmit}
          disabled={isProcessing || !inputText.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default VirtualAssistant; 