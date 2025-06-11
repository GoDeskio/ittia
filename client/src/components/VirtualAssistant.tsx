import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Drawer,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Assistant as AssistantIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const VirtualAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const {
    initialize,
    generateResponse,
    error,
    isProcessing: isAIProcessing,
  } = useVoiceAssistant({
    initialContext: {
      topic: 'general',
      mood: 'helpful',
      userPreferences: {
        conversationStyle: 'casual',
        responseLength: 'medium',
        formality: 'casual',
        creativity: 0.7,
      },
    },
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await generateResponse(inputMessage);
      if (response) {
        const assistantMessage: Message = {
          id: response.message.id,
          content: response.message.content,
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error generating response:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start recording logic here
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    } else {
      // Stop recording logic here
      setIsRecording(false);
    }
  };

  const welcomeMessage: Message = {
    id: 'welcome',
    content: "Hello! I'm your virtual assistant. How can I help you today?",
    sender: 'assistant',
    timestamp: new Date(),
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  return (
    <>
      <Tooltip title="Virtual Assistant" placement="left">
        <Fab
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <AssistantIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AssistantIcon />
              </Avatar>
              <Typography variant="h6">Virtual Assistant</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'background.default',
            }}
          >
            <List>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main' }}>
                      {message.sender === 'user' ? 'U' : <AssistantIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                    }}
                  >
                    <ListItemText
                      primary={message.content}
                      secondary={new Date(message.timestamp).toLocaleTimeString()}
                    />
                  </Paper>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Input */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isProcessing || isAIProcessing}
            />
            <IconButton
              color="primary"
              onClick={handleVoiceInput}
              disabled={isProcessing || isAIProcessing}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!inputMessage.trim() || isProcessing || isAIProcessing}
            >
              {isProcessing || isAIProcessing ? (
                <CircularProgress size={24} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Paper>
        </Box>
      </Drawer>
    </>
  );
};

export default VirtualAssistant; 