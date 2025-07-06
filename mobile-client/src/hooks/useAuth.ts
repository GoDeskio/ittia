import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth} from '../services/api';
import {validateEmail, validatePassword} from '../utils/helpers';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setState(prev => ({
        ...prev,
        isAuthenticated: !!token,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check authentication status',
      }));
    }
  };

  const login = async ({email, password}: LoginCredentials) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!validatePassword(password)) {
        throw new Error(
          'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
        );
      }

      await auth.login(email, password);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const register = async ({email, password, name}: RegisterCredentials) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!validatePassword(password)) {
        throw new Error(
          'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
        );
      }

      if (!name.trim()) {
        throw new Error('Name is required');
      }

      await auth.register(email, password, name);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));
      await auth.logout();
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
}; 