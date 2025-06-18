import {useState, useEffect, useCallback} from 'react';
import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {usePreferences} from './usePreferences';

interface NotificationState {
  hasPermission: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    hasPermission: false,
    error: null,
  });

  const {preferences} = usePreferences();

  useEffect(() => {
    checkPermission();
    configureNotifications();
  }, []);

  const checkPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.NOTIFICATIONS,
        android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      });

      if (permission) {
        const result = await check(permission);
        if (result === RESULTS.GRANTED) {
          setState(prev => ({...prev, hasPermission: true}));
        } else {
          const requestResult = await request(permission);
          setState(prev => ({
            ...prev,
            hasPermission: requestResult === RESULTS.GRANTED,
          }));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to check notification permission',
      }));
    }
  };

  const configureNotifications = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'voicevault-channel',
        channelName: 'VoiceVault Notifications',
        channelDescription: 'VoiceVault app notifications',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      created => console.log(`Channel created: ${created}`),
    );
  };

  const scheduleNotification = useCallback(
    (title: string, message: string, date: Date) => {
      if (!preferences.notificationsEnabled) return;

      PushNotification.localNotificationSchedule({
        channelId: 'voicevault-channel',
        title,
        message,
        date,
        allowWhileIdle: true,
      });
    },
    [preferences.notificationsEnabled],
  );

  const showNotification = useCallback(
    (title: string, message: string) => {
      if (!preferences.notificationsEnabled) return;

      PushNotification.localNotification({
        channelId: 'voicevault-channel',
        title,
        message,
      });
    },
    [preferences.notificationsEnabled],
  );

  const cancelAllNotifications = useCallback(() => {
    PushNotification.cancelAllLocalNotifications();
  }, []);

  return {
    ...state,
    scheduleNotification,
    showNotification,
    cancelAllNotifications,
  };
}; 