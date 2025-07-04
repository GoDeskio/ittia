import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Slider,
  Grid,
  Button,
  Tab,
  Tabs,
  Alert,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  RestartAlt as ResetIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  FormatSize as FormatSizeIcon,
  TableChart as TableChartIcon,
  AspectRatio as AspectRatioIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import NotificationSettings from '../components/NotificationSettings';
import StoragePathSettings from '../components/StoragePathSettings';
import ApiTokenDisplay from '../components/ApiTokenDisplay';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * SettingsPage Component
 * 
 * The main settings page for the application.
 * Features:
 * - API token management
 * - Profile settings
 * - Theme-aware styling
 * - Responsive layout
 */
const SettingsPage: React.FC = () => {
  // Auth and theme context hooks
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Font size settings
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [headerScale, setHeaderScale] = useState(1.5);
  const [tableScale, setTableScale] = useState(1);
  const [elementScale, setElementScale] = useState(1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBaseFontSizeChange = (event: Event, newValue: number | number[]) => {
    setBaseFontSize(newValue as number);
  };

  const handleHeaderScaleChange = (event: Event, newValue: number | number[]) => {
    setHeaderScale(newValue as number);
  };

  const handleTableScaleChange = (event: Event, newValue: number | number[]) => {
    setTableScale(newValue as number);
  };

  const handleElementScaleChange = (event: Event, newValue: number | number[]) => {
    setElementScale(newValue as number);
  };

  const handleResetAppearance = () => {
    setBaseFontSize(14);
    setHeaderScale(1.5);
    setTableScale(1);
    setElementScale(1);
  };

  const handleSaveSettings = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Return null if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    // Main container with responsive max width
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Page header */}
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        {/* Main settings content card */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
          }}
        >
          {/* API token section */}
          <ApiTokenDisplay apiToken={user.apiToken || ''} />
          
          {/* Visual separator between sections */}
          <Divider sx={{ my: 3 }} />
          
          {/* Profile settings section */}
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          {/* Add profile settings components here */}
        </Paper>
      </Box>
    </Container>
  );
};

export default SettingsPage; 