import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTheme } from '../contexts/ThemeContext';

// Props interface for the ApiTokenDisplay component
interface ApiTokenDisplayProps {
  apiToken: string; // The API token to be displayed
}

/**
 * ApiTokenDisplay Component
 * 
 * A secure component for displaying and managing API tokens.
 * Features:
 * - Token visibility toggle
 * - Copy to clipboard functionality
 * - Success notifications
 * - Secure token masking
 */
const ApiTokenDisplay: React.FC<ApiTokenDisplayProps> = ({ apiToken }) => {
  // Theme context for consistent styling
  const { currentTheme } = useTheme();
  
  // State management for token visibility and notifications
  const [showToken, setShowToken] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  /**
   * Handles copying the API token to clipboard
   * Shows a success notification when complete
   */
  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setShowCopiedAlert(true);
  };

  /**
   * Toggles the visibility of the API token
   * Switches between masked and visible states
   */
  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  return (
    // Main container for the API token display
    <Box sx={{ mb: 4 }}>
      {/* Section header */}
      <Typography variant="h6" gutterBottom>
        API Token
      </Typography>

      {/* Token display container with secure styling */}
      <Paper
        sx={{
          p: 2,
          bgcolor: currentTheme === 'dark' ? 'background.default' : 'grey.100',
          position: 'relative',
        }}
      >
        {/* Token display and control buttons container */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Token text display with monospace font for better readability */}
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              flex: 1,
            }}
          >
            {showToken ? apiToken : '•'.repeat(apiToken.length)}
          </Typography>

          {/* Visibility toggle button with tooltip */}
          <Tooltip title={showToken ? 'Hide token' : 'Show token'}>
            <IconButton onClick={toggleTokenVisibility} size="small">
              {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>

          {/* Copy button with tooltip */}
          <Tooltip title="Copy token">
            <IconButton onClick={handleCopyToken} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Security warning message */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Keep this token secure. It provides access to your voice library API.
      </Typography>

      {/* Success notification for copy action */}
      <Snackbar
        open={showCopiedAlert}
        autoHideDuration={3000}
        onClose={() => setShowCopiedAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowCopiedAlert(false)}>
          API token copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApiTokenDisplay; 