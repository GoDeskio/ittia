import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Settings,
  Mic,
  Save,
  Delete,
  VolumeUp,
  Lock,
} from '@mui/icons-material';

const commands = [
  {
    command: 'Open Settings',
    description: 'Open the application settings',
    icon: <Settings />,
    category: 'Navigation',
  },
  {
    command: 'Start Recording',
    description: 'Begin voice recording',
    icon: <Mic />,
    category: 'Voice',
  },
  {
    command: 'Save Voice Profile',
    description: 'Save the current voice recording as a profile',
    icon: <Save />,
    category: 'Voice',
  },
  {
    command: 'Delete Last Recording',
    description: 'Delete the most recent voice recording',
    icon: <Delete />,
    category: 'Voice',
  },
  {
    command: 'Adjust Volume',
    description: 'Adjust system volume',
    icon: <VolumeUp />,
    category: 'System',
  },
  {
    command: 'Lock Screen',
    description: 'Lock the computer screen',
    icon: <Lock />,
    category: 'System',
  },
];

export const SystemCommands: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Commands
      </Typography>

      <List>
        {commands.map((cmd, index) => (
          <ListItem
            key={index}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>{cmd.icon}</ListItemIcon>
            <ListItemText
              primary={cmd.command}
              secondary={cmd.description}
            />
            <Chip
              label={cmd.category}
              size="small"
              color="primary"
              variant="outlined"
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 