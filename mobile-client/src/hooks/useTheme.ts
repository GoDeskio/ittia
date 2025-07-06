import {useState, useCallback, useEffect} from 'react';
import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';
import {usePreferences} from './usePreferences';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03DAC6',
    error: '#B00020',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF4081',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    secondary: '#03DAC6',
    error: '#CF6679',
    background: '#121212',
    surface: '#121212',
    text: '#FFFFFF',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF4081',
  },
};

export const useTheme = () => {
  const {preferences, toggleDarkMode} = usePreferences();
  const [theme, setTheme] = useState(preferences.darkMode ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(preferences.darkMode ? darkTheme : lightTheme);
  }, [preferences.darkMode]);

  const toggleTheme = useCallback(async () => {
    await toggleDarkMode();
  }, [toggleDarkMode]);

  return {
    theme,
    isDarkMode: preferences.darkMode,
    toggleTheme,
  };
}; 