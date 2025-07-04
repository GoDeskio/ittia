import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const StoragePathSettings: React.FC = () => {
  const { token } = useAuth();
  const [libraryPath, setLibraryPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStoragePath();
  }, []);

  const fetchStoragePath = async () => {
    try {
      const response = await axios.get('/api/settings/storage-path', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLibraryPath(response.data.libraryPath);
      setLoading(false);
    } catch (err) {
      setError('Failed to load storage path settings');
      setLoading(false);
    }
  };

  const handleSelectPath = async () => {
    try {
      const result = await window.electron.selectDirectory();
      if (result) {
        setLibraryPath(result);
      }
    } catch (err) {
      setError('Failed to select directory');
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/settings/storage-path', 
        { libraryPath },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Storage path updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update storage path');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Storage Path Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Library Storage Path
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            value={libraryPath}
            onChange={(e) => setLibraryPath(e.target.value)}
            placeholder="Select a directory for library storage"
            InputProps={{
              readOnly: true,
            }}
          />
          <Button
            variant="contained"
            startIcon={<FolderOpenIcon />}
            onClick={handleSelectPath}
          >
            Browse
          </Button>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={!libraryPath}
      >
        Save Settings
      </Button>
    </Paper>
  );
};

export default StoragePathSettings; 