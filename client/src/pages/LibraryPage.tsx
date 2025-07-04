import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import AudioProcessingService, { WordFile } from '../services/AudioProcessingService';

const LibraryPage: React.FC = () => {
  const [wordFiles, setWordFiles] = useState<WordFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<WordFile[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWordFiles();
  }, []);

  useEffect(() => {
    filterWords();
  }, [searchTerm, wordFiles]);

  const loadWordFiles = async () => {
    try {
      const files = await AudioProcessingService.getInstance().getWordLibrary();
      setWordFiles(files);
      setFilteredFiles(files);
    } catch (error) {
      console.error('Error loading word files:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWords = () => {
    const filtered = wordFiles.filter(file =>
      file.word.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
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

  const handleDelete = async (wordId: string) => {
    try {
      await AudioProcessingService.getInstance().deleteWordFile(wordId);
      setWordFiles(files => files.filter(f => f.id !== wordId));
    } catch (error) {
      console.error('Error deleting word file:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">
            Word Library
          </Typography>
          <TextField
            size="small"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Grid container spacing={2}>
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {file.word}
                  </Typography>
                  <Chip
                    label={`${Math.round(file.confidence * 100)}% confidence`}
                    color={file.confidence > 0.8 ? "success" : "warning"}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(file.createdAt)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => handlePlay(file.id, file.path)}
                  >
                    {playing === file.id ? <StopIcon /> : <PlayIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(file.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {filteredFiles.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No matching words found' : 'No words in library'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LibraryPage; 