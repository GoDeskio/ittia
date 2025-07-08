// This file is the main component for the VoiceVault Desktop application.
// It sets up the theme, initializes voice recognition, and renders the main UI components.

// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Paper, Typography } from '@mui/material';
// import { VOICE_CONFIG } from '../../shared/config';

// Temporary inline config until we fix the shared import
const VOICE_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  LANGUAGE: 'en-US',
};
import { VoiceRecognitionPanel } from './components/VoiceRecognitionPanel';
import { SystemCommands } from './components/SystemCommands';
import { VoiceProfileManager } from './components/VoiceProfileManager';
import { NeumorphicSidebar } from './components/NeumorphicSidebar';

// Electron IPC renderer - safely access it
const ipcRenderer = (window as any).electronAPI;

// Import the unified design system
import { NeumorphicDesignSystem } from '../../shared/design-system';

const { colors, typography, shadows, borderRadius } = NeumorphicDesignSystem;

// Define the neumorphic theme for the application
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.accent.primary,
      light: colors.background.light,
      dark: colors.accent.secondary,
      contrastText: colors.text.inverse,
    },
    secondary: {
      main: colors.background.secondary,
      light: colors.background.light,
      dark: colors.background.tertiary,
      contrastText: colors.text.primary,
    },
    background: {
      default: colors.background.primary,
      paper: colors.background.primary,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    error: {
      main: colors.accent.error,
    },
    warning: {
      main: colors.accent.warning,
    },
    success: {
      main: colors.accent.success,
    },
    info: {
      main: colors.accent.info,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
    },
    h2: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
    },
    h3: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.semibold,
    },
    h4: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
    },
    h5: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
    },
    h6: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: colors.gradients.primary,
          borderRadius: borderRadius['3xl'],
          boxShadow: shadows.raised.lg,
          transition: NeumorphicDesignSystem.animations.transitions.all,
          '&:hover': {
            boxShadow: shadows.raised.xl,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius['2xl'],
          fontWeight: typography.fontWeight.semibold,
          transition: NeumorphicDesignSystem.animations.transitions.all,
          '&.MuiButton-contained': {
            background: colors.gradients.accent,
            color: colors.text.inverse,
            boxShadow: shadows.raised.md,
            '&:hover': {
              boxShadow: shadows.hover.md,
              transform: 'translateY(-1px)',
            },
          },
          '&.MuiButton-outlined': {
            background: colors.gradients.primary,
            color: colors.text.primary,
            boxShadow: shadows.raised.md,
            border: 'none',
            '&:hover': {
              boxShadow: shadows.hover.md,
              transform: 'translateY(-1px)',
            },
          },
        },
      },
    },
  },
});

// Main App component
const App: React.FC = () => {
  // State variables for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  
  // State variables for navigation
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize voice recognition and set up event listeners
  useEffect(() => {
    if (ipcRenderer) {
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
    } else {
      // Running in browser mode - set a demo message
      setTranscript('Running in browser mode - Electron features not available');
    }
  }, []);

  // Function to start voice recognition
  const handleStartListening = () => {
    if (ipcRenderer) {
      ipcRenderer.send('start-listening');
      setIsListening(true);
      setError('');
    } else {
      setError('Electron IPC not available - running in browser mode');
    }
  };

  // Function to stop voice recognition
  const handleStopListening = () => {
    if (ipcRenderer) {
      ipcRenderer.send('stop-listening');
      setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  // Mock data for dashboard stats
  const dashboardStats = {
    totalRecordings: 47,
    totalDuration: '2h 34m',
    wordsProcessed: 12847,
    storageUsed: 68,
  };

  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            {/* Welcome Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: colors.text.primary,
                  fontWeight: 700,
                  mb: 1,
                  textShadow: '2px 2px 4px rgba(163,177,198,0.3)',
                }}
              >
                Welcome back, John! 👋
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: colors.text.secondary,
                  fontWeight: 400,
                }}
              >
                Ready to capture your voice and build your digital presence?
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 3, 
              mb: 4 
            }}>
              {[
                { icon: '🎤', value: dashboardStats.totalRecordings, label: 'Total Recordings', color: colors.accent.primary },
                { icon: '⏱️', value: dashboardStats.totalDuration, label: 'Total Duration', color: colors.accent.success },
                { icon: '📈', value: dashboardStats.wordsProcessed.toLocaleString(), label: 'Words Processed', color: colors.accent.warning },
                { icon: '💾', value: `${dashboardStats.storageUsed}%`, label: 'Storage Used', color: '#9C27B0' },
              ].map((stat, index) => (
                <Paper key={index} sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: colors.gradients.primary,
                  borderRadius: borderRadius['3xl'],
                  boxShadow: shadows.raised.lg,
                  transition: NeumorphicDesignSystem.animations.transitions.all,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: shadows.raised.xl,
                  },
                }}>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: shadows.inset.sm,
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ color: colors.text.primary, fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    {stat.label}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Voice Recording Studio */}
            <Paper sx={{ 
              p: 4,
              background: colors.gradients.primary,
              borderRadius: borderRadius['3xl'],
              boxShadow: shadows.raised.xl,
              mb: 4,
              textAlign: 'center',
            }}>
              <Typography variant="h5" sx={{ color: colors.text.primary, fontWeight: 600, mb: 4 }}>
                🎙️ Voice Recording Studio
              </Typography>
              <VoiceRecognitionPanel
                isListening={isListening}
                transcript={transcript}
                error={error}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
              />
            </Paper>
          </>
        );
      
      case 'recording':
        return (
          <Paper sx={{ 
            p: 4,
            background: colors.gradients.primary,
            borderRadius: borderRadius['3xl'],
            boxShadow: shadows.raised.xl,
            minHeight: '500px',
          }}>
            <Typography variant="h5" sx={{ color: colors.text.primary, fontWeight: 600, mb: 3 }}>
              🎙️ Voice Recording Studio
            </Typography>
            <VoiceRecognitionPanel
              isListening={isListening}
              transcript={transcript}
              error={error}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
            />
          </Paper>
        );
      
      case 'settings':
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <Paper sx={{ 
              p: 4,
              background: colors.gradients.primary,
              borderRadius: borderRadius['3xl'],
              boxShadow: shadows.raised.xl,
            }}>
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600, mb: 3 }}>
                🖥️ System Commands
              </Typography>
              <SystemCommands />
            </Paper>

            <Paper sx={{ 
              p: 4,
              background: colors.gradients.primary,
              borderRadius: borderRadius['3xl'],
              boxShadow: shadows.raised.xl,
            }}>
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600, mb: 3 }}>
                👤 Voice Profile Manager
              </Typography>
              <VoiceProfileManager />
            </Paper>
          </Box>
        );
      
      default:
        return (
          <Paper sx={{ 
            p: 4,
            background: colors.gradients.primary,
            borderRadius: borderRadius['3xl'],
            boxShadow: shadows.raised.xl,
            textAlign: 'center',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box>
              <Typography variant="h4" sx={{ color: colors.text.primary, mb: 2 }}>
                🚧 Coming Soon
              </Typography>
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                This feature is under development
              </Typography>
            </Box>
          </Paper>
        );
    }
  };

  // Render the main UI with neumorphic dashboard and sidebar
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: colors.background.primary,
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(209,217,230,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(209,217,230,0.3) 0%, transparent 50%)',
        display: 'flex',
      }}>
        {/* Neumorphic Sidebar */}
        <NeumorphicSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            ml: { xs: 0, lg: '70px' },
            transition: 'margin-left 0.3s ease',
            p: 3,
          }}
        >
          <Container maxWidth="xl" sx={{ py: 2 }}>
            {renderPageContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App; 