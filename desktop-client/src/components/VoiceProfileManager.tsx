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
} from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Voice Profiles</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add Profile
        </Button>
      </Box>

      <List>
        {profiles.map((profile) => (
          <ListItem
            key={profile.id}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={profile.name}
              secondary={`Created: ${profile.date} | Duration: ${profile.duration}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() =>
                  isPlaying === profile.id
                    ? handleStop()
                    : handlePlay(profile.id)
                }
              >
                {isPlaying === profile.id ? <Stop /> : <PlayArrow />}
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(profile.id)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Add New Voice Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Profile Name"
            fullWidth
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProfile} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 