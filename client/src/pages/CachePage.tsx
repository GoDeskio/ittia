import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CloudUpload as ProcessIcon
} from '@mui/icons-material';
import AudioProcessingService, { AudioFile } from '../services/AudioProcessingService';

const CachePage: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadAudioFiles();
  }, []);

  const loadAudioFiles = async () => {
    try {
      const files = await AudioProcessingService.getInstance().getCachedFiles();
      setAudioFiles(files);
    } catch (error) {
      console.error('Error loading audio files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (audioId: string, path: string) => {
    if (playing === audioId) {
      audioElement?.pause();
      setPlaying(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(path);
      audio.play();
      setAudioElement(audio);
      setPlaying(audioId);
      audio.onended = () => {
        setPlaying(null);
        setAudioElement(null);
      };
    }
  };

  const handleDelete = async (audioId: string) => {
    try {
      await AudioProcessingService.getInstance().deleteCachedFile(audioId);
      setAudioFiles(files => files.filter(f => f.id !== audioId));
    } catch (error) {
      console.error('Error deleting audio file:', error);
    }
  };

  const handleProcess = async (audioId: string) => {
    try {
      await AudioProcessingService.getInstance().processAudioFile(audioId);
      // Update the status of the processed file
      setAudioFiles(files =>
        files.map(f =>
          f.id === audioId ? { ...f, status: 'processing' } : f
        )
      );
    } catch (error) {
      console.error('Error processing audio file:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Raw Audio Cache
        </Typography>
        <List>
          {audioFiles.map((file) => (
            <ListItem
              key={file.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemText
                primary={file.name}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      Duration: {formatDuration(file.duration)}
                    </Typography>
                    <br />
                    Created: {formatDate(file.createdAt)}
                    <br />
                    Status: {file.status}
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handlePlay(file.id, file.path)}
                  sx={{ mr: 1 }}
                >
                  {playing === file.id ? <StopIcon /> : <PlayIcon />}
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<ProcessIcon />}
                  onClick={() => handleProcess(file.id)}
                  disabled={file.status === 'processing'}
                  sx={{ mr: 1 }}
                >
                  Process
                </Button>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(file.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {audioFiles.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography color="text.secondary">
              No audio files in cache
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CachePage; 