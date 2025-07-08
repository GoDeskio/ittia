import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
} from '@mui/material';
import { NeumorphicDesignSystem } from '../../../shared/design-system';

const { colors, shadows, borderRadius } = NeumorphicDesignSystem;
import {
  Delete,
  Edit,
  PlayArrow,
  Stop,
  Add,
} from '@mui/icons-material';

interface VoiceProfile {
  id: string;
  name: string;
  date: string;
  duration: string;
}

const mockProfiles: VoiceProfile[] = [
  {
    id: '1',
    name: 'Default Profile',
    date: '2024-02-20',
    duration: '0:30',
  },
  {
    id: '2',
    name: 'Meeting Voice',
    date: '2024-02-19',
    duration: '1:15',
  },
];

export const VoiceProfileManager: React.FC = () => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>(mockProfiles);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handlePlay = (id: string) => {
    setIsPlaying(id);
    // Implement actual playback logic here
  };

  const handleStop = () => {
    setIsPlaying(null);
    // Implement actual stop logic here
  };

  const handleDelete = (id: string) => {
    setProfiles(profiles.filter(profile => profile.id !== id));
  };

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      const newProfile: VoiceProfile = {
        id: Date.now().toString(),
        name: newProfileName,
        date: new Date().toISOString().split('T')[0],
        duration: '0:00',
      };
      setProfiles([...profiles, newProfile]);
      setNewProfileName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <Box>
      {/* Header with Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
          sx={{
            background: colors.gradients.accent,
            color: colors.text.inverse,
            boxShadow: shadows.raised.md,
            borderRadius: borderRadius['2xl'],
            '&:hover': {
              boxShadow: shadows.hover.md,
              transform: 'translateY(-1px)',
            },
          }}
        >
          Add Profile
        </Button>
      </Box>

      {/* Voice Profiles List */}
      <List sx={{ p: 0 }}>
        {profiles.map((profile) => (
          <ListItem
            key={profile.id}
            sx={{
              background: colors.gradients.secondary,
              mb: 2,
              borderRadius: borderRadius['2xl'],
              boxShadow: shadows.raised.sm,
              transition: NeumorphicDesignSystem.animations.transitions.all,
              '&:hover': {
                boxShadow: shadows.hover.sm,
                transform: 'translateY(-1px)',
                background: colors.gradients.primary,
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                backgroundColor: colors.accent.primary,
                boxShadow: shadows.raised.sm,
              }}
            >
              🎤
            </Avatar>
            <ListItemText
              primary={
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: colors.text.primary,
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {profile.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                  <Chip
                    label={profile.date}
                    size="small"
                    sx={{
                      background: colors.gradients.primary,
                      color: colors.text.secondary,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                  <Chip
                    label={profile.duration}
                    size="small"
                    sx={{
                      background: colors.gradients.primary,
                      color: colors.text.secondary,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() =>
                    isPlaying === profile.id
                      ? handleStop()
                      : handlePlay(profile.id)
                  }
                  sx={{
                    background: colors.gradients.primary,
                    boxShadow: shadows.raised.sm,
                    color: isPlaying === profile.id ? colors.accent.error : colors.accent.success,
                    '&:hover': {
                      boxShadow: shadows.hover.sm,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {isPlaying === profile.id ? <Stop /> : <PlayArrow />}
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(profile.id)}
                  sx={{
                    background: colors.gradients.primary,
                    boxShadow: shadows.raised.sm,
                    color: colors.accent.error,
                    '&:hover': {
                      boxShadow: shadows.hover.sm,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Add Profile Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            background: colors.gradients.primary,
            borderRadius: borderRadius['3xl'],
            boxShadow: shadows.floating.lg,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text.primary, fontWeight: 600 }}>
          Add New Voice Profile
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Profile Name"
            fullWidth
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: colors.background.primary,
                borderRadius: borderRadius['2xl'],
                boxShadow: shadows.inset.md,
                '& fieldset': { display: 'none' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            sx={{
              background: colors.gradients.secondary,
              color: colors.text.primary,
              boxShadow: shadows.raised.sm,
              borderRadius: borderRadius['2xl'],
              '&:hover': {
                boxShadow: shadows.hover.sm,
                transform: 'translateY(-1px)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddProfile} 
            variant="contained"
            sx={{
              background: colors.gradients.accent,
              color: colors.text.inverse,
              boxShadow: shadows.raised.md,
              borderRadius: borderRadius['2xl'],
              '&:hover': {
                boxShadow: shadows.hover.md,
                transform: 'translateY(-1px)',
              },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 