import React, { createContext, useContext, useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

interface ThemeContextType {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  updateColors: (newColors: Partial<ThemeContextType['colors']>) => void;
}

const defaultColors = {
  primary: '#64ffda',
  secondary: '#0a192f',
  background: '#112240',
  text: '#ffffff'
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  updateColors: () => {}
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

  const updateColors = useCallback((newColors: Partial<ThemeContextType['colors']>) => {
    setColors(prev => ({ ...prev, ...newColors }));
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
        paper: colors.secondary,
      },
      text: {
        primary: colors.text,
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ colors, updateColors }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 