import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  Grid,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useTheme } from '../../contexts/ThemeContext';
import { StyledCard } from '../shared/StyledComponents';
import NeumorphicIcon from '../shared/NeumorphicIcon';

interface StylePreview {
  boxShadow: string;
  borderRadius: string;
  backgroundColor: string;
}

interface AnimationSettings {
  hoverScale: number;
  hoverTranslateY: number;
  pressedScale: number;
  transitionDuration: number;
  transitionEasing: string;
}

interface StylePreset {
  name: string;
  settings: {
    shadowDistance: number;
    shadowBlur: number;
    shadowIntensity: number;
    borderRadius: number;
    lightShadowOpacity: number;
    darkShadowOpacity: number;
    useInsetShadow: boolean;
  };
  colors: {
    primaryColor: string;
    secondaryColor: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  animations: AnimationSettings;
}

const defaultAnimations: AnimationSettings = {
  hoverScale: 1.02,
  hoverTranslateY: -2,
  pressedScale: 0.98,
  transitionDuration: 300,
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const NeumorphicStyleEditor: React.FC = () => {
  const { colors, updateColors, updateNeumorphicSettings, neumorphicSettings } = useTheme();
  const [previewStyle, setPreviewStyle] = useState<StylePreview>({
    boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
    borderRadius: '15px',
    backgroundColor: '#e0e5ec',
  });

  const [settings, setSettings] = useState(neumorphicSettings);
  const [animations, setAnimations] = useState<AnimationSettings>(defaultAnimations);
  const [presets, setPresets] = useState<StylePreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetMenuAnchor, setPresetMenuAnchor] = useState<null | HTMLElement>(null);
  const [previewAnimating, setPreviewAnimating] = useState(false);

  const [colorPicker, setColorPicker] = useState({
    open: false,
    type: '',
  });

  const updatePreview = (newSettings: typeof neumorphicSettings) => {
    const insetPrefix = newSettings.useInsetShadow ? 'inset ' : '';
    const newStyle = {
      boxShadow: `${insetPrefix}${newSettings.shadowDistance}px ${newSettings.shadowDistance}px ${newSettings.shadowBlur}px rgba(163,177,198,${newSettings.darkShadowOpacity}), ${insetPrefix}-${newSettings.shadowDistance}px -${newSettings.shadowDistance}px ${newSettings.shadowBlur}px rgba(255,255,255,${newSettings.lightShadowOpacity})`,
      borderRadius: `${newSettings.borderRadius}px`,
      backgroundColor: colors.background,
    };
    setPreviewStyle(newStyle);
    updateNeumorphicSettings(newSettings);
  };

  const handleSliderChange = (setting: keyof typeof settings) => (_event: Event, value: number | number[]) => {
    const newSettings = { ...settings, [setting]: Array.isArray(value) ? value[0] : value };
    setSettings(newSettings);
    updatePreview(newSettings);
  };

  const handleAnimationChange = (setting: keyof AnimationSettings) => (_event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setAnimations(prev => ({ ...prev, [setting]: newValue }));
  };

  const handleSwitchChange = (setting: keyof typeof settings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...settings, [setting]: event.target.checked };
    setSettings(newSettings);
    updatePreview(newSettings);
  };

  const handleColorChange = (color: any, type: 'primaryColor' | 'secondaryColor' | 'background') => {
    updateColors({ [type]: color.hex });
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      const newPreset: StylePreset = {
        name: presetName,
        settings,
        colors,
        animations,
      };
      setPresets(prev => [...prev, newPreset]);
      setSaveDialogOpen(false);
      setPresetName('');
    }
  };

  const handleLoadPreset = (preset: StylePreset) => {
    setSettings(preset.settings);
    updateColors(preset.colors);
    setAnimations(preset.animations);
    updatePreview(preset.settings);
    setPresetMenuAnchor(null);
  };

  const handleDeletePreset = (index: number) => {
    setPresets(prev => prev.filter((_, i) => i !== index));
  };

  const PreviewBox = () => (
    <Box
      sx={{
        width: 200,
        height: 200,
        ...previewStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px auto',
        transform: previewAnimating ? `scale(${animations.hoverScale}) translateY(${animations.hoverTranslateY}px)` : 'none',
        transition: `all ${animations.transitionDuration}ms ${animations.transitionEasing}`,
        '&:active': {
          transform: `scale(${animations.pressedScale})`,
        },
      }}
    >
      <Typography>Preview</Typography>
    </Box>
  );

  return (
    <StyledCard>
      <Typography variant="h5" gutterBottom>
        Neumorphic Style Editor
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Shadow Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Shadow Distance</Typography>
                <Slider
                  value={settings.shadowDistance}
                  onChange={handleSliderChange('shadowDistance')}
                  min={0}
                  max={20}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Shadow Blur</Typography>
                <Slider
                  value={settings.shadowBlur}
                  onChange={handleSliderChange('shadowBlur')}
                  min={0}
                  max={30}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Dark Shadow Opacity</Typography>
                <Slider
                  value={settings.darkShadowOpacity}
                  onChange={handleSliderChange('darkShadowOpacity')}
                  min={0}
                  max={1}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Light Shadow Opacity</Typography>
                <Slider
                  value={settings.lightShadowOpacity}
                  onChange={handleSliderChange('lightShadowOpacity')}
                  min={0}
                  max={1}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.useInsetShadow}
                    onChange={handleSwitchChange('useInsetShadow')}
                  />
                }
                label="Use Inset Shadow"
              />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Shape Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Border Radius</Typography>
                <Slider
                  value={settings.borderRadius}
                  onChange={handleSliderChange('borderRadius')}
                  min={0}
                  max={30}
                  valueLabelDisplay="auto"
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Animation Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Hover Scale</Typography>
                <Slider
                  value={animations.hoverScale}
                  onChange={handleAnimationChange('hoverScale')}
                  min={1}
                  max={1.2}
                  step={0.01}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Hover Translate Y (px)</Typography>
                <Slider
                  value={animations.hoverTranslateY}
                  onChange={handleAnimationChange('hoverTranslateY')}
                  min={-10}
                  max={0}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Pressed Scale</Typography>
                <Slider
                  value={animations.pressedScale}
                  onChange={handleAnimationChange('pressedScale')}
                  min={0.8}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Transition Duration (ms)</Typography>
                <Slider
                  value={animations.transitionDuration}
                  onChange={handleAnimationChange('transitionDuration')}
                  min={100}
                  max={1000}
                  step={50}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={previewAnimating ? <StopIcon /> : <PlayArrowIcon />}
                  onClick={() => setPreviewAnimating(!previewAnimating)}
                >
                  {previewAnimating ? 'Stop Preview' : 'Preview Animation'}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Color Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {(['primaryColor', 'secondaryColor', 'background'] as const).map((colorType) => (
                  <Grid item xs={12} key={colorType}>
                    <Box sx={{ mb: 2 }}>
                      <Typography gutterBottom sx={{ textTransform: 'capitalize' }}>
                        {colorType.replace('Color', '')} Color
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: colors[colorType],
                          height: 40,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: 'divider',
                        }}
                        onClick={() => setColorPicker({ open: true, type: colorType })}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Live Preview</Typography>
              <Box>
                <IconButton onClick={(e) => setPresetMenuAnchor(e.currentTarget)}>
                  <NeumorphicIcon>
                    <SaveIcon />
                  </NeumorphicIcon>
                </IconButton>
                <IconButton onClick={() => setSaveDialogOpen(true)}>
                  <NeumorphicIcon>
                    <AddIcon />
                  </NeumorphicIcon>
                </IconButton>
              </Box>
            </Box>
            <PreviewBox />
            <Typography variant="caption" display="block" textAlign="center">
              Current Shadow: {previewStyle.boxShadow}
            </Typography>
          </Paper>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              setSettings(neumorphicSettings);
              setAnimations(defaultAnimations);
              updatePreview(neumorphicSettings);
            }}
          >
            Reset to Defaults
          </Button>
        </Grid>
      </Grid>

      {colorPicker.open && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1300,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <ChromePicker
            color={colors[colorPicker.type as keyof typeof colors]}
            onChange={(color) => handleColorChange(color, colorPicker.type as 'primaryColor' | 'secondaryColor' | 'background')}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={() => setColorPicker({ open: false, type: '' })}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={presetMenuAnchor}
        open={Boolean(presetMenuAnchor)}
        onClose={() => setPresetMenuAnchor(null)}
      >
        {presets.map((preset, index) => (
          <MenuItem key={preset.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography onClick={() => handleLoadPreset(preset)}>{preset.name}</Typography>
              <IconButton size="small" onClick={() => handleDeletePreset(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePreset} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
};

export default NeumorphicStyleEditor; 