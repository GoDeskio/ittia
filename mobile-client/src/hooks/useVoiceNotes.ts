import {useState, useCallback} from 'react';
import {voiceNotes} from '../services/api';
import {VoiceNote} from '../types';
import {useVoiceRecorder} from './useVoiceRecorder';

interface VoiceNotesState {
  items: VoiceNote[];
  isLoading: boolean;
  error: string | null;
}

export const useVoiceNotes = () => {
  const [state, setState] = useState<VoiceNotesState>({
    items: [],
    isLoading: false,
    error: null,
  });

  const {
    isRecording,
    duration,
    hasPermission,
    startRecording,
    stopRecording,
    playRecording,
  } = useVoiceRecorder();

  const loadVoiceNotes = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      const items = await voiceNotes.list();
      setState(prev => ({...prev, items, isLoading: false}));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load voice notes',
      }));
    }
  }, []);

  const recordVoiceNote = useCallback(async () => {
    try {
      if (!hasPermission) {
        setState(prev => ({
          ...prev,
          error: 'Microphone permission is required',
        }));
        return;
      }

      await startRecording();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start recording',
      }));
    }
  }, [hasPermission, startRecording]);

  const saveVoiceNote = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      const voiceNote = await stopRecording();
      if (voiceNote) {
        const uploadedNote = await voiceNotes.upload(voiceNote);
        setState(prev => ({
          ...prev,
          items: [uploadedNote, ...prev.items],
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to save voice note',
      }));
    }
  }, [stopRecording]);

  const deleteVoiceNote = useCallback(async (id: string) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      await voiceNotes.delete(id);
      setState(prev => ({
        ...prev,
        items: prev.items.filter(note => note.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to delete voice note',
      }));
    }
  }, []);

  const playVoiceNote = useCallback(
    async (uri: string) => {
      try {
        await playRecording(uri);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to play voice note',
        }));
      }
    },
    [playRecording],
  );

  return {
    ...state,
    isRecording,
    duration,
    hasPermission,
    loadVoiceNotes,
    recordVoiceNote,
    saveVoiceNote,
    deleteVoiceNote,
    playVoiceNote,
  };
}; 