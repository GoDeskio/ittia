import React, { useState, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import AudioRecorder from '../components/AudioRecorder';
import AudioProcessingService from '../services/AudioProcessingService';
import NeumorphicSidebar from '../components/shared/NeumorphicSidebar';
import VirtualAssistant from '../components/VirtualAssistant';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const { user } = useAuth();

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    try {
      setIsRecording(false);
      // Save the recording to cache
      const audioFile = await AudioProcessingService.getInstance().saveToCache(blob);
      setRecordingStatus('Recording saved to cache successfully!');

      // Automatically start processing the file
      await AudioProcessingService.getInstance().processAudioFile(audioFile.id);
      setRecordingStatus('Recording is being processed into words...');
    } catch (error) {
      console.error('Error handling recording:', error);
      setRecordingStatus('Error saving recording. Please try again.');
      setIsRecording(false);
    }
  }, []);

  const handleRecordingStart = () => {
    setIsRecording(true);
    setRecordingStatus('Recording in progress...');
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
  };

  // Mock data for dashboard stats
  const dashboardStats = {
    totalRecordings: 47,
    totalDuration: '2h 34m',
    wordsProcessed: 12847,
    storageUsed: 68,
  };

  const recentActivity = [
    { id: 1, action: 'Voice recording completed', time: '2 minutes ago', type: 'recording' },
    { id: 2, action: 'Word library updated', time: '15 minutes ago', type: 'processing' },
    { id: 3, action: 'New acquaintance added', time: '1 hour ago', type: 'social' },
    { id: 4, action: 'Settings updated', time: '3 hours ago', type: 'settings' },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#e0e5ec',
      backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(209,217,230,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(209,217,230,0.3) 0%, transparent 50%)',
    }}>
      <NeumorphicSidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '70px', // Space for collapsed sidebar
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          p: 3,
        }}
      >
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#4a4a4a',
              fontWeight: 700,
              mb: 1,
              textShadow: '2px 2px 4px rgba(163,177,198,0.3)',
            }}
          >
            Welcome back, {user?.name?.split(' ')[0] || user?.username}! 👋
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666666',
              fontWeight: 400,
            }}
          >
            Ready to capture your voice and build your digital presence?
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.6)',
              borderRadius: '20px',
              border: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '12px 12px 20px rgba(163,177,198,0.5), -12px -12px 20px rgba(255,255,255,0.7)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'transparent', 
                  color: '#2196F3',
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                }}>
                  <MicIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ color: '#4a4a4a', fontWeight: 700, mb: 1 }}>
                  {dashboardStats.totalRecordings}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Total Recordings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.6)',
              borderRadius: '20px',
              border: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '12px 12px 20px rgba(163,177,198,0.5), -12px -12px 20px rgba(255,255,255,0.7)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'transparent', 
                  color: '#4CAF50',
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                }}>
                  <ScheduleIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ color: '#4a4a4a', fontWeight: 700, mb: 1 }}>
                  {dashboardStats.totalDuration}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Total Duration
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.6)',
              borderRadius: '20px',
              border: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '12px 12px 20px rgba(163,177,198,0.5), -12px -12px 20px rgba(255,255,255,0.7)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'transparent', 
                  color: '#FF9800',
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                }}>
                  <TrendingIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ color: '#4a4a4a', fontWeight: 700, mb: 1 }}>
                  {dashboardStats.wordsProcessed.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Words Processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.6)',
              borderRadius: '20px',
              border: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '12px 12px 20px rgba(163,177,198,0.5), -12px -12px 20px rgba(255,255,255,0.7)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'transparent', 
                  color: '#9C27B0',
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                }}>
                  <StorageIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ color: '#4a4a4a', fontWeight: 700, mb: 1 }}>
                  {dashboardStats.storageUsed}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Storage Used
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={dashboardStats.storageUsed} 
                  sx={{ 
                    mt: 1, 
                    borderRadius: '10px',
                    height: 6,
                    backgroundColor: 'rgba(163,177,198,0.3)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '10px',
                      backgroundColor: '#9C27B0',
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Voice Recording Section */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255,0.6)',
              borderRadius: '25px',
              border: 'none',
              minHeight: '400px',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#4a4a4a', fontWeight: 600, mb: 3 }}>
                  🎙️ Voice Recording Studio
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  py: 4,
                }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: isRecording 
                      ? 'linear-gradient(145deg, #ff6b6b, #ee5a52)'
                      : 'linear-gradient(145deg, #2196F3, #1976D2)',
                    boxShadow: isRecording
                      ? '0 0 30px rgba(255,107,107,0.5), inset 4px 4px 8px rgba(238,90,82,0.3)'
                      : '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    animation: isRecording ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  }}>
                    {isRecording ? (
                      <StopIcon sx={{ fontSize: 48, color: 'white' }} />
                    ) : (
                      <MicIcon sx={{ fontSize: 48, color: 'white' }} />
                    )}
                  </Box>

                  <AudioRecorder 
                    onRecordingComplete={handleRecordingComplete}
                    onRecordingStart={handleRecordingStart}
                    onRecordingStop={handleRecordingStop}
                  />
                  
                  {recordingStatus && (
                    <Chip
                      label={recordingStatus}
                      color={recordingStatus.includes('Error') ? 'error' : 'success'}
                      sx={{ 
                        mt: 2,
                        boxShadow: '4px 4px 8px rgba(163,177,198,0.3), -4px -4px 8px rgba(255,255,255,0.5)',
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255,0.6)',
              borderRadius: '25px',
              border: 'none',
              minHeight: '400px',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#4a4a4a', fontWeight: 600, mb: 3 }}>
                  📊 Recent Activity
                </Typography>
                
                <Box>
                  {recentActivity.map((activity, index) => (
                    <Box key={activity.id}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        py: 2,
                      }}>
                        <Avatar sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          bgcolor: 'transparent',
                          color: activity.type === 'recording' ? '#2196F3' :
                                 activity.type === 'processing' ? '#4CAF50' :
                                 activity.type === 'social' ? '#FF9800' : '#9C27B0',
                          boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.5)',
                        }}>
                          {activity.type === 'recording' ? <MicIcon fontSize="small" /> :
                           activity.type === 'processing' ? <TrendingIcon fontSize="small" /> :
                           activity.type === 'social' ? <VolumeIcon fontSize="small" /> : <ScheduleIcon fontSize="small" />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
                            {activity.action}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666666' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                      {index < recentActivity.length - 1 && (
                        <Divider sx={{ 
                          backgroundColor: 'rgba(163,177,198,0.2)',
                          my: 1,
                        }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Guide */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
              boxShadow: '12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255,0.6)',
              borderRadius: '25px',
              border: 'none',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: '#4a4a4a', fontWeight: 600, mb: 3 }}>
                  🚀 Quick Start Guide
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'transparent',
                        color: '#2196F3',
                        fontSize: '2rem',
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                      }}>
                        1
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
                        Click the microphone to start recording your voice
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'transparent',
                        color: '#4CAF50',
                        fontSize: '2rem',
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                      }}>
                        2
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
                        Recording continues even when minimized
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'transparent',
                        color: '#FF9800',
                        fontSize: '2rem',
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                      }}>
                        3
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
                        Your recording is automatically saved to cache
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'transparent',
                        color: '#9C27B0',
                        fontSize: '2rem',
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5)',
                      }}>
                        4
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
                        AI processes your voice into individual words
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Virtual Assistant */}
      <VirtualAssistant />
    </Box>
  );
};

export default UserDashboard; 