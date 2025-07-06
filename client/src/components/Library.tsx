import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface AudioFile {
  id: string;
  filename: string;
  createdAt: string;
  duration: number;
  size: number;
  url: string;
}

export default function Library() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const response = await axios.get('/api/audio');
      setAudioFiles(response.data);
    } catch (err) {
      setError('Failed to fetch audio files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('audio', file);

    try {
      await axios.post('/api/audio/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(progress);
        },
      });
      fetchAudioFiles();
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to upload audio file');
      setUploadProgress(0);
    }
  };

  const handlePlay = (audioId: string, url: string) => {
    if (playing === audioId) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      } else {
        audioRef.current = new Audio(url);
        audioRef.current.play();
      }
      setPlaying(audioId);
    }
  };

  const handleDelete = async (audioId: string) => {
    try {
      await axios.delete(`/api/audio/${audioId}`);
      setAudioFiles((prev) => prev.filter((file) => file.id !== audioId));
      setDeleteDialog(null);
    } catch (err) {
      setError('Failed to delete audio file');
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'audio/wav' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download audio file');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Audio Library</Typography>
        <Button
          variant="contained"
          component="label"
          disabled={uploadProgress > 0}
        >
          Upload Audio
          <input
            type="file"
            hidden
            accept=".wav"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {uploadProgress > 0 && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      <Grid container spacing={2}>
        {audioFiles.map((file) => (
          <Grid item xs={12} sm={6} md={4} key={file.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  {file.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {formatDuration(file.duration)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatSize(file.size)}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => handlePlay(file.id, file.url)}
                  color={playing === file.id ? 'primary' : 'default'}
                >
                  {playing === file.id ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
                <IconButton onClick={() => handleDownload(file.url, file.filename)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={() => setDeleteDialog(file.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(deleteDialog)}
        onClose={() => setDeleteDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Audio File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this audio file? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button
            onClick={() => deleteDialog && handleDelete(deleteDialog)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
} 