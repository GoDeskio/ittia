import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  NotificationsActive as PushIcon,
  Computer as DesktopIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import NotificationService, { NotificationPreferences } from '../services/NotificationService';

const defaultPreferences: NotificationPreferences = {
  email: {
    enabled: false,
    frequency: 'instant',
    types: {
      voiceProcessingComplete: true,
      newMessageReceived: true,
      securityAlerts: true,
      systemUpdates: false,
      accountActivity: true,
    },
  },
  push: {
    enabled: false,
    browser: true,
    mobile: true,
    types: {
      voiceProcessingComplete: true,
      newMessageReceived: true,
      securityAlerts: true,
      systemUpdates: false,
      accountActivity: true,
    },
  },
  desktop: {
    enabled: false,
    types: {
      voiceProcessingComplete: true,
      newMessageReceived: true,
      securityAlerts: true,
      systemUpdates: false,
      accountActivity: true,
    },
  },
};

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadPreferences();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const status = await Notification.requestPermission();
      setPermissionStatus(status);
    }
  };

  const loadPreferences = async () => {
    try {
      const userPreferences = await NotificationService.getInstance().getUserPreferences();
      setPreferences(userPreferences);
    } catch (error) {
      showSnackbar('Failed to load notification preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (
    channel: 'email' | 'push' | 'desktop',
    field: string,
    value: any
  ) => {
    const updatedPreferences = { ...preferences };
    if (field.includes('.')) {
      const [category, setting] = field.split('.');
      (updatedPreferences[channel] as any)[category][setting] = value;
    } else {
      (updatedPreferences[channel] as any)[field] = value;
    }

    setPreferences(updatedPreferences);

    try {
      await NotificationService.getInstance().updatePreferences(updatedPreferences);
      showSnackbar('Preferences updated successfully');
    } catch (error) {
      showSnackbar('Failed to update preferences', 'error');
    }
  };

  const handleTestNotification = async (type: 'email' | 'push' | 'desktop') => {
    try {
      await NotificationService.getInstance().sendTestNotification(type);
      showSnackbar(`Test ${type} notification sent`);
    } catch (error) {
      showSnackbar(`Failed to send test ${type} notification`, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const NotificationSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    channel: 'email' | 'push' | 'desktop';
    description: string;
  }> = ({ title, icon, channel, description }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
          <Tooltip title={description} placement="right">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={preferences[channel].enabled}
                onChange={(e) => handlePreferenceChange(channel, 'enabled', e.target.checked)}
              />
            }
            label="Enable Notifications"
          />

          {channel === 'email' && (
            <FormControl sx={{ mt: 2, minWidth: 200 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={preferences.email.frequency}
                label="Frequency"
                onChange={(e) => handlePreferenceChange('email', 'frequency', e.target.value)}
                disabled={!preferences.email.enabled}
              >
                <MenuItem value="instant">Instant</MenuItem>
                <MenuItem value="daily">Daily Digest</MenuItem>
                <MenuItem value="weekly">Weekly Digest</MenuItem>
              </Select>
            </FormControl>
          )}

          {channel === 'push' && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.push.browser}
                    onChange={(e) => handlePreferenceChange('push', 'browser', e.target.checked)}
                    disabled={!preferences.push.enabled}
                  />
                }
                label="Browser Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.push.mobile}
                    onChange={(e) => handlePreferenceChange('push', 'mobile', e.target.checked)}
                    disabled={!preferences.push.enabled}
                  />
                }
                label="Mobile Notifications"
              />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Notification Types
          </Typography>

          {Object.entries(preferences[channel].types).map(([key, value]) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={value}
                  onChange={(e) =>
                    handlePreferenceChange(channel, `types.${key}`, e.target.checked)
                  }
                  disabled={!preferences[channel].enabled}
                />
              }
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            />
          ))}

          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 2, alignSelf: 'flex-start' }}
            onClick={() => handleTestNotification(channel)}
            disabled={!preferences[channel].enabled}
          >
            Send Test Notification
          </Button>
        </FormGroup>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Typography>Loading preferences...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Notification Preferences
      </Typography>

      {permissionStatus !== 'granted' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please enable notifications in your browser to receive desktop notifications.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <NotificationSection
            title="Email Notifications"
            icon={<EmailIcon color="primary" />}
            channel="email"
            description="Receive notifications via email with customizable frequency"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <NotificationSection
            title="Push Notifications"
            icon={<PushIcon color="primary" />}
            channel="push"
            description="Receive push notifications on your browser and mobile devices"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <NotificationSection
            title="Desktop Notifications"
            icon={<DesktopIcon color="primary" />}
            channel="desktop"
            description="Receive native desktop notifications when the app is running"
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettings; 