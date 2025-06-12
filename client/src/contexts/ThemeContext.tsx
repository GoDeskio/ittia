import React, { createContext, useContext, useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

interface NeumorphicSettings {
  shadowDistance: number;
  shadowBlur: number;
  shadowIntensity: number;
  borderRadius: number;
  lightShadowOpacity: number;
  darkShadowOpacity: number;
  useInsetShadow: boolean;
}

interface AnimationSettings {
  hoverScale: number;
  hoverTranslateY: number;
  pressedScale: number;
  transitionDuration: number;
  transitionEasing: string;
}

interface ThemeContextType {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    [key: string]: string; // Add index signature for dynamic color access
  };
  updateColors: (newColors: Partial<ThemeContextType['colors']>) => void;
  updateNeumorphicSettings: (settings: NeumorphicSettings) => void;
  updateAnimationSettings: (settings: AnimationSettings) => void;
  neumorphicSettings: NeumorphicSettings;
  animationSettings: AnimationSettings;
}

const defaultColors = {
  primary: '#64ffda',
  secondary: '#0a192f',
  background: '#e0e5ec',
  text: '#4a4a4a'
};

const defaultNeumorphicSettings: NeumorphicSettings = {
  shadowDistance: 9,
  shadowBlur: 16,
  shadowIntensity: 0.6,
  borderRadius: 15,
  lightShadowOpacity: 0.5,
  darkShadowOpacity: 0.6,
  useInsetShadow: false,
};

const defaultAnimationSettings: AnimationSettings = {
  hoverScale: 1.02,
  hoverTranslateY: -2,
  pressedScale: 0.98,
  transitionDuration: 300,
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  updateColors: () => {},
  updateNeumorphicSettings: () => {},
  updateAnimationSettings: () => {},
  neumorphicSettings: defaultNeumorphicSettings,
  animationSettings: defaultAnimationSettings,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colors, setColors] = useState(defaultColors);
  const [neumorphicSettings, setNeumorphicSettings] = useState(defaultNeumorphicSettings);
  const [animationSettings, setAnimationSettings] = useState(defaultAnimationSettings);

  const updateColors = useCallback((newColors: Partial<ThemeContextType['colors']>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  }, []);

  const updateNeumorphicSettings = useCallback((newSettings: NeumorphicSettings) => {
    setNeumorphicSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateAnimationSettings = useCallback((newSettings: AnimationSettings) => {
    setAnimationSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.background,
      },
      text: {
        primary: colors.text,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
            '&:hover': {
              transform: `scale(${animationSettings.hoverScale}) translateY(${animationSettings.hoverTranslateY}px)`,
            },
            '&:active': {
              transform: `scale(${animationSettings.pressedScale})`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        colors,
        updateColors,
        neumorphicSettings,
        updateNeumorphicSettings,
        animationSettings,
        updateAnimationSettings,
      }}
    >
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 