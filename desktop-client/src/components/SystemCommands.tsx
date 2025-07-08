import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
} from '@mui/material';
import { NeumorphicDesignSystem } from '../../../shared/design-system';

const { colors, shadows, borderRadius } = NeumorphicDesignSystem;
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
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Navigation': return colors.accent.info;
      case 'Voice': return colors.accent.primary;
      case 'System': return colors.accent.success;
      default: return colors.accent.secondary;
    }
  };

  return (
    <Box>
      <List sx={{ p: 0 }}>
        {commands.map((cmd, index) => (
          <ListItem
            key={index}
            sx={{
              background: colors.gradients.secondary,
              mb: 2,
              borderRadius: borderRadius['2xl'],
              boxShadow: shadows.raised.sm,
              cursor: 'pointer',
              transition: NeumorphicDesignSystem.animations.transitions.all,
              '&:hover': {
                boxShadow: shadows.hover.sm,
                transform: 'translateY(-1px)',
                background: colors.gradients.primary,
              },
              '&:active': {
                boxShadow: shadows.inset.sm,
                transform: 'translateY(0px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 48 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: getCategoryColor(cmd.category),
                  boxShadow: shadows.raised.sm,
                }}
              >
                {React.cloneElement(cmd.icon, { sx: { fontSize: 18, color: 'white' } })}
              </Avatar>
            </ListItemIcon>
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
                  {cmd.command}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.text.secondary,
                    fontSize: '0.8rem',
                  }}
                >
                  {cmd.description}
                </Typography>
              }
            />
            <Chip
              label={cmd.category}
              size="small"
              sx={{
                background: colors.gradients.primary,
                color: colors.text.primary,
                boxShadow: shadows.raised.sm,
                border: 'none',
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 