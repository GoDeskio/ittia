import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  Email as EmailIcon,
  Dialpad as DialpadIcon,
  YouTube as YouTubeIcon,
  Twitter as TwitterIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface AuthMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface SocialIntegration {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  permissions: string[];
}

interface DevicePermission {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface ApiTokenData {
  apiToken: string;
  qrCode: string;
  tokenLength: number;
  userName: string;
  userEmail: string;
  publicUrl: string;
  stats: {
    audioFiles: number;
  };
}

export const UserSettingsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<ApiTokenData | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([
    { id: 'email', name: 'Email & Password', icon: <EmailIcon />, enabled: true },
    { id: 'google', name: 'Google', icon: <GoogleIcon />, enabled: false },
    { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, enabled: false },
    { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon />, enabled: false },
    { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, enabled: false },
    { id: 'pinCode', name: '4-Digit PIN', icon: <DialpadIcon />, enabled: false },
    { id: 'fingerprint', name: 'Fingerprint', icon: <FingerprintIcon />, enabled: false },
  ]);

  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([
    { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, connected: false, permissions: [] },
    { id: 'twitter', name: 'Twitter', icon: <TwitterIcon />, connected: false, permissions: [] },
    { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, connected: false, permissions: [] },
    { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon />, connected: false, permissions: [] },
  ]);

  const [devicePermissions, setDevicePermissions] = useState<DevicePermission[]>([
    {
      id: 'microphone',
      name: 'Microphone',
      enabled: false,
      description: 'Allow access to record audio'
    },
    {
      id: 'email',
      name: 'Email Notifications',
      enabled: false,
      description: 'Allow sending email notifications'
    },
    {
      id: 'sms',
      name: 'SMS Notifications',
      enabled: false,
      description: 'Allow sending SMS notifications'
    },
    {
      id: 'photos',
      name: 'Photos',
      enabled: false,
      description: 'Allow access to photo library'
    },
    {
      id: 'location',
      name: 'Location',
      enabled: false,
      description: 'Allow access to device location'
    },
    {
      id: 'calls',
      name: 'Phone Calls',
      enabled: false,
      description: 'Allow making phone calls'
    },
  ]);

  useEffect(() => {
    // Load user settings from backend
    const loadUserSettings = async () => {
      try {
        const response = await axios.get('/api/user/settings');
        const settings = response.data;
        
        setAuthMethods(prev => prev.map(method => ({
          ...method,
          enabled: settings.authMethods[method.id]
        })));

        setSocialIntegrations(prev => prev.map(integration => ({
          ...integration,
          connected: settings.socialIntegrations[integration.id]?.connected || false,
          permissions: settings.socialIntegrations[integration.id]?.permissions || []
        })));

        setDevicePermissions(prev => prev.map(permission => ({
          ...permission,
          enabled: settings.devicePermissions[permission.id]
        })));
      } catch (error) {
        console.error('Failed to load user settings:', error);
      }
    };

    // Load API token data
    const loadApiData = async () => {
      try {
        const response = await axios.get('/api/settings/api-token');
        setApiData(response.data);
      } catch (error) {
        console.error('Failed to load API data:', error);
      }
    };

    loadUserSettings();
    loadApiData();
  }, []);

  const handleAuthMethodToggle = async (methodId: string) => {
    try {
      await axios.post(`/api/user/auth-methods/${methodId}/toggle`);
      setAuthMethods(prev => prev.map(method => 
        method.id === methodId ? { ...method, enabled: !method.enabled } : method
      ));
    } catch (error) {
      console.error(`Failed to toggle ${methodId} auth method:`, error);
    }
  };

  const handleSocialIntegrationToggle = async (integrationId: string) => {
    try {
      if (socialIntegrations.find(i => i.id === integrationId)?.connected) {
        await axios.post(`/api/user/social/${integrationId}/disconnect`);
        setSocialIntegrations(prev => prev.map(integration =>
          integration.id === integrationId ? { ...integration, connected: false, permissions: [] } : integration
        ));
      } else {
        // Redirect to OAuth flow
        window.location.href = `/api/auth/${integrationId}`;
      }
    } catch (error) {
      console.error(`Failed to toggle ${integrationId} integration:`, error);
    }
  };

  const handleDevicePermissionToggle = async (permissionId: string) => {
    try {
      await axios.post(`/api/user/permissions/${permissionId}/toggle`);
      setDevicePermissions(prev => prev.map(permission =>
        permission.id === permissionId ? { ...permission, enabled: !permission.enabled } : permission
      ));
    } catch (error) {
      console.error(`Failed to toggle ${permissionId} permission:`, error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard`, severity: 'success' });
  };

  const regenerateToken = async () => {
    try {
      const response = await axios.post('/api/settings/api-token/regenerate');
      setApiData(prev => prev ? {
        ...prev,
        apiToken: response.data.apiToken,
        qrCode: response.data.qrCode,
        tokenLength: response.data.tokenLength
      } : null);
      setSnackbar({ open: true, message: 'API token regenerated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error regenerating token:', error);
      setSnackbar({ open: true, message: 'Error regenerating token', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Settings
      </Typography>

      {/* API Token Section - At the top */}
      {apiData && (
        <Card sx={{ mb: 4, border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LibraryBooksIcon color="primary" />
                Voice Library API Access
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

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip 
                label={`${apiData.tokenLength} characters`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`${apiData.stats.audioFiles} audio files`} 
                variant="outlined" 
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This secure {apiData.tokenLength}-character token connects all your voice files and allows other users 
              to access your voice library. Share the QR code to let others connect to your library.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => copyToClipboard(apiData.publicUrl, 'Public URL')}
                size="small"
              >
                Copy Public URL
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => setShowQrDialog(true)}
                size="small"
              >
                Share QR Code
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Authentication Methods */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Authentication Methods
              </Typography>
              <List>
                {authMethods.map((method) => (
                  <ListItem key={method.id}>
                    <ListItemIcon>{method.icon}</ListItemIcon>
                    <ListItemText primary={method.name} />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={method.enabled}
                        onChange={() => handleAuthMethodToggle(method.id)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Integrations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Social Integrations
              </Typography>
              <List>
                {socialIntegrations.map((integration) => (
                  <ListItem key={integration.id}>
                    <ListItemIcon>{integration.icon}</ListItemIcon>
                    <ListItemText 
                      primary={integration.name}
                      secondary={integration.connected ? 
                        `Connected (${integration.permissions.length} permissions)` : 
                        'Not connected'
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        color={integration.connected ? "error" : "primary"}
                        onClick={() => handleSocialIntegrationToggle(integration.id)}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Permissions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Permissions
              </Typography>
              <List>
                {devicePermissions.map((permission) => (
                  <ListItem key={permission.id}>
                    <ListItemText 
                      primary={permission.name}
                      secondary={permission.description}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={permission.enabled}
                        onChange={() => handleDevicePermissionToggle(permission.id)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
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
          {apiData && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img 
                src={apiData.qrCode} 
                alt="Voice Library QR Code" 
                style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }}
              />
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {apiData.userName}'s Voice Library
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Share this QR code to allow others to connect to your voice library.
                They can scan it with their VoiceVault app to access your audio files.
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mt: 2 }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {apiData.publicUrl}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrDialog(false)}>Close</Button>
          {apiData && (
            <Button 
              onClick={() => copyToClipboard(apiData.publicUrl, 'Public URL')} 
              variant="contained"
            >
              Copy URL
            </Button>
          )}
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

export default UserSettingsDashboard; 