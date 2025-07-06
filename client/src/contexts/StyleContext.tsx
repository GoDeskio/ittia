import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StyleSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: number;
  shadowIntensity: number;
  fontFamily: string;
  fontSize: number;
}

interface StyleContextType {
  styleSettings: StyleSettings;
  updateStyleSettings: (settings: Partial<StyleSettings>) => void;
  resetToDefaults: () => void;
}

const defaultStyleSettings: StyleSettings = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  backgroundColor: '#f5f5f5',
  surfaceColor: '#ffffff',
  textColor: '#333333',
  borderRadius: 8,
  shadowIntensity: 0.3,
  fontFamily: 'Roboto, Arial, sans-serif',
  fontSize: 14,
};

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const useStyle = (): StyleContextType => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};

interface StyleProviderProps {
  children: ReactNode;
}

export const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  const [styleSettings, setStyleSettings] = useState<StyleSettings>(defaultStyleSettings);

  const updateStyleSettings = (settings: Partial<StyleSettings>) => {
    setStyleSettings(prev => ({ ...prev, ...settings }));
  };

  const resetToDefaults = () => {
    setStyleSettings(defaultStyleSettings);
  };

  const value: StyleContextType = {
    styleSettings,
    updateStyleSettings,
    resetToDefaults,
  };

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  );
};

export default StyleContext;