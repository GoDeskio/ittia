export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000',
  API_VERSION: 'v1',
};

export const AUTH_CONFIG = {
  TOKEN_KEY: 'voicevault_token',
  REFRESH_TOKEN_KEY: 'voicevault_refresh_token',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
};

export const VOICE_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  LANGUAGE: 'en-US',
};

export const SYNC_CONFIG = {
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const STORAGE_KEYS = {
  USER_SETTINGS: 'voicevault_user_settings',
  VOICE_PROFILES: 'voicevault_voice_profiles',
  RECENT_ACTIVITIES: 'voicevault_recent_activities',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTH_ERROR: 'Authentication error. Please log in again.',
  VOICE_ERROR: 'Voice recognition error. Please try again.',
  SYNC_ERROR: 'Synchronization error. Please check your connection.',
};

export const SUCCESS_MESSAGES = {
  SYNC_SUCCESS: 'Successfully synchronized with server.',
  VOICE_SAVED: 'Voice profile saved successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
}; 