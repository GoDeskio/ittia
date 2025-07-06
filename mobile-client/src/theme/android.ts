import {Platform} from 'react-native';
import {lightTheme, darkTheme, typography} from './shared';

export const androidTheme = {
  light: {
    ...lightTheme,
    typography: {
      ...typography,
      fontFamily: {
        regular: Platform.select({android: 'Roboto', default: 'System'}),
        medium: Platform.select({android: 'Roboto-Medium', default: 'System'}),
        light: Platform.select({android: 'Roboto-Light', default: 'System'}),
        thin: Platform.select({android: 'Roboto-Thin', default: 'System'}),
      },
    },
  },
  dark: {
    ...darkTheme,
    typography: {
      ...typography,
      fontFamily: {
        regular: Platform.select({android: 'Roboto', default: 'System'}),
        medium: Platform.select({android: 'Roboto-Medium', default: 'System'}),
        light: Platform.select({android: 'Roboto-Light', default: 'System'}),
        thin: Platform.select({android: 'Roboto-Thin', default: 'System'}),
      },
    },
  },
}; 