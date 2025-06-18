import {useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Document, VoiceNote} from '../types';

interface StorageState {
  isLoading: boolean;
  error: string | null;
}

export const useStorage = () => {
  const [state, setState] = useState<StorageState>({
    isLoading: false,
    error: null,
  });

  const saveDocument = useCallback(async (document: Document) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      const key = `@voicevault/document/${document.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(document));
      setState(prev => ({...prev, isLoading: false}));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to save document',
      }));
    }
  }, []);

  const getDocument = useCallback(async (id: string) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      const key = `@voicevault/document/${id}`;
      const data = await AsyncStorage.getItem(key);
      setState(prev => ({...prev, isLoading: false}));
      return data ? (JSON.parse(data) as Document) : null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get document',
      }));
      return null;
    }
  }, []);

  const saveVoiceNote = useCallback(async (voiceNote: VoiceNote) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      const key = `@voicevault/voicenote/${voiceNote.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(voiceNote));
      setState(prev => ({...prev, isLoading: false}));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to save voice note',
      }));
    }
  }, []);

  const getVoiceNote = useCallback(async (id: string) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      const key = `@voicevault/voicenote/${id}`;
      const data = await AsyncStorage.getItem(key);
      setState(prev => ({...prev, isLoading: false}));
      return data ? (JSON.parse(data) as VoiceNote) : null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get voice note',
      }));
      return null;
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      await AsyncStorage.removeItem(key);
      setState(prev => ({...prev, isLoading: false}));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to remove item',
      }));
    }
  }, []);

  const clearStorage = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      await AsyncStorage.clear();
      setState(prev => ({...prev, isLoading: false}));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to clear storage',
      }));
    }
  }, []);

  return {
    ...state,
    saveDocument,
    getDocument,
    saveVoiceNote,
    getVoiceNote,
    removeItem,
    clearStorage,
  };
}; 