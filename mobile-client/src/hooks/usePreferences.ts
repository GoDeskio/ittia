import {useState, useCallback, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {user} from '../services/api';
import {User} from '../types';

interface PreferencesState {
  preferences: User['preferences'];
  isLoading: boolean;
  error: string | null;
}

const PREFERENCES_KEY = '@voicevault/preferences';

const defaultPreferences: User['preferences'] = {
  biometricsEnabled: false,
  darkMode: false,
  notificationsEnabled: true,
};

export const usePreferences = () => {
  const [state, setState] = useState<PreferencesState>({
    preferences: defaultPreferences,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      // Try to load from API first
      try {
        const userData = await user.getProfile();
        setState(prev => ({
          ...prev,
          preferences: userData.preferences,
          isLoading: false,
        }));
        await AsyncStorage.setItem(
          PREFERENCES_KEY,
          JSON.stringify(userData.preferences),
        );
      } catch (error) {
        // If API fails, try to load from local storage
        const storedPreferences = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (storedPreferences) {
          setState(prev => ({
            ...prev,
            preferences: JSON.parse(storedPreferences),
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            preferences: defaultPreferences,
            isLoading: false,
          }));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load preferences',
      }));
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<User['preferences']>) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      const updatedPreferences = {
        ...state.preferences,
        ...preferences,
      };

      // Update in API
      try {
        await user.updatePreferences(updatedPreferences);
      } catch (error) {
        console.warn('Failed to update preferences in API:', error);
      }

      // Update in local storage
      await AsyncStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify(updatedPreferences),
      );

      setState(prev => ({
        ...prev,
        preferences: updatedPreferences,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to update preferences',
      }));
    }
  }, [state.preferences]);

  const toggleBiometrics = useCallback(async () => {
    await updatePreferences({
      biometricsEnabled: !state.preferences.biometricsEnabled,
    });
  }, [state.preferences.biometricsEnabled, updatePreferences]);

  const toggleDarkMode = useCallback(async () => {
    await updatePreferences({
      darkMode: !state.preferences.darkMode,
    });
  }, [state.preferences.darkMode, updatePreferences]);

  const toggleNotifications = useCallback(async () => {
    await updatePreferences({
      notificationsEnabled: !state.preferences.notificationsEnabled,
    });
  }, [state.preferences.notificationsEnabled, updatePreferences]);

  return {
    ...state,
    updatePreferences,
    toggleBiometrics,
    toggleDarkMode,
    toggleNotifications,
  };
}; 