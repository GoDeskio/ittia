import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Add, Delete, Refresh } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface VoiceLibrary {
  id: string;
  name: string;
  owner: string;
  isPublic: boolean;
  apiKey?: string;
  token?: string;
}

interface VoiceLibrarySelectorProps {
  onLibrarySelect: (library: VoiceLibrary) => void;
  selectedLibraryId?: string;
}

const VoiceLibrarySelector: React.FC<VoiceLibrarySelectorProps> = ({
  onLibrarySelect,
  selectedLibraryId,
}) => {
  const [libraries, setLibraries] = useState<VoiceLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLibrary, setNewLibrary] = useState({
    name: '',
    apiKey: '',
    token: '',
  });
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  const fetchLibraries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/voice/libraries', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch libraries');
      const data = await response.json();
      setLibraries(data.libraries);
    } catch (error) {
      console.error('Error fetching libraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, [user?.token]);

  const handleAddLibrary = async () => {
    try {
      const response = await fetch('/api/voice/libraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newLibrary),
      });

      if (!response.ok) throw new Error('Failed to add library');
      
      await fetchLibraries();
      setIsDialogOpen(false);
      setNewLibrary({ name: '', apiKey: '', token: '' });
    } catch (error) {
      console.error('Error adding library:', error);
    }
  };

  const handleDeleteLibrary = async (libraryId: string) => {
    try {
      const response = await fetch(`/api/voice/libraries/${libraryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete library');
      
      await fetchLibraries();
    } catch (error) {
      console.error('Error deleting library:', error);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          Voice Library
        </Typography>
        <Tooltip title="Add Library">
          <IconButton onClick={() => setIsDialogOpen(true)} size="small">
            <Add />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchLibraries} size="small" disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel>Select Library</InputLabel>
        <Select
          value={selectedLibraryId || ''}
          onChange={(e) => {
            const library = libraries.find(lib => lib.id === e.target.value);
            if (library) onLibrarySelect(library);
          }}
          label="Select Library"
        >
          {libraries.map((library) => (
            <MenuItem key={library.id} value={library.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography>{library.name}</Typography>
                <Box>
                  {library.isPublic && (
                    <Chip
                      label="Public"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLibrary(library.id);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Add Voice Library</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Library Name"
              value={newLibrary.name}
              onChange={(e) => setNewLibrary(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="API Key (optional)"
              value={newLibrary.apiKey}
              onChange={(e) => setNewLibrary(prev => ({ ...prev, apiKey: e.target.value }))}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="Token (optional)"
              value={newLibrary.token}
              onChange={(e) => setNewLibrary(prev => ({ ...prev, token: e.target.value }))}
              margin="normal"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddLibrary}
            variant="contained"
            disabled={!newLibrary.name}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoiceLibrarySelector; 