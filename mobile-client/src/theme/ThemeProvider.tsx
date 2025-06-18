import React from 'react';
import {Platform} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {usePreferences} from '../hooks/usePreferences';
import {iosTheme} from './ios';
import {androidTheme} from './android';

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {preferences} = usePreferences();
  const isDark = preferences.darkMode;
  const platformTheme = Platform.select({
    ios: iosTheme,
    android: androidTheme,
    default: iosTheme,
  });

  const theme = isDark ? platformTheme.dark : platformTheme.light;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}; 