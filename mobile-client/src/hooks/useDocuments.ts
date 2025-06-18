import {useState, useCallback} from 'react';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import {documents} from '../services/api';
import {Document} from '../types';
import {generateUniqueId} from '../utils/helpers';

interface DocumentsState {
  items: Document[];
  isLoading: boolean;
  error: string | null;
}

export const useDocuments = () => {
  const [state, setState] = useState<DocumentsState>({
    items: [],
    isLoading: false,
    error: null,
  });

  const loadDocuments = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      const items = await documents.list();
      setState(prev => ({...prev, items, isLoading: false}));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load documents',
      }));
    }
  }, []);

  const pickDocument = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const file = result[0];
      const uploadedDoc = await documents.upload(file);

      setState(prev => ({
        ...prev,
        items: [uploadedDoc, ...prev.items],
        isLoading: false,
      }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to pick document',
        }));
      }
    }
  }, []);

  const scanDocument = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        const uploadedDoc = await documents.upload(file);

        setState(prev => ({
          ...prev,
          items: [uploadedDoc, ...prev.items],
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to scan document',
      }));
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      await documents.delete(id);
      setState(prev => ({
        ...prev,
        items: prev.items.filter(doc => doc.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to delete document',
      }));
    }
  }, []);

  return {
    ...state,
    loadDocuments,
    pickDocument,
    scanDocument,
    deleteDocument,
  };
}; 