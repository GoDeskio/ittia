import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  LibraryMusic as LibraryIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Mic as MicIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SIDEBAR_WIDTH_COLLAPSED = 70;
const SIDEBAR_WIDTH_EXPANDED = 280;

interface NeumorphicSidebarProps {
  className?: string;
}

const NeumorphicSidebar: React.FC<NeumorphicSidebarProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Voice Recording', icon: <MicIcon />, path: '/dashboard' },
    { text: 'Raw Audio Cache', icon: <StorageIcon />, path: '/cache' },
    { text: 'Word Library', icon: <LibraryIcon />, path: '/library' },
    { text: 'Acquaintances', icon: <GroupIcon />, path: '/acquaintances' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
  ];

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <Box
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        backgroundColor: '#e0e5ec',
        boxShadow: isExpanded 
          ? '12px 0 24px rgba(163,177,198,0.4), -4px 0 8px rgba(255,255,255,0.3)'
          : '6px 0 12px rgba(163,177,198,0.3), -2px 0 4px rgba(255,255,255,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* User Profile Section */}
      <Box
        sx={{
          p: isExpanded ? 3 : 1.5,
          display: 'flex',
          flexDirection: isExpanded ? 'column' : 'column',
          alignItems: 'center',
          minHeight: isExpanded ? 140 : 80,
          background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
          boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.4), inset -3px -3px 6px rgba(255,255,255,0.6)',
          borderRadius: isExpanded ? '0 0 20px 0' : '0 0 15px 0',
          transition: 'all 0.3s ease',
        }}
      >
        <Avatar
          src={user?.profilePicture}
          alt={user?.name || user?.username}
          sx={{
            width: isExpanded ? 60 : 40,
            height: isExpanded ? 60 : 40,
            mb: isExpanded ? 1.5 : 0,
            boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.7)',
            border: '2px solid rgba(255,255,255,0.3)',
            transition: 'all 0.3s ease',
            fontSize: isExpanded ? '1.5rem' : '1rem',
            backgroundColor: '#d1d9e6',
            color: '#4a4a4a',
          }}
        >
          {!user?.profilePicture && (user?.name?.[0] || user?.username?.[0] || 'U')}
        </Avatar>
        
        {isExpanded && (
          <Box sx={{ textAlign: 'center', opacity: isExpanded ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#4a4a4a',
                fontWeight: 600,
                fontSize: '0.95rem',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {user?.name || user?.username}
            </Typography>
            {user?.title && (
              <Typography
                variant="caption"
                sx={{
                  color: '#666666',
                  fontSize: '0.75rem',
                  fontStyle: 'italic',
                }}
              >
                {user.title}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip 
                title={!isExpanded ? item.text : ''} 
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: '15px',
                    minHeight: 48,
                    px: isExpanded ? 2 : 1.5,
                    backgroundColor: location.pathname === item.path 
                      ? 'rgba(209,217,230,0.6)' 
                      : 'transparent',
                    boxShadow: location.pathname === item.path
                      ? 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.6)'
                      : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(209,217,230,0.4)',
                      boxShadow: '2px 2px 4px rgba(163,177,198,0.3), -2px -2px 4px rgba(255,255,255,0.5)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isExpanded ? 40 : 'auto',
                      mr: isExpanded ? 1 : 0,
                      color: location.pathname === item.path ? '#2196F3' : '#4a4a4a',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: isExpanded ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: location.pathname === item.path ? 600 : 400,
                          color: location.pathname === item.path ? '#2196F3' : '#4a4a4a',
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Settings Section at Bottom */}
      <Box
        sx={{
          p: isExpanded ? 2 : 1.5,
          borderTop: '1px solid rgba(163,177,198,0.2)',
          background: 'linear-gradient(145deg, #d1d9e6, #e6ebf2)',
        }}
      >
        <Tooltip title={!isExpanded ? 'Settings' : ''} placement="right" arrow>
          <IconButton
            onClick={handleSettingsClick}
            sx={{
              width: isExpanded ? '100%' : 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: location.pathname === '/settings' 
                ? 'rgba(209,217,230,0.6)' 
                : 'transparent',
              boxShadow: location.pathname === '/settings'
                ? 'inset 3px 3px 6px rgba(163,177,198,0.4), inset -3px -3px 6px rgba(255,255,255,0.6)'
                : '3px 3px 6px rgba(163,177,198,0.3), -3px -3px 6px rgba(255,255,255,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(209,217,230,0.4)',
                boxShadow: '2px 2px 4px rgba(163,177,198,0.3), -2px -2px 4px rgba(255,255,255,0.5)',
              },
              transition: 'all 0.2s ease',
              display: 'flex',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              px: isExpanded ? 2 : 0,
            }}
          >
            <SettingsIcon 
              sx={{ 
                color: location.pathname === '/settings' ? '#2196F3' : '#4a4a4a',
                mr: isExpanded ? 1 : 0,
              }} 
            />
            {isExpanded && (
              <Typography
                variant="body2"
                sx={{
                  color: location.pathname === '/settings' ? '#2196F3' : '#4a4a4a',
                  fontWeight: location.pathname === '/settings' ? 600 : 400,
                  fontSize: '0.9rem',
                }}
              >
                Settings
              </Typography>
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default NeumorphicSidebar;