import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Slider,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Button,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  RestartAlt as ResetIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  FormatSize as FormatSizeIcon,
  TableChart as TableChartIcon,
  AspectRatio as AspectRatioIcon,
} from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';

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
  const { theme, updateTheme } = useContext(ThemeContext);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Font size settings
  const [baseFontSize, setBaseFontSize] = useState(theme.typography.fontSize || 14);
  const [headerScale, setHeaderScale] = useState(1.5);
  const [tableScale, setTableScale] = useState(1);
  const [elementScale, setElementScale] = useState(1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBaseFontSizeChange = (event: Event, newValue: number | number[]) => {
    const size = newValue as number;
    setBaseFontSize(size);
    updateTheme({
      ...theme,
      typography: {
        ...theme.typography,
        fontSize: size,
      },
    });
  };

  const handleHeaderScaleChange = (event: Event, newValue: number | number[]) => {
    const scale = newValue as number;
    setHeaderScale(scale);
    updateTheme({
      ...theme,
      typography: {
        ...theme.typography,
        h1: { fontSize: `${scale * 2.5}rem` },
        h2: { fontSize: `${scale * 2}rem` },
        h3: { fontSize: `${scale * 1.75}rem` },
        h4: { fontSize: `${scale * 1.5}rem` },
        h5: { fontSize: `${scale * 1.25}rem` },
        h6: { fontSize: `${scale}rem` },
      },
    });
  };

  const handleTableScaleChange = (event: Event, newValue: number | number[]) => {
    const scale = newValue as number;
    setTableScale(scale);
    updateTheme({
      ...theme,
      components: {
        ...theme.components,
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: `${8 * scale}px`,
              fontSize: `${14 * scale}px`,
            },
          },
        },
      },
    });
  };

  const handleElementScaleChange = (event: Event, newValue: number | number[]) => {
    const scale = newValue as number;
    setElementScale(scale);
    updateTheme({
      ...theme,
      components: {
        ...theme.components,
        MuiButton: {
          styleOverrides: {
            root: {
              padding: `${6 * scale}px ${16 * scale}px`,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              padding: `${8 * scale}px`,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              padding: `${16 * scale}px`,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              padding: `${8 * scale}px ${16 * scale}px`,
            },
          },
        },
      },
    });
  };

  const handleResetAppearance = () => {
    setBaseFontSize(14);
    setHeaderScale(1.5);
    setTableScale(1);
    setElementScale(1);
    updateTheme({
      ...theme,
      typography: {
        ...theme.typography,
        fontSize: 14,
        h1: { fontSize: '2.5rem' },
        h2: { fontSize: '2rem' },
        h3: { fontSize: '1.75rem' },
        h4: { fontSize: '1.5rem' },
        h5: { fontSize: '1.25rem' },
        h6: { fontSize: '1rem' },
      },
      components: {
        ...theme.components,
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '8px',
              fontSize: '14px',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              padding: '6px 16px',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              padding: '8px',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              padding: '16px',
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              padding: '8px 16px',
            },
          },
        },
      },
    });
  };

  const handleSaveSettings = () => {
    // Save settings to local storage or backend
    localStorage.setItem('userThemeSettings', JSON.stringify({
      baseFontSize,
      headerScale,
      tableScale,
      elementScale,
    }));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Appearance" />
            <Tab label="Notifications" />
            <Tab label="Privacy" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize the size of text, tables, and other elements to your preference.
            </Typography>
          </Box>

          {showSaveSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Settings saved successfully!
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Base Font Size */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormatSizeIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Base Font Size</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => setBaseFontSize(Math.max(10, baseFontSize - 1))}
                  size="small"
                >
                  <TextDecreaseIcon />
                </IconButton>
                <Slider
                  value={baseFontSize}
                  onChange={handleBaseFontSizeChange}
                  min={10}
                  max={20}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  onClick={() => setBaseFontSize(Math.min(20, baseFontSize + 1))}
                  size="small"
                >
                  <TextIncreaseIcon />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 40 }}>
                  {baseFontSize}px
                </Typography>
              </Box>
            </Grid>

            {/* Header Scale */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextIncreaseIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Header Scale</Typography>
              </Box>
              <Slider
                value={headerScale}
                onChange={handleHeaderScaleChange}
                min={0.75}
                max={2}
                step={0.05}
                marks
                valueLabelDisplay="auto"
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="h1">Heading 1</Typography>
                <Typography variant="h2">Heading 2</Typography>
                <Typography variant="h3">Heading 3</Typography>
              </Box>
            </Grid>

            {/* Table Scale */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TableChartIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Table Scale</Typography>
              </Box>
              <Slider
                value={tableScale}
                onChange={handleTableScaleChange}
                min={0.75}
                max={1.5}
                step={0.05}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* Element Scale */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AspectRatioIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">UI Element Scale</Typography>
              </Box>
              <Slider
                value={elementScale}
                onChange={handleElementScaleChange}
                min={0.75}
                max={1.5}
                step={0.05}
                marks
                valueLabelDisplay="auto"
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained">Sample Button</Button>
                <Button variant="outlined">Sample Button</Button>
                <IconButton>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  startIcon={<ResetIcon />}
                  onClick={handleResetAppearance}
                  variant="outlined"
                  color="warning"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Other tab panels */}
        <TabPanel value={currentTab} index={0}>
          {/* General Settings Content */}
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          {/* Notifications Settings Content */}
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          {/* Privacy Settings Content */}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsPage; 