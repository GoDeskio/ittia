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

export const UserSettingsDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
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

    loadUserSettings();
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Settings
      </Typography>

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
    </Box>
  );
}; 