import {useState, useEffect, useCallback} from 'react';
import {Platform} from 'react-native';
import Sound from 'react-native-sound';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ElevenLabsService, { AudioMetadata, Voice } from '../services/ElevenLabsService';
import {generateUniqueId} from '../utils/helpers';
import {VoiceNote} from '../types';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  hasPermission: boolean;
  error: string | null;
  isProcessing: boolean;
  recordingUri: string | null;
  metadata: AudioMetadata | null;
  availableVoices: Voice[];
  currentLocation: { latitude: number; longitude: number } | null;
}

export const useVoiceRecorder = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    hasPermission: false,
    error: null,
    isProcessing: false,
    recordingUri: null,
    metadata: null,
    availableVoices: [],
    currentLocation: null,
  });

  const audioRecorderPlayer = new AudioRecorderPlayer();

  useEffect(() => {
    checkPermission();
    loadVoices();
    getCurrentLocation();
  }, []);

  const loadVoices = async () => {
    try {
      const voices = await ElevenLabsService.getVoices();
      setState(prev => ({ ...prev, availableVoices: voices }));
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await ElevenLabsService.getCurrentLocation();
      setState(prev => ({ ...prev, currentLocation: location }));
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

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
        recordingUri: null,
        metadata: null,
      }));

      const path = `${audioRecorderPlayer.mmssss(Date.now())}.wav`;
      const result = await audioRecorderPlayer.startRecorder(path);
      
      setState(prev => ({ ...prev, recordingUri: result }));
      
      // Start timer
      const timer = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      // Store timer reference for cleanup
      (audioRecorderPlayer as any).timer = timer;
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
      const result = await audioRecorderPlayer.stopRecorder();
      
      // Clear timer
      if ((audioRecorderPlayer as any).timer) {
        clearInterval((audioRecorderPlayer as any).timer);
      }
      
      setState(prev => ({ ...prev, isRecording: false }));

      if (result) {
        // Process recording with metadata
        await processRecording(result);
        
        const voiceNote: VoiceNote = {
          id: generateUniqueId(),
          name: `Recording ${new Date().toLocaleString()}`,
          duration: state.duration,
          uri: result,
          date: new Date(),
        };

        return voiceNote;
      }
      
      return null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to stop recording',
      }));
      return null;
    }
  }, [state.duration]);

  const processRecording = async (uri: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const result = await ElevenLabsService.processAudioWithMetadata(
        uri,
        state.currentLocation
      );
      
      setState(prev => ({ 
        ...prev, 
        metadata: result.metadata,
        isProcessing: false 
      }));
    } catch (error) {
      console.error('Error processing recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to process recording',
        isProcessing: false 
      }));
    }
  };

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

  const convertSpeechToSpeech = useCallback(async (voiceId: string) => {
    if (!state.recordingUri) {
      setState(prev => ({ ...prev, error: 'No recording available' }));
      return null;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const convertedUri = await ElevenLabsService.speechToSpeech(
        state.recordingUri,
        voiceId
      );
      
      setState(prev => ({ ...prev, isProcessing: false }));
      return convertedUri;
    } catch (error) {
      console.error('Error converting speech:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to convert speech',
        isProcessing: false 
      }));
      return null;
    }
  }, [state.recordingUri]);

  const cloneVoice = useCallback(async (name: string, description: string, audioUris: string[]) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const clonedVoice = await ElevenLabsService.cloneVoice(name, description, audioUris);
      
      // Refresh voice list
      await loadVoices();
      
      setState(prev => ({ ...prev, isProcessing: false }));
      return clonedVoice;
    } catch (error) {
      console.error('Error cloning voice:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to clone voice',
        isProcessing: false 
      }));
      return null;
    }
  }, []);

  const analyzeEmotion = useCallback(async (audioUri?: string) => {
    const uri = audioUri || state.recordingUri;
    if (!uri) {
      setState(prev => ({ ...prev, error: 'No audio available for analysis' }));
      return null;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const emotionData = await ElevenLabsService.analyzeEmotion(uri);
      setState(prev => ({ ...prev, isProcessing: false }));
      return emotionData;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to analyze emotion',
        isProcessing: false 
      }));
      return null;
    }
  }, [state.recordingUri]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      recordingUri: null,
      metadata: null,
      duration: 0,
      error: null,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    playRecording,
    convertSpeechToSpeech,
    cloneVoice,
    analyzeEmotion,
    clearError,
    resetRecording,
    loadVoices,
    getCurrentLocation,
  };
}; 