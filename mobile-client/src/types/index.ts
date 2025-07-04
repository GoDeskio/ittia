export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  date: Date;
}

export interface VoiceNote {
  id: string;
  name: string;
  duration: number;
  uri: string;
  date: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    biometricsEnabled: boolean;
    darkMode: boolean;
    notificationsEnabled: boolean;
  };
}

export interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params?: any;
  };
} 