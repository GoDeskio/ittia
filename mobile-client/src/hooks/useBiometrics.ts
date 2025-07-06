import {useState, useCallback} from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import {usePreferences} from './usePreferences';

interface BiometricsState {
  isAvailable: boolean;
  type: string | null;
  error: string | null;
}

const rnBiometrics = new ReactNativeBiometrics();

export const useBiometrics = () => {
  const [state, setState] = useState<BiometricsState>({
    isAvailable: false,
    type: null,
    error: null,
  });

  const {preferences} = usePreferences();

  const checkBiometrics = useCallback(async () => {
    try {
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      setState(prev => ({
        ...prev,
        isAvailable: available,
        type: biometryType,
        error: null,
      }));
      return available;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to check biometrics availability',
      }));
      return false;
    }
  }, []);

  const authenticate = useCallback(async (promptMessage: string) => {
    if (!preferences.biometricsEnabled) {
      return false;
    }

    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Biometric authentication failed',
      }));
      return false;
    }
  }, [preferences.biometricsEnabled]);

  const createKeys = useCallback(async () => {
    try {
      const {publicKey} = await rnBiometrics.createKeys();
      return publicKey;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create biometric keys',
      }));
      return null;
    }
  }, []);

  const deleteKeys = useCallback(async () => {
    try {
      await rnBiometrics.deleteKeys();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete biometric keys',
      }));
      return false;
    }
  }, []);

  const signMessage = useCallback(async (message: string) => {
    try {
      const {success, signature} = await rnBiometrics.createSignature({
        promptMessage: 'Sign in to VoiceVault',
        payload: message,
      });
      return success ? signature : null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to sign message',
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    checkBiometrics,
    authenticate,
    createKeys,
    deleteKeys,
    signMessage,
  };
}; 