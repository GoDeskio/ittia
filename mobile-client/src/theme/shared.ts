import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

export const colors = {
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
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
};

export const darkColors = {
  ...colors,
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  disabled: '#9E9E9E',
  placeholder: '#757575',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  spacing,
  typography,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  spacing,
  typography,
};

export const getTheme = (isDark: boolean) => (isDark ? darkTheme : lightTheme); 