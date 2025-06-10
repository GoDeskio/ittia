import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Toolbar,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  open: boolean;
  drawerWidth: number;
}

export const Navigation: React.FC<NavigationProps> = ({ open, drawerWidth }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component={Link} to="/profile">
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>

        <ListItem button component={Link} to="/messages">
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary="Messages" />
        </ListItem>

        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>

        {isAdmin && (
          <ListItem button component={Link} to="/error-logs">
            <ListItemIcon>
              <BugReportIcon />
            </ListItemIcon>
            <ListItemText primary="Error Logs" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
}; 