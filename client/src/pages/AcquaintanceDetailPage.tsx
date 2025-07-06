import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import AcquaintanceService, { Acquaintance, UnknownVoiceRecording } from '../services/AcquaintanceService';

interface EmotionStats {
  emotion: string;
  count: number;
  percentage: number;
}

const AcquaintanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [acquaintance, setAcquaintance] = useState<Acquaintance | null>(null);
  const [recordings, setRecordings] = useState<UnknownVoiceRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [editDialog, setEditDialog] = useState({
    open: false,
    firstName: '',
    lastName: '',
    relationship: '',
    notes: '',
    newTag: '',
  });
  const [emotionStats, setEmotionStats] = useState<EmotionStats[]>([]);

  useEffect(() => {
    if (id) {
      loadAcquaintanceData(id);
    }
  }, [id]);

  const loadAcquaintanceData = async (acquaintanceId: string) => {
    try {
      const [acquaintanceData, recordingsData] = await Promise.all([
        AcquaintanceService.getInstance().getAcquaintance(acquaintanceId),
        AcquaintanceService.getInstance().getAcquaintanceRecordings(acquaintanceId),
      ]);
      setAcquaintance(acquaintanceData);
      setRecordings(recordingsData);
      calculateEmotionStats(recordingsData);
    } catch (error) {
      console.error('Error loading acquaintance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmotionStats = (recs: UnknownVoiceRecording[]) => {
    const emotionCounts: Record<string, number> = {};
    recs.forEach(rec => {
      if (rec.emotion) {
        emotionCounts[rec.emotion] = (emotionCounts[rec.emotion] || 0) + 1;
      }
    });

    const total = recs.length;
    const stats = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / total) * 100
    }));

    setEmotionStats(stats.sort((a, b) => b.count - a.count));
  };

  const handlePlay = (recordingId: string, audioPath: string) => {
    if (playing === recordingId) {
      audioElement?.pause();
      setPlaying(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(audioPath);
      audio.play();
      setAudioElement(audio);
      setPlaying(recordingId);
      audio.onended = () => {
        setPlaying(null);
        setAudioElement(null);
      };
    }
  };

  const handleEditDialogOpen = () => {
    if (acquaintance) {
      setEditDialog({
        open: true,
        firstName: acquaintance.firstName,
        lastName: acquaintance.lastName,
        relationship: acquaintance.metadata?.relationship || '',
        notes: acquaintance.metadata?.notes || '',
        newTag: '',
      });
    }
  };

  const handleEditDialogClose = () => {
    setEditDialog({
      ...editDialog,
      open: false,
    });
  };

  const handleSaveProfile = async () => {
    if (!acquaintance) return;

    try {
      const updatedAcquaintance = await AcquaintanceService.getInstance().updateAcquaintance(
        acquaintance.id,
        {
          firstName: editDialog.firstName,
          lastName: editDialog.lastName,
          metadata: {
            ...acquaintance.metadata,
            relationship: editDialog.relationship,
            notes: editDialog.notes,
          },
        }
      );
      setAcquaintance(updatedAcquaintance);
      handleEditDialogClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddTag = async (tag: string) => {
    if (!acquaintance || !tag) return;

    const currentTags = acquaintance.metadata?.tags || [];
    if (currentTags.includes(tag)) return;

    try {
      const updatedAcquaintance = await AcquaintanceService.getInstance().updateAcquaintance(
        acquaintance.id,
        {
          metadata: {
            ...acquaintance.metadata,
            tags: [...currentTags, tag],
          },
        }
      );
      setAcquaintance(updatedAcquaintance);
      setEditDialog({ ...editDialog, newTag: '' });
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!acquaintance) return;

    try {
      const updatedAcquaintance = await AcquaintanceService.getInstance().updateAcquaintance(
        acquaintance.id,
        {
          metadata: {
            ...acquaintance.metadata,
            tags: acquaintance.metadata?.tags?.filter(tag => tag !== tagToRemove) || [],
          },
        }
      );
      setAcquaintance(updatedAcquaintance);
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  if (loading || !acquaintance) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
              >
                {acquaintance.firstName[0]}{acquaintance.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {acquaintance.firstName} {acquaintance.lastName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {acquaintance.metadata?.relationship || 'No relationship specified'}
                </Typography>
              </Box>
              <IconButton
                sx={{ position: 'absolute', top: 16, right: 16 }}
                onClick={handleEditDialogOpen}
              >
                <EditIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 2 }}>
              {acquaintance.metadata?.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
              <Chip
                icon={<AddIcon />}
                label="Add Tag"
                onClick={() => setEditDialog({ ...editDialog, open: true })}
                sx={{ mb: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Voice Profile
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Confidence Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={acquaintance.voiceProfile?.confidence || 0 * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Typography variant="body2">
                  Total Recordings: {acquaintance.recordings.total}
                </Typography>
                <Typography variant="body2">
                  Last Updated: {new Date(acquaintance.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Emotional Pattern
                </Typography>
                {emotionStats.map((stat) => (
                  <Box key={stat.emotion} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {stat.emotion} ({stat.count})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stat.percentage}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recordings List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Recordings
            </Typography>
            <List>
              {recordings.map((recording) => (
                <ListItem
                  key={recording.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={new Date(recording.recordedAt).toLocaleString()}
                    secondary={`Duration: ${Math.round(recording.duration)}s`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() =>
                        handlePlay(recording.id, `/api/audio/${recording.audioFileId}`)
                      }
                    >
                      {playing === recording.id ? <StopIcon /> : <PlayIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            fullWidth
            value={editDialog.firstName}
            onChange={(e) =>
              setEditDialog({ ...editDialog, firstName: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={editDialog.lastName}
            onChange={(e) =>
              setEditDialog({ ...editDialog, lastName: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Relationship"
            fullWidth
            value={editDialog.relationship}
            onChange={(e) =>
              setEditDialog({ ...editDialog, relationship: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={editDialog.notes}
            onChange={(e) =>
              setEditDialog({ ...editDialog, notes: e.target.value })
            }
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add New Tag
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                value={editDialog.newTag}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, newTag: e.target.value })
                }
                placeholder="Enter tag"
              />
              <Button
                variant="outlined"
                onClick={() => handleAddTag(editDialog.newTag)}
                disabled={!editDialog.newTag}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleSaveProfile} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AcquaintanceDetailPage; 