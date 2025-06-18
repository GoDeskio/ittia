import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import AudioSamplePlayer from './shared/AudioSamplePlayer';
import ShareIcon from '@mui/icons-material/Share';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// Props interface for the UserProfile component
interface UserProfileProps {
  userId: string;      // The ID of the user whose profile is being displayed
  isPublic?: boolean;  // Flag indicating if this is a public profile view
}

/**
 * UserProfile Component
 * 
 * Displays a user's public profile with their voice library information.
 * Features:
 * - User avatar and name display
 * - QR code for voice library connection
 * - Share functionality for the profile
 * - Responsive design with theme support
 */
const UserProfile: React.FC<UserProfileProps> = ({ userId, isPublic = false }) => {
  // Theme and auth context hooks
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  
  // State for share notification
  const [showShareAlert, setShowShareAlert] = useState(false);

  /**
   * Handles sharing the profile
   * Uses Web Share API if available, falls back to clipboard copy
   */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Use native share dialog on supported devices
        await navigator.share({
          title: `${user?.username}'s Voice Library`,
          text: 'Check out my voice library on VoiceVault!',
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(window.location.href);
        setShowShareAlert(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    // Main profile container with theme-aware background
    <Box
      sx={{
        p: 3,
        bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
      }}
    >
      {/* Profile content card */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* User avatar with initials */}
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>

        {/* User's library name */}
        <Typography variant="h4" component="h1">
          {user?.username}'s Voice Library
        </Typography>

        {/* QR code section */}
        {user?.qrCode && (
          <Box sx={{ textAlign: 'center' }}>
            {/* QR code display container */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: 'inline-block',
                bgcolor: 'white',
                mb: 2,
              }}
            >
              <img
                src={user.qrCode}
                alt="Voice Library QR Code"
                style={{ width: '200px', height: '200px' }}
              />
            </Paper>
            
            {/* Share button container */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={handleShare}
              >
                Share Library
              </Button>
            </Box>
          </Box>
        )}

        {/* Connection instructions */}
        <Typography variant="body1" color="text.secondary" align="center">
          Connect to this voice library by scanning the QR code or using the share button.
        </Typography>
      </Paper>

      {/* Share success notification */}
      <Snackbar
        open={showShareAlert}
        autoHideDuration={3000}
        onClose={() => setShowShareAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowShareAlert(false)}>
          Profile link copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile; 