import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  Link as LinkIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface QRCodeScannerProps {
  onConnectionSuccess?: (connectionData: any) => void;
}

interface QRData {
  type: string;
  version: string;
  userId: string;
  userName: string;
  userEmail: string;
  apiToken: string;
  accessUrl: string;
  timestamp: string;
  expires: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onConnectionSuccess }) => {
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedData, setParsedData] = useState<QRData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const parseQRCode = (qrString: string): QRData | null => {
    try {
      const data = JSON.parse(qrString);
      
      if (data.type !== 'voicevault_library_access') {
        throw new Error('Invalid QR code type');
      }
      
      return data as QRData;
    } catch (error) {
      return null;
    }
  };

  const handleQRInput = () => {
    if (!qrInput.trim()) {
      setError('Please enter QR code data');
      return;
    }

    const parsed = parseQRCode(qrInput);
    if (!parsed) {
      setError('Invalid QR code format. Please make sure you copied the correct QR code data.');
      return;
    }

    // Check if QR code is expired
    if (new Date(parsed.expires) < new Date()) {
      setError('This QR code has expired. Please request a new one from the user.');
      return;
    }

    setParsedData(parsed);
    setShowConfirmDialog(true);
    setError('');
  };

  const handleConnect = async () => {
    if (!parsedData) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/library/connect', {
        qrData: JSON.stringify(parsedData),
        ownerId: parsedData.userId,
        accessLevel: 'read'
      });

      setSuccess(`Successfully connected to ${parsedData.userName}'s voice library!`);
      setShowConfirmDialog(false);
      setQrInput('');
      setParsedData(null);
      
      if (onConnectionSuccess) {
        onConnectionSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to connect to library';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlConnect = async () => {
    if (!qrInput.trim()) {
      setError('Please enter a profile URL');
      return;
    }

    // Extract user ID from URL
    const urlMatch = qrInput.match(/\/profile\/([^\/\?]+)/);
    if (!urlMatch) {
      setError('Invalid profile URL format');
      return;
    }

    const userId = urlMatch[1];
    setLoading(true);

    try {
      const response = await axios.post('/api/library/connect', {
        ownerId: userId,
        accessLevel: 'read'
      });

      setSuccess(`Successfully requested access to the user's voice library!`);
      setQrInput('');
      
      if (onConnectionSuccess) {
        onConnectionSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to connect to library';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeScannerIcon />
            Connect to Voice Library
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste QR code data or profile URL to connect to another user's voice library.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="QR Code Data or Profile URL"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Paste QR code JSON data or profile URL here..."
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={handleQRInput}
              disabled={loading}
              fullWidth
            >
              Connect via QR Code
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={handleUrlConnect}
              disabled={loading}
              fullWidth
            >
              Connect via URL
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            <strong>How to use:</strong>
            <br />
            • Ask the user to share their QR code from their Settings page
            <br />
            • Copy the QR code data and paste it above, or
            <br />
            • Copy their profile URL and paste it above
          </Typography>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            Connect to Voice Library
          </Box>
        </DialogTitle>
        <DialogContent>
          {parsedData && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {parsedData.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Email: {parsedData.userEmail}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                QR Code created: {new Date(parsedData.timestamp).toLocaleString()}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are requesting read access to this user's voice library. 
                They may need to approve your request.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConnect} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeScanner;