import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface CachedRecording {
  id: string;
  filename: string;
  duration: number;
  timestamp: Date;
  size: number;
  url: string;
}

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface CachedFile {
  _id: string;
  filename: string;
  size: number;
  duration: number;
  createdAt: string;
  processed: boolean;
}

const CacheStorage: React.FC = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState<CachedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fetchCachedFiles = async () => {
    try {
      const response = await axios.get('/api/audio/cache', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cached files');
      setLoading(false);
    }
  };

  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}...`,
        }));
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      setError('Failed to load audio devices');
    }
  };

  useEffect(() => {
    loadAudioDevices();
    fetchCachedFiles();
  }, [token]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDevice },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, `recording-${Date.now()}.wav`);

        try {
          await axios.post('/api/audio/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
          fetchCachedFiles();
        } catch (err) {
          setError('Failed to upload recording');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/audio/cache/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter(file => file._id !== id));
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Record Audio
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color={isRecording ? 'error' : 'primary'}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else {
                setShowDeviceDialog(true);
              }
            }}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Cache Storage
        </Typography>

        <List>
          {files.map((file) => (
            <ListItem key={file._id}>
              <ListItemText
                primary={file.filename}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      Size: {formatBytes(file.size)} | Duration: {formatDuration(file.duration)}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      Created: {new Date(file.createdAt).toLocaleString()}
                    </Typography>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                {file.processed && (
                  <IconButton
                    edge="end"
                    aria-label="processed"
                    sx={{ mr: 1, color: 'success.main' }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(file._id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {files.length === 0 && (
            <ListItem>
              <ListItemText primary="No files in cache" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={showDeviceDialog} onClose={() => setShowDeviceDialog(false)}>
        <DialogTitle>Select Recording Device</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Microphone</InputLabel>
            <Select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              label="Microphone"
            >
              {audioDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeviceDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowDeviceDialog(false);
              startRecording();
            }}
            variant="contained"
          >
            Start Recording
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CacheStorage; 