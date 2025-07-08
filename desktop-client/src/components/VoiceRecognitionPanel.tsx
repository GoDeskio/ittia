import React from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import { AudioVisualizer } from './AudioVisualizer';
import { NeumorphicDesignSystem } from '../../../shared/design-system';

const { colors, shadows, borderRadius } = NeumorphicDesignSystem;

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
    <Box sx={{ textAlign: 'center' }}>
      {/* Audio Visualizer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center', 
        mb: 4,
        minHeight: '100px',
      }}>
        <AudioVisualizer isActive={isListening} />
      </Box>

      {/* Large Record Button */}
      <Box sx={{ mb: 4 }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 3,
            background: isListening 
              ? 'linear-gradient(145deg, #ff6b6b, #ee5a52)' 
              : colors.gradients.accent,
            boxShadow: shadows.raised.lg,
            cursor: 'pointer',
            transition: NeumorphicDesignSystem.animations.transitions.all,
            animation: isListening ? 'pulse 2s infinite' : 'none',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: shadows.raised.xl,
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: shadows.inset.sm,
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
          onClick={isListening ? onStopListening : onStartListening}
        >
          {isListening ? <Stop sx={{ fontSize: 48 }} /> : <Mic sx={{ fontSize: 48 }} />}
        </Avatar>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: colors.text.primary,
            fontWeight: 600,
            mb: 2,
          }}
        >
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: colors.text.secondary,
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          {isListening 
            ? 'Click to stop voice recognition and processing'
            : 'Click the microphone to start voice recognition'
          }
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            background: colors.gradients.primary,
            boxShadow: shadows.inset.sm,
            borderRadius: borderRadius['2xl'],
            border: 'none',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Transcript Display */}
      {transcript && (
        <Box
          sx={{
            p: 3,
            background: colors.gradients.secondary,
            borderRadius: borderRadius['2xl'],
            boxShadow: shadows.inset.md,
            border: 'none',
            minHeight: '100px',
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.text.primary,
              lineHeight: 1.6,
              fontStyle: transcript.includes('browser mode') ? 'italic' : 'normal',
            }}
          >
            {transcript}
          </Typography>
        </Box>
      )}

      {/* Status Indicator */}
      {isListening && (
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress
            size={20}
            sx={{ 
              color: colors.accent.primary,
              mr: 1,
            }}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.text.secondary,
              fontStyle: 'italic',
            }}
          >
            Listening...
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 