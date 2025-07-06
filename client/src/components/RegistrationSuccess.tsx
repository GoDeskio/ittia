import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface RegistrationSuccessProps {
  open: boolean;
  onClose: () => void;
  qrCode: string;
  libraryName: string;
  apiToken: string;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  open,
  onClose,
  qrCode,
  libraryName,
  apiToken,
}) => {
  const { currentTheme } = useTheme();

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'voicevault-library-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Registration Successful!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" gutterBottom>
            Your voice library has been created:
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            {libraryName}
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              p: 2,
              my: 2,
              display: 'inline-block',
              bgcolor: 'white',
            }}
          >
            <img
              src={qrCode}
              alt="Voice Library QR Code"
              style={{ width: '200px', height: '200px' }}
            />
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              API Token:
            </Typography>
            <Paper
              sx={{
                p: 1,
                bgcolor: currentTheme === 'dark' ? 'background.default' : 'grey.100',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {apiToken}
            </Paper>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Share this QR code with others to let them connect to your voice library.
            The QR code contains your API token and library information.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleCopyToken} variant="outlined">
          Copy API Token
        </Button>
        <Button onClick={handleDownloadQR} variant="outlined">
          Download QR Code
        </Button>
        <Button onClick={onClose} variant="contained">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationSuccess; 