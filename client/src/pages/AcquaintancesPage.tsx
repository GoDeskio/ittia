import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Menu,
  MenuItem,
  Drawer,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Link as LinkIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  FamilyRestroom as FamilyIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AcquaintanceService, {
  Acquaintance,
  UnknownVoiceRecording,
} from '../services/AcquaintanceService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface Folder {
  id: string;
  name: string;
  icon?: string;
  acquaintanceIds: string[];
  subfolders?: Folder[];
}

const AcquaintancesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [acquaintances, setAcquaintances] = useState<Acquaintance[]>([]);
  const [unknownRecordings, setUnknownRecordings] = useState<UnknownVoiceRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    recording?: UnknownVoiceRecording;
    firstName: string;
    lastName: string;
    customTag?: string;
  }>({
    open: false,
    firstName: '',
    lastName: '',
  });
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'family',
      name: 'Family',
      icon: 'family',
      acquaintanceIds: [],
      subfolders: [
        { id: 'parents', name: 'Parents', acquaintanceIds: [] },
        { id: 'siblings', name: 'Siblings', acquaintanceIds: [] },
      ],
    },
    {
      id: 'friends',
      name: 'Friends',
      icon: 'friends',
      acquaintanceIds: [],
      subfolders: [
        { id: 'close-friends', name: 'Close Friends', acquaintanceIds: [] },
        { id: 'school-friends', name: 'School Friends', acquaintanceIds: [] },
        { id: 'work-friends', name: 'Work Friends', acquaintanceIds: [] },
      ],
    },
    {
      id: 'work',
      name: 'Work',
      icon: 'work',
      acquaintanceIds: [],
      subfolders: [
        { id: 'colleagues', name: 'Colleagues', acquaintanceIds: [] },
        { id: 'clients', name: 'Clients', acquaintanceIds: [] },
      ],
    },
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderDialog, setNewFolderDialog] = useState({
    open: false,
    name: '',
    parentId: null as string | null,
  });
  const [tagSuggestions] = useState([
    'Family',
    'Friend',
    'Colleague',
    'Brother',
    'Sister',
    'Mother',
    'Father',
    'Cousin',
    'Uncle',
    'Aunt',
    'Grandparent',
    'Neighbor',
    'Classmate',
    'Teacher',
    'Student',
    'Client',
    'Manager',
    'Employee',
    'Partner',
    'Mentor',
    'Mentee',
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [acq, unknown] = await Promise.all([
        AcquaintanceService.getInstance().getAcquaintances(),
        AcquaintanceService.getInstance().getUnknownRecordings(),
      ]);
      setAcquaintances(acq);
      setUnknownRecordings(unknown);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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

  const handleEditDialogOpen = (recording: UnknownVoiceRecording) => {
    setEditDialog({
      open: true,
      recording,
      firstName: '',
      lastName: '',
    });
  };

  const handleEditDialogClose = () => {
    setEditDialog({
      open: false,
      firstName: '',
      lastName: '',
    });
  };

  const handleSaveAcquaintance = async () => {
    if (!editDialog.recording || !editDialog.firstName || !editDialog.lastName) return;

    try {
      await AcquaintanceService.getInstance().createAcquaintance({
        firstName: editDialog.firstName,
        lastName: editDialog.lastName,
        recordingIds: [editDialog.recording.id],
      });
      
      handleEditDialogClose();
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error saving acquaintance:', error);
    }
  };

  const handleLinkToExisting = async (
    recordingId: string,
    acquaintanceId: string
  ) => {
    try {
      await AcquaintanceService.getInstance().linkRecordingToAcquaintance(
        recordingId,
        acquaintanceId
      );
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error linking recording:', error);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderDialog.name) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderDialog.name,
      acquaintanceIds: [],
    };

    if (newFolderDialog.parentId) {
      setFolders(prevFolders => {
        const updateFolders = (folders: Folder[]): Folder[] => {
          return folders.map(folder => {
            if (folder.id === newFolderDialog.parentId) {
              return {
                ...folder,
                subfolders: [...(folder.subfolders || []), newFolder],
              };
            }
            if (folder.subfolders) {
              return {
                ...folder,
                subfolders: updateFolders(folder.subfolders),
              };
            }
            return folder;
          });
        };
        return updateFolders(prevFolders);
      });
    } else {
      setFolders(prev => [...prev, newFolder]);
    }

    setNewFolderDialog({
      open: false,
      name: '',
      parentId: null,
    });
  };

  const handleMoveToFolder = (acquaintanceId: string, folderId: string) => {
    setFolders(prevFolders => {
      const updateFolders = (folders: Folder[]): Folder[] => {
        return folders.map(folder => {
          // Remove from current folder
          const updatedFolder = {
            ...folder,
            acquaintanceIds: folder.acquaintanceIds.filter(id => id !== acquaintanceId),
          };

          // Add to new folder
          if (folder.id === folderId) {
            updatedFolder.acquaintanceIds = [...updatedFolder.acquaintanceIds, acquaintanceId];
          }

          if (folder.subfolders) {
            updatedFolder.subfolders = updateFolders(folder.subfolders);
          }

          return updatedFolder;
        });
      };
      return updateFolders(prevFolders);
    });
  };

  const renderFolderTree = (folders: Folder[]) => {
    return folders.map(folder => (
      <TreeItem
        key={folder.id}
        itemId={folder.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
            {folder.icon === 'family' ? (
              <FamilyIcon sx={{ mr: 1 }} />
            ) : folder.icon === 'friends' ? (
              <PeopleIcon sx={{ mr: 1 }} />
            ) : folder.icon === 'work' ? (
              <WorkIcon sx={{ mr: 1 }} />
            ) : (
              <FolderIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="body2">{folder.name}</Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              ({folder.acquaintanceIds.length})
            </Typography>
          </Box>
        }
        onClick={() => setSelectedFolder(folder.id)}
      >
        {folder.subfolders && renderFolderTree(folder.subfolders)}
      </TreeItem>
    ));
  };

  const handleAddTag = (tag: string) => {
    setEditDialog(prev => ({ ...prev, customTag: tag }));
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
      <Box sx={{ display: 'flex' }}>
        {/* Folder Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              position: 'relative',
              height: 'calc(100vh - 64px)',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Folders
            </Typography>
            <SimpleTreeView>
              {renderFolderTree(folders)}
            </SimpleTreeView>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, ml: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Acquaintances
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
              >
                <Tab label="Unknown Voices" />
                <Tab label="Known Acquaintances" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <List>
                {unknownRecordings.map((recording) => (
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
                      primary={`Unknown Recording - ${new Date(
                        recording.recordedAt
                      ).toLocaleString()}`}
                      secondary={`Duration: ${Math.round(recording.duration)}s`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handlePlay(recording.id, `/api/audio/${recording.audioFileId}`)}
                        sx={{ mr: 1 }}
                      >
                        {playing === recording.id ? <StopIcon /> : <PlayIcon />}
                      </IconButton>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditDialogOpen(recording)}
                        sx={{ mr: 1 }}
                      >
                        Identify
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {acquaintances.map((acquaintance) => (
                  <Grid item xs={12} md={6} key={acquaintance.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          {acquaintance.firstName} {acquaintance.lastName}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Recordings: {acquaintance.recordings.total}
                        </Typography>
                        {acquaintance.metadata?.tags?.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<PersonIcon />}
                          onClick={() => {/* Navigate to acquaintance detail */}}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Paper>
        </Box>

        {/* Speed Dial for Actions */}
        <SpeedDial
          ariaLabel="Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<CreateNewFolderIcon />}
            tooltipTitle="New Folder"
            onClick={() => setNewFolderDialog({ ...newFolderDialog, open: true })}
          />
        </SpeedDial>

        {/* New Folder Dialog */}
        <Dialog
          open={newFolderDialog.open}
          onClose={() => setNewFolderDialog({ ...newFolderDialog, open: false })}
        >
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              value={newFolderDialog.name}
              onChange={(e) =>
                setNewFolderDialog({ ...newFolderDialog, name: e.target.value })
              }
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Parent Folder (Optional)</InputLabel>
              <Select
                value={newFolderDialog.parentId || ''}
                onChange={(e) =>
                  setNewFolderDialog({
                    ...newFolderDialog,
                    parentId: e.target.value as string,
                  })
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setNewFolderDialog({ ...newFolderDialog, open: false })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update the Edit Dialog to include tag suggestions */}
        <Dialog open={editDialog.open} onClose={handleEditDialogClose}>
          <DialogTitle>Identify Unknown Voice</DialogTitle>
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
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Add Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tagSuggestions.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleAddTag(tag)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <TextField
                margin="dense"
                label="Custom Tag"
                size="small"
                value={editDialog.customTag || ''}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, customTag: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleAddTag(editDialog.customTag || '')
                        }
                        edge="end"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            {acquaintances.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Or link to existing acquaintance:
                </Typography>
                {acquaintances.map((acq) => (
                  <Button
                    key={acq.id}
                    size="small"
                    startIcon={<LinkIcon />}
                    onClick={() =>
                      editDialog.recording &&
                      handleLinkToExisting(editDialog.recording.id, acq.id)
                    }
                    sx={{ mr: 1, mb: 1 }}
                  >
                    {acq.firstName} {acq.lastName}
                  </Button>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button
              onClick={handleSaveAcquaintance}
              disabled={!editDialog.firstName || !editDialog.lastName}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AcquaintancesPage; 