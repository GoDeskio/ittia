import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface UploadConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  storageQuota: number;
}

const UploadSettings: React.FC = () => {
  const [config, setConfig] = useState<UploadConfig>({
    maxFileSize: 25,
    allowedFileTypes: [],
    storageQuota: 100,
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/upload-settings');
      setConfig(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch upload settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/admin/upload-settings', config);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <Typography>Loading settings...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Settings
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>Maximum File Size (GB)</Typography>
            <Slider
              value={config.maxFileSize}
              onChange={(_, value) =>
                setConfig((prev) => ({ ...prev, maxFileSize: value as number }))
              }
              min={1}
              max={25}
              valueLabelDisplay="auto"
              marks={[
                { value: 1, label: '1GB' },
                { value: 10, label: '10GB' },
                { value: 25, label: '25GB' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>Storage Quota per User (GB)</Typography>
            <Slider
              value={config.storageQuota}
              onChange={(_, value) =>
                setConfig((prev) => ({ ...prev, storageQuota: value as number }))
              }
              min={10}
              max={1000}
              valueLabelDisplay="auto"
              marks={[
                { value: 10, label: '10GB' },
                { value: 100, label: '100GB' },
                { value: 1000, label: '1TB' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>Allowed File Types</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={config.allowedFileTypes.join('\n')}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  allowedFileTypes: e.target.value.split('\n'),
                }))
              }
              placeholder=".mp3&#10;.wav&#10;.m4a"
              helperText="Enter one file extension per line"
            />
          </Box>

          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Settings
          </Button>

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UploadSettings; 