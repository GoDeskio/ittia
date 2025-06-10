import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  paper: string;
  text: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  theme: Theme;
  updateColors: (newColors: Partial<ThemeColors>) => void;
}

const defaultColors: ThemeColors = {
  primary: '#1976d2',
  secondary: '#dc004e',
  background: '#f5f5f5',
  paper: '#ffffff',
  text: '#000000',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  theme: createTheme(),
  updateColors: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(() => {
    const savedColors = localStorage.getItem('themeColors');
    return savedColors ? JSON.parse(savedColors) : defaultColors;
  });

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: colors.primary,
          },
          secondary: {
            main: colors.secondary,
          },
          background: {
            default: colors.background,
            paper: colors.paper,
          },
          text: {
            primary: colors.text,
          },
        },
      }),
    [colors]
  );

  const updateColors = (newColors: Partial<ThemeColors>) => {
    const updatedColors = { ...colors, ...newColors };
    setColors(updatedColors);
    localStorage.setItem('themeColors', JSON.stringify(updatedColors));
  };

  return (
    <ThemeContext.Provider value={{ colors, theme, updateColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 