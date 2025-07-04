import React from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import { AudioVisualizer } from './AudioVisualizer';

interface VoiceRecognitionPanelProps {
  isListening: boolean;
  transcript: string;
  error: string;
  onStartListening: () => void;
  onStopListening: () => void;
}

export const VoiceRecognitionPanel: React.FC<VoiceRecognitionPanelProps> = ({
  isListening,
  transcript,
  error,
  onStartListening,
  onStopListening,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Voice Recognition
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AudioVisualizer isActive={isListening} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color={isListening ? 'error' : 'primary'}
          startIcon={isListening ? <Stop /> : <Mic />}
          onClick={isListening ? onStopListening : onStartListening}
          fullWidth
        >
          {isListening ? (
            <>
              Stop Listening
              <CircularProgress
                size={20}
                color="inherit"
                sx={{ ml: 1 }}
              />
            </>
          ) : (
            'Start Listening'
          )}
        </Button>
      </Box>

      {transcript && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body1">{transcript}</Typography>
        </Box>
      )}
    </Box>
  );
}; 