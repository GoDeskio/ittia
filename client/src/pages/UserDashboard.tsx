import React, { useState, useCallback } from 'react';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import AudioRecorder from '../components/AudioRecorder';
import AudioProcessingService from '../services/AudioProcessingService';
import Sidebar from '../components/shared/Sidebar';
import VirtualAssistant from '../components/VirtualAssistant';

const UserDashboard: React.FC = () => {
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    try {
      // Save the recording to cache
      const audioFile = await AudioProcessingService.getInstance().saveToCache(blob);
      setRecordingStatus('Recording saved to cache successfully!');

      // Automatically start processing the file
      await AudioProcessingService.getInstance().processAudioFile(audioFile.id);
      setRecordingStatus('Recording is being processed into words...');
    } catch (error) {
      console.error('Error handling recording:', error);
      setRecordingStatus('Error saving recording. Please try again.');
    }
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          ml: `${sidebarOpen ? '240px' : '0px'}`,
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  User Dashboard
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Voice Recording
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                </Box>
                {recordingStatus && (
                  <Typography 
                    color="success.main" 
                    sx={{ mt: 2 }}
                  >
                    {recordingStatus}
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Guide
                </Typography>
                <Typography variant="body1" paragraph>
                  1. Click "Start Recording" to begin recording your voice
                </Typography>
                <Typography variant="body1" paragraph>
                  2. The recording will continue even when the app is minimized
                </Typography>
                <Typography variant="body1" paragraph>
                  3. Click "Stop Recording" when you're done
                </Typography>
                <Typography variant="body1" paragraph>
                  4. Your recording will be saved to the cache
                </Typography>
                <Typography variant="body1">
                  5. The system will automatically process it into individual words
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Need Help?
                </Typography>
                <Typography variant="body1">
                  Click the assistant icon in the bottom right corner to get help with any questions you have about the platform.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Virtual Assistant */}
      <VirtualAssistant />
    </Box>
  );
};

export default UserDashboard; 