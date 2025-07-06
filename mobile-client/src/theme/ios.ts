import {Platform} from 'react-native';
import {lightTheme, darkTheme, typography} from './shared';

export const iosTheme = {
  light: {
    ...lightTheme,
    typography: {
      ...typography,
      fontFamily: {
        regular: Platform.select({ios: 'SF Pro Text', default: 'System'}),
        medium: Platform.select({ios: 'SF Pro Text', default: 'System'}),
        light: Platform.select({ios: 'SF Pro Text', default: 'System'}),
        thin: Platform.select({ios: 'SF Pro Text', default: 'System'}),
      },
    },
  },
  dark: {
    ...darkTheme,
    typography: {
      ...typography,
      fontFamily: {
        regular: Platform.select({ios: 'SF Pro Text', default: 'System'}),
        medium: Platform.select({ios: 'SF Pro Text', default: 'System'}),
        light: Platform.select({ios: 'SF Pro Text', default: 'System'}),
        thin: Platform.select({ios: 'SF Pro Text', default: 'System'}),
      },
    },
  },
}; 