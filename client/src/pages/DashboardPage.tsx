import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import VirtualAssistant from '../components/VirtualAssistant';
import { useTheme } from '../contexts/ThemeContext';

const DashboardPage: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Welcome to VoiceVault
            </Typography>
            {/* Add your dashboard content here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              height: '100%',
              bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <VirtualAssistant />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 