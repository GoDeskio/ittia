import {useState, useEffect, useCallback} from 'react';
import {Platform} from 'react-native';
import Sound from 'react-native-sound';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {generateUniqueId} from '../utils/helpers';
import {VoiceNote} from '../types';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  hasPermission: boolean;
  error: string | null;
}

export const useVoiceRecorder = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    hasPermission: false,
    error: null,
  });

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
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
        error: 'Failed to check microphone permission',
      }));
    }
  };

  const startRecording = useCallback(async () => {
    if (!state.hasPermission) {
      await checkPermission();
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
      }));

      // TODO: Implement actual recording logic using react-native-audio-recorder-player
      // This is a placeholder for the actual implementation
      const recordingId = generateUniqueId();
      console.log('Started recording:', recordingId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: 'Failed to start recording',
      }));
    }
  }, [state.hasPermission]);

  const stopRecording = useCallback(async () => {
    try {
      setState(prev => ({...prev, isRecording: false}));

      // TODO: Implement actual stop recording logic
      // This is a placeholder for the actual implementation
      const voiceNote: VoiceNote = {
        id: generateUniqueId(),
        name: `Recording ${new Date().toLocaleString()}`,
        duration: state.duration,
        uri: '', // TODO: Get actual file URI
        date: new Date(),
      };

      return voiceNote;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to stop recording',
      }));
      return null;
    }
  }, [state.duration]);

  const playRecording = useCallback(async (uri: string) => {
    try {
      const sound = new Sound(uri, '', error => {
        if (error) {
          console.error('Failed to load sound:', error);
          return;
        }
        sound.play(success => {
          if (!success) {
            console.error('Playback failed');
          }
          sound.release();
        });
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to play recording',
      }));
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    playRecording,
  };
}; 