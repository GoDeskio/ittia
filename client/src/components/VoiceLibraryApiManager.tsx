import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Avatar,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
  People as PeopleIcon,
  LibraryBooks as LibraryBooksIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface ApiTokenData {
  apiToken: string;
  qrCode: string;
  connections: number;
  accessibleLibraries: number;
  publicUrl: string;
}

interface LibraryConnection {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  access_level: string;
  created_at: string;
}

interface AccessibleLibrary {
  libraryId: string;
  ownerId: string;
  ownerName: string;
  accessToken: string;
  publicUrl: string;
  accessLevel: string;
  createdAt: string;
}

const VoiceLibraryApiManager: React.FC = () => {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<ApiTokenData | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showConnectionsDialog, setShowConnectionsDialog] = useState(false);
  const [connections, setConnections] = useState<LibraryConnection[]>([]);
  const [accessibleLibraries, setAccessibleLibraries] = useState<AccessibleLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadApiData();
  }, []);

  const loadApiData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings/api-token');
      setApiData(response.data);
    } catch (error) {
      console.error('Error loading API data:', error);
      showSnackbar('Error loading API data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const response = await axios.get('/api/settings/library-connections');
      setConnections(response.data.myConnections);
      setAccessibleLibraries(response.data.accessibleLibraries);
    } catch (error) {
      console.error('Error loading connections:', error);
      showSnackbar('Error loading connections', 'error');
    }
  };

  const regenerateToken = async () => {
    try {
      const response = await axios.post('/api/settings/api-token/regenerate');
      setApiData(prev => prev ? {
        ...prev,
        apiToken: response.data.apiToken,
        qrCode: response.data.qrCode
      } : null);
      showSnackbar('API token regenerated successfully', 'success');
    } catch (error) {
      console.error('Error regenerating token:', error);
      showSnackbar('Error regenerating token', 'error');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard`, 'success');
  };

  const revokeAccess = async (requesterId: string) => {
    try {
      await axios.delete(`/api/settings/library-connections/${requesterId}`);
      await loadConnections();
      showSnackbar('Access revoked successfully', 'success');
    } catch (error) {
      console.error('Error revoking access:', error);
      showSnackbar('Error revoking access', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleConnectionsDialog = async () => {
    await loadConnections();
    setShowConnectionsDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading API settings...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!apiData) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error loading API data</Typography>
          <Button onClick={loadApiData} variant="outlined" sx={{ mt: 2 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LibraryBooksIcon />
        Voice Library API Access
      </Typography>

      <Grid container spacing={3}>
        {/* API Token Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Your API Access Token
                </Typography>
                <Box>
                  <Tooltip title="Regenerate Token">
                    <IconButton onClick={regenerateToken} color="primary">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Show QR Code">
                    <IconButton onClick={() => setShowQrDialog(true)} color="primary">
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      flex: 1,
                      fontSize: '0.85rem'
                    }}
                  >
                    {showToken ? apiData.apiToken : '•'.repeat(Math.min(apiData.apiToken.length, 100))}
                  </Typography>
                  <Tooltip title={showToken ? 'Hide token' : 'Show token'}>
                    <IconButton onClick={() => setShowToken(!showToken)} size="small">
                      {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy token">
                    <IconButton onClick={() => copyToClipboard(apiData.apiToken, 'API token')} size="small">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This {apiData.apiToken.length}-character token provides secure access to your voice library. 
                Keep it confidential and use it to connect your files across applications.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<PeopleIcon />} 
                  label={`${apiData.connections} Connected Users`} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<LibraryBooksIcon />} 
                  label={`${apiData.accessibleLibraries} Accessible Libraries`} 
                  variant="outlined" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Public Access Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Public Library URL
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {apiData.publicUrl}
                </Typography>
              </Paper>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(apiData.publicUrl, 'Public URL')}
                  size="small"
                >
                  Copy URL
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setShowQrDialog(true)}
                  size="small"
                >
                  Share QR
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Connections Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Library Connections
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage who can access your voice library and which libraries you can access.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={handleConnectionsDialog}
                fullWidth
              >
                Manage Connections ({apiData.connections + apiData.accessibleLibraries})
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onClose={() => setShowQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon />
            Voice Library QR Code
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <img 
              src={apiData.qrCode} 
              alt="Voice Library QR Code" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Share this QR code to allow others to connect to your voice library.
              They can scan it with their VoiceVault app to request access.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrDialog(false)}>Close</Button>
          <Button 
            onClick={() => copyToClipboard(apiData.qrCode, 'QR code data')} 
            variant="contained"
          >
            Copy QR Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Connections Dialog */}
      <Dialog open={showConnectionsDialog} onClose={() => setShowConnectionsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Library Connections</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Users Connected to Your Library ({connections.length})
            </Typography>
            {connections.length === 0 ? (
              <Typography color="text.secondary">No users connected to your library yet.</Typography>
            ) : (
              <List>
                {connections.map((connection) => (
                  <ListItem key={connection.id}>
                    <Avatar sx={{ mr: 2 }}>{connection.requester_name.charAt(0)}</Avatar>
                    <ListItemText
                      primary={connection.requester_name}
                      secondary={`${connection.requester_email} • ${connection.access_level} access • Connected ${new Date(connection.created_at).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => revokeAccess(connection.requester_id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Libraries You Can Access ({accessibleLibraries.length})
            </Typography>
            {accessibleLibraries.length === 0 ? (
              <Typography color="text.secondary">You don't have access to any other libraries yet.</Typography>
            ) : (
              <List>
                {accessibleLibraries.map((library) => (
                  <ListItem key={library.libraryId}>
                    <Avatar sx={{ mr: 2 }}>{library.ownerName.charAt(0)}</Avatar>
                    <ListItemText
                      primary={library.ownerName}
                      secondary={`${library.accessLevel} access • Connected ${new Date(library.createdAt).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => window.open(library.publicUrl, '_blank')}
                      >
                        <LinkIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConnectionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VoiceLibraryApiManager;