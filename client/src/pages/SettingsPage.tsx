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

const SettingsPage: React.FC = () => {
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="settings tabs">
            <Tab
              icon={<FormatSizeIcon />}
              iconPosition="start"
              label="Appearance"
              id="settings-tab-0"
            />
            <Tab
              icon={<NotificationsIcon />}
              iconPosition="start"
              label="Notifications"
              id="settings-tab-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Font Size
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <TextDecreaseIcon />
                <Slider
                  value={baseFontSize}
                  onChange={handleBaseFontSizeChange}
                  min={12}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ flexGrow: 1 }}
                />
                  <TextIncreaseIcon />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Header Scale
              </Typography>
              <Slider
                value={headerScale}
                onChange={handleHeaderScaleChange}
                min={1}
                max={2}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Table Scale
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TableChartIcon />
              <Slider
                value={tableScale}
                onChange={handleTableScaleChange}
                  min={0.8}
                max={1.5}
                  step={0.1}
                marks
                valueLabelDisplay="auto"
                  sx={{ flexGrow: 1 }}
              />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                UI Element Scale
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AspectRatioIcon />
              <Slider
                value={elementScale}
                onChange={handleElementScaleChange}
                  min={0.8}
                max={1.5}
                  step={0.1}
                marks
                valueLabelDisplay="auto"
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  startIcon={<ResetIcon />}
                  onClick={handleResetAppearance}
                  variant="outlined"
                >
                  Reset to Defaults
                </Button>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={handleSaveSettings}
                  variant="contained"
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <NotificationSettings />
        </TabPanel>

        <Box sx={{ mt: 4 }}>
          <StoragePathSettings />
        </Box>

        {showSaveSuccess && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
            onClose={() => setShowSaveSuccess(false)}
          >
            Settings saved successfully!
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SettingsPage; 