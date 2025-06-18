import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, Document, VoiceNote} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        await AsyncStorage.setItem('auth_token', token);

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
        // You might want to trigger a navigation to the login screen here
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
  },
};

// User endpoints
export const user = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  updatePreferences: async (preferences: User['preferences']) => {
    const response = await api.put('/users/preferences', {preferences});
    return response.data;
  },
};

// Documents endpoints
export const documents = {
  list: async (): Promise<Document[]> => {
    const response = await api.get('/documents');
    return response.data;
  },

  upload: async (file: any): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/documents/${id}`);
  },
};

// Voice notes endpoints
export const voiceNotes = {
  list: async (): Promise<VoiceNote[]> => {
    const response = await api.get('/voice-notes');
    return response.data;
  },

  upload: async (file: any): Promise<VoiceNote> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/voice-notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/voice-notes/${id}`);
  },
};

// Voice Library API
export const voiceLibraryApi = {
  getLibraries: async () => {
    const response = await api.get('/voice/libraries');
    return response.data;
  },

  createLibrary: async (name: string, description: string) => {
    const response = await api.post('/voice/libraries', { name, description });
    return response.data;
  },

  deleteLibrary: async (libraryId: string) => {
    await api.delete(`/voice/libraries/${libraryId}`);
  },

  updateLibrary: async (libraryId: string, data: { name?: string; description?: string }) => {
    const response = await api.put(`/voice/libraries/${libraryId}`, data);
    return response.data;
  },
};

// Voice Recording API
export const voiceRecordingApi = {
  uploadRecording: async (libraryId: string, audioBlob: Blob, metadata: any) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await api.post(`/voice/libraries/${libraryId}/recordings`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getRecordings: async (libraryId: string) => {
    const response = await api.get(`/voice/libraries/${libraryId}/recordings`);
    return response.data;
  },

  deleteRecording: async (libraryId: string, recordingId: string) => {
    await api.delete(`/voice/libraries/${libraryId}/recordings/${recordingId}`);
  },
};

// User Profile API
export const userProfileApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  updateApiToken: async () => {
    const response = await api.post('/users/api-token');
    return response.data;
  },
};

export default {
  auth: authApi,
  user,
  documents,
  voiceNotes,
  voiceLibrary: voiceLibraryApi,
  voiceRecording: voiceRecordingApi,
  userProfile: userProfileApi,
}; 