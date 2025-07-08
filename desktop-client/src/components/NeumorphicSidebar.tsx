import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
} from '@mui/material';
import {
  Home,
  Mic,
  Storage,
  LibraryBooks,
  People,
  Person,
  Info,
  Settings,
} from '@mui/icons-material';
import { NeumorphicDesignSystem } from '../../../shared/design-system';

const { colors, shadows, borderRadius, spacing } = NeumorphicDesignSystem;

interface NeumorphicSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home />, emoji: '🏠' },
  { id: 'recording', label: 'Voice Recording', icon: <Mic />, emoji: '🎤' },
  { id: 'cache', label: 'Raw Audio Cache', icon: <Storage />, emoji: '💾' },
  { id: 'library', label: 'Word Library', icon: <LibraryBooks />, emoji: '📚' },
  { id: 'acquaintances', label: 'Acquaintances', icon: <People />, emoji: '👥' },
  { id: 'profile', label: 'Profile', icon: <Person />, emoji: '👤' },
  { id: 'about', label: 'About', icon: <Info />, emoji: 'ℹ️' },
];

export const NeumorphicSidebar: React.FC<NeumorphicSidebarProps> = ({
  open,
  onClose,
  onNavigate,
  currentPage,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sidebarWidth = isHovered ? 280 : 70;

  const handleNavigate = (pageId: string) => {
    onNavigate(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <Box
      sx={{
        width: sidebarWidth,
        height: '100vh',
        background: colors.background.primary,
        boxShadow: isHovered 
          ? '12px 0 24px rgba(163,177,198,0.4), -4px 0 8px rgba(255,255,255,0.3)'
          : '6px 0 12px rgba(163,177,198,0.3), -2px 0 4px rgba(255,255,255,0.2)',
        transition: NeumorphicDesignSystem.animations.transitions.all,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* User Profile Section */}
      <Box
        sx={{
          p: isHovered ? 3 : 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: isHovered ? 140 : 80,
          background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
          boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.4), inset -3px -3px 6px rgba(255,255,255,0.6)',
          borderRadius: '0 0 15px 0',
          transition: NeumorphicDesignSystem.animations.transitions.all,
        }}
      >
        <Avatar
          sx={{
            width: isHovered ? 60 : 40,
            height: isHovered ? 60 : 40,
            background: 'linear-gradient(145deg, #d1d9e6, #b8c3d9)',
            boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.7)',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: isHovered ? '1.5rem' : '1rem',
            fontWeight: 600,
            color: colors.text.primary,
            transition: NeumorphicDesignSystem.animations.transitions.all,
            mb: isHovered ? 1.5 : 0,
          }}
        >
          JD
        </Avatar>
        
        <Box
          sx={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: colors.text.primary,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            John Doe
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.secondary,
              fontStyle: 'italic',
              fontSize: '0.75rem',
            }}
          >
            Voice Artist
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, p: 1 }}>
        <List sx={{ p: 0 }}>
          {navigationItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                mb: 0.5,
                borderRadius: borderRadius['2xl'],
                cursor: 'pointer',
                transition: NeumorphicDesignSystem.animations.transitions.all,
                minHeight: 48,
                background: currentPage === item.id 
                  ? 'rgba(209,217,230,0.6)' 
                  : 'transparent',
                boxShadow: currentPage === item.id 
                  ? 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.6)'
                  : 'none',
                '&:hover': {
                  background: 'rgba(209,217,230,0.4)',
                  boxShadow: '2px 2px 4px rgba(163,177,198,0.3), -2px -2px 4px rgba(255,255,255,0.5)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 24,
                  mr: isHovered ? 2 : 0,
                  transition: NeumorphicDesignSystem.animations.transitions.all,
                  color: currentPage === item.id ? colors.accent.primary : colors.text.primary,
                }}
              >
                <Box sx={{ fontSize: '1.2rem' }}>
                  {item.emoji}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: currentPage === item.id ? 600 : 400,
                    color: currentPage === item.id ? colors.accent.primary : colors.text.primary,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Settings Section */}
      <Box
        sx={{
          p: isHovered ? 2 : 1.5,
          borderTop: '1px solid rgba(163,177,198,0.2)',
          background: 'linear-gradient(145deg, #d1d9e6, #e6ebf2)',
        }}
      >
        <IconButton
          onClick={() => handleNavigate('settings')}
          sx={{
            width: isHovered ? '100%' : 40,
            height: 40,
            borderRadius: borderRadius['2xl'],
            background: 'transparent',
            boxShadow: '3px 3px 6px rgba(163,177,198,0.3), -3px -3px 6px rgba(255,255,255,0.5)',
            color: colors.text.primary,
            transition: NeumorphicDesignSystem.animations.transitions.all,
            justifyContent: isHovered ? 'flex-start' : 'center',
            px: isHovered ? 2 : 0,
            '&:hover': {
              background: 'rgba(209,217,230,0.4)',
              boxShadow: '2px 2px 4px rgba(163,177,198,0.3), -2px -2px 4px rgba(255,255,255,0.5)',
            },
          }}
        >
          <Settings sx={{ fontSize: '1.2rem' }} />
          <Typography
            variant="body2"
            sx={{
              ml: isHovered ? 1 : 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              fontWeight: 400,
            }}
          >
            Settings
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1200,
        }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            border: 'none',
            boxShadow: shadows.floating.xl,
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};

export default NeumorphicSidebar;