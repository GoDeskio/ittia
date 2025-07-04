import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface StorageSettings {
  cachePath: string;
  libraryPath: string;
  maxCacheSize: number;
  maxLibrarySize: number;
  autoCleanup: boolean;
  cleanupThreshold: number;
}

const StoragePathSettings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<StorageSettings>({
    cachePath: '',
    libraryPath: '',
    maxCacheSize: 1024 * 1024 * 1024, // 1GB default
    maxLibrarySize: 5 * 1024 * 1024 * 1024, // 5GB default
    autoCleanup: true,
    cleanupThreshold: 0.8, // 80%
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/storage-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch storage settings:', error);
      setMessage({ type: 'error', text: 'Failed to load storage settings' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await axios.put('/api/admin/storage-settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Storage settings saved successfully' });
    } catch (error) {
      console.error('Failed to save storage settings:', error);
      setMessage({ type: 'error', text: 'Failed to save storage settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StorageSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Storage Path Settings
      </Typography>
      
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Storage Paths
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cache Directory Path"
              value={settings.cachePath}
              onChange={(e) => handleInputChange('cachePath', e.target.value)}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Browse for folder">
                    <IconButton>
                      <FolderIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
              helperText="Directory where temporary cached audio files are stored"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Library Directory Path"
              value={settings.libraryPath}
              onChange={(e) => handleInputChange('libraryPath', e.target.value)}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Browse for folder">
                    <IconButton>
                      <FolderIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
              helperText="Directory where permanent library files are stored"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Storage Limits
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Cache Size (GB)"
              type="number"
              value={settings.maxCacheSize / (1024 * 1024 * 1024)}
              onChange={(e) => handleInputChange('maxCacheSize', parseFloat(e.target.value) * 1024 * 1024 * 1024)}
              helperText={`Current limit: ${formatBytes(settings.maxCacheSize)}`}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Library Size (GB)"
              type="number"
              value={settings.maxLibrarySize / (1024 * 1024 * 1024)}
              onChange={(e) => handleInputChange('maxLibrarySize', parseFloat(e.target.value) * 1024 * 1024 * 1024)}
              helperText={`Current limit: ${formatBytes(settings.maxLibrarySize)}`}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Cleanup Settings
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cleanup Threshold (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={settings.cleanupThreshold * 100}
              onChange={(e) => handleInputChange('cleanupThreshold', parseFloat(e.target.value) / 100)}
              helperText="Automatically cleanup when storage reaches this percentage"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                Save Settings
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchSettings}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StoragePathSettings;