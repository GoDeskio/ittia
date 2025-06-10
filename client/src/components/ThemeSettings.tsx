import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  useMediaQuery,
  useTheme as useMuiTheme,
  Divider,
} from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSettings: React.FC = () => {
  const { colors, updateColors } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [activeColor, setActiveColor] = useState<keyof typeof colors | null>(null);

  const handleColorChange = (color: ColorResult, key: keyof typeof colors) => {
    updateColors({ [key]: color.hex });
  };

  const colorOptions = [
    { key: 'primary', label: 'Primary Color' },
    { key: 'secondary', label: 'Secondary Color' },
    { key: 'background', label: 'Background Color' },
    { key: 'paper', label: 'Surface Color' },
    { key: 'text', label: 'Text Color' },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Theme Customization</Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {colorOptions.map(({ key, label }) => (
          <Grid item xs={12} sm={6} key={key}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {label}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 40,
                  borderRadius: 1,
                  bgcolor: colors[key as keyof typeof colors],
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'divider',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => setActiveColor(key as keyof typeof colors)}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {activeColor && (
        <Box
          sx={{
            position: isMobile ? 'relative' : 'absolute',
            zIndex: 1,
            mt: isMobile ? 2 : 0,
          }}
        >
          <Paper elevation={4} sx={{ p: 2 }}>
            <ChromePicker
              color={colors[activeColor]}
              onChange={(color) => handleColorChange(color, activeColor)}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => setActiveColor(null)}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default ThemeSettings; 