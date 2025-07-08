import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';
import { NeumorphicDesignSystem } from '../../../shared/design-system';

const { colors: designColors } = NeumorphicDesignSystem;

export const colors = {
  primary: designColors.accent.primary,
  secondary: designColors.accent.secondary,
  error: designColors.accent.error,
  background: designColors.background.primary,
  surface: designColors.background.secondary,
  text: designColors.text.primary,
  disabled: designColors.text.tertiary,
  placeholder: designColors.text.secondary,
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: designColors.accent.error,
  success: designColors.accent.success,
  warning: designColors.accent.warning,
  info: designColors.accent.info,
  // Neumorphic specific colors
  neumorphic: {
    background: designColors.background.primary,
    backgroundSecondary: designColors.background.secondary,
    backgroundTertiary: designColors.background.tertiary,
    shadowDark: designColors.shadow.dark,
    shadowLight: designColors.shadow.light,
  },
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

// Neumorphic styles for React Native
export const neumorphicStyles = {
  // Card styles
  card: {
    backgroundColor: colors.neumorphic.background,
    borderRadius: 20,
    padding: 24,
    // React Native doesn't support multiple box-shadows, so we'll use elevation
    elevation: 8,
    shadowColor: colors.neumorphic.shadowDark,
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.neumorphic.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 6,
    shadowColor: colors.neumorphic.shadowDark,
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.neumorphic.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    // For inset effect, we'll use a darker background
    backgroundColor: colors.neumorphic.backgroundTertiary,
    borderWidth: 0,
  },
  
  // Sidebar styles
  sidebar: {
    backgroundColor: colors.neumorphic.background,
    elevation: 12,
    shadowColor: colors.neumorphic.shadowDark,
    shadowOffset: {
      width: 12,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 24,
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