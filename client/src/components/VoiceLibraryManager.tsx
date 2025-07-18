import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  CloudUpload as UploadIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import ElevenLabsService, { Voice, VoiceLibrary } from '../services/ElevenLabsService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voice-tabpanel-${index}`}
      aria-labelledby={`voice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VoiceLibraryManager: React.FC = () => {
  const [voiceLibrary, setVoiceLibrary] = useState<VoiceLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloneForm, setCloneForm] = useState({
    name: '',
    description: '',
    files: [] as File[],
  });
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    loadVoiceLibrary();
  }, []);

  const loadVoiceLibrary = async () => {
    try {
      setLoading(true);
      const library = await ElevenLabsService.getVoiceLibrary();
      setVoiceLibrary(library);
      setError(null);
    } catch (err) {
      setError('Failed to load voice library');
      console.error('Error loading voice library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setCloneForm(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setCloneForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleCloneVoice = async () => {
    if (!cloneForm.name || cloneForm.files.length === 0) {
      setError('Name and at least one audio file are required');
      return;
    }

    try {
      setCloning(true);
      await ElevenLabsService.cloneVoice(
        cloneForm.name,
        cloneForm.description,
        cloneForm.files
      );
      
      // Reset form and close dialog
      setCloneForm({ name: '', description: '', files: [] });
      setCloneDialogOpen(false);
      
      // Reload library
      await loadVoiceLibrary();
      
      setError(null);
    } catch (err) {
      setError('Failed to clone voice');
      console.error('Error cloning voice:', err);
    } finally {
      setCloning(false);
    }
  };

  const handleDeleteVoice = async (voiceId: string, voiceName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${voiceName}"?`)) {
      return;
    }

    try {
      await ElevenLabsService.deleteVoice(voiceId);
      await loadVoiceLibrary();
    } catch (err) {
      setError('Failed to delete voice');
      console.error('Error deleting voice:', err);
    }
  };

  const playVoicePreview = async (voice: Voice) => {
    if (!voice.preview_url) {
      // Generate a sample with the voice
      try {
        const sampleText = "Hello, this is a preview of my voice.";
        const audioBlob = await ElevenLabsService.textToSpeech(sampleText, voice.voice_id);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        
        // Clean up URL after playing
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl);
        });
      } catch (err) {
        setError('Failed to play voice preview');
        console.error('Error playing preview:', err);
      }
    } else {
      const audio = new Audio(voice.preview_url);
      audio.play();
    }
  };

  const renderVoiceCard = (voice: Voice, showDelete: boolean = false) => (
    <Card key={voice.voice_id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {voice.name}
            </Typography>
            {voice.description && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {voice.description}
              </Typography>
            )}
            <Chip
              label={voice.category}
              size="small"
              color={voice.category === 'cloned' ? 'primary' : 'default'}
              sx={{ mt: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => playVoicePreview(voice)}
              color="primary"
              title="Play Preview"
            >
              <PlayIcon />
            </IconButton>
            {showDelete && (
              <IconButton
                onClick={() => handleDeleteVoice(voice.voice_id, voice.name)}
                color="error"
                title="Delete Voice"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Voice Library
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Voice Library Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Premade Voices (${voiceLibrary?.premadeVoices.length || 0})`} />
          <Tab label={`Cloned Voices (${voiceLibrary?.clonedVoices.length || 0})`} />
          <Tab label={`Generated Voices (${voiceLibrary?.generatedVoices.length || 0})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Premade Voices
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Professional voices provided by ElevenLabs
        </Typography>
        {voiceLibrary?.premadeVoices.map(voice => renderVoiceCard(voice))}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6">
              Cloned Voices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voices cloned from your audio samples
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCloneDialogOpen(true)}
          >
            Clone New Voice
          </Button>
        </Box>
        {voiceLibrary?.clonedVoices.map(voice => renderVoiceCard(voice, true))}
        {voiceLibrary?.clonedVoices.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No cloned voices yet. Click "Clone New Voice" to get started.
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Generated Voices
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          AI-generated voices created by ElevenLabs
        </Typography>
        {voiceLibrary?.generatedVoices.map(voice => renderVoiceCard(voice))}
      </TabPanel>

      {/* Clone Voice Dialog */}
      <Dialog
        open={cloneDialogOpen}
        onClose={() => !cloning && setCloneDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Clone New Voice</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Voice Name"
              value={cloneForm.name}
              onChange={(e) => setCloneForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Description (Optional)"
              value={cloneForm.description}
              onChange={(e) => setCloneForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Audio Samples (Required)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload 1-10 high-quality audio samples (WAV, MP3) of the voice you want to clone.
                Each sample should be 30 seconds to 5 minutes long.
              </Typography>
              
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="audio-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="audio-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Audio Files
                </Button>
              </label>

              {cloneForm.files.length > 0 && (
                <List>
                  {cloneForm.files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeFile(index)}
                          disabled={cloning}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {cloning && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Cloning voice... This may take a few minutes.
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialogOpen(false)} disabled={cloning}>
            Cancel
          </Button>
          <Button
            onClick={handleCloneVoice}
            variant="contained"
            disabled={cloning || !cloneForm.name || cloneForm.files.length === 0}
          >
            {cloning ? 'Cloning...' : 'Clone Voice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for quick access */}
      <Fab
        color="primary"
        aria-label="clone voice"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCloneDialogOpen(true)}
      >
        <MicIcon />
      </Fab>
    </Box>
  );
};

export default VoiceLibraryManager;