// This file is the main component for the VoiceVault Desktop application.
// It sets up the theme, initializes voice recognition, and renders the main UI components.

// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Paper, Typography } from '@mui/material';
import { ipcRenderer } from 'electron';
import { VOICE_CONFIG } from '../../shared/config';
import { VoiceRecognitionPanel } from './components/VoiceRecognitionPanel';
import { SystemCommands } from './components/SystemCommands';
import { VoiceProfileManager } from './components/VoiceProfileManager';

// Define the theme for the application
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Main App component
const App: React.FC = () => {
  // State variables for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  // Initialize voice recognition and set up event listeners
  useEffect(() => {
    // Initialize voice recognition with the configuration
    ipcRenderer.send('init-voice-recognition', VOICE_CONFIG);

    // Listen for voice recognition results
    ipcRenderer.on('voice-result', (_, result) => {
      setTranscript(result);
    });

    // Listen for voice recognition errors
    ipcRenderer.on('voice-error', (_, error) => {
      setError(error);
    });

    // Clean up event listeners on component unmount
    return () => {
      ipcRenderer.removeAllListeners('voice-result');
      ipcRenderer.removeAllListeners('voice-error');
    };
  }, []);

  // Function to start voice recognition
  const handleStartListening = () => {
    ipcRenderer.send('start-listening');
    setIsListening(true);
    setError('');
  };

  // Function to stop voice recognition
  const handleStopListening = () => {
    ipcRenderer.send('stop-listening');
    setIsListening(false);
  };

  // Render the main UI
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            VoiceVault Desktop
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <VoiceRecognitionPanel
              isListening={isListening}
              transcript={transcript}
              error={error}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
            />
          </Paper>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <SystemCommands />
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <VoiceProfileManager />
            </Paper>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App; 