import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface StyleContextType {
  stylePreferences: {
    primaryColor: string;
    secondaryColor: string;
    buttonColor: string;
    tableColor: string;
    commentBoxColor: string;
  };
  bannerImage?: {
    url: string;
    width: number;
    height: number;
    position: {
      x: number;
      y: number;
      scale: number;
    };
  };
  updateStyle: (style: any) => Promise<void>;
  updateBanner: (banner: any) => Promise<void>;
  isCurrentUser: (userId: string) => boolean;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stylePreferences, setStylePreferences] = useState({
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    buttonColor: '#1976d2',
    tableColor: '#ffffff',
    commentBoxColor: '#f5f5f5',
  });
  const [bannerImage, setBannerImage] = useState<StyleContextType['bannerImage']>();

  useEffect(() => {
    if (user) {
      // Load user's style preferences
      axios.get(`/api/users/${user._id}/style-preferences`)
        .then(response => {
          setStylePreferences(response.data.stylePreferences);
          setBannerImage(response.data.bannerImage);
        })
        .catch(console.error);
    }
  }, [user]);

  const isCurrentUser = (userId: string): boolean => {
    return user?._id === userId;
  };

  const updateStyle = async (newStyle: any) => {
    if (!user) {
      throw new Error('You must be logged in to update style preferences');
    }

    try {
      await axios.put(`/api/users/${user._id}/style-preferences`, { stylePreferences: newStyle });
      setStylePreferences(newStyle);
    } catch (error) {
      console.error('Failed to update style preferences:', error);
      throw error;
    }
  };

  const updateBanner = async (newBanner: any) => {
    if (!user) {
      throw new Error('You must be logged in to update banner image');
    }

    try {
      // If the banner includes a File object, upload it first
      if (newBanner.file) {
        const formData = new FormData();
        formData.append('banner', newBanner.file);
        const response = await axios.post(`/api/users/${user._id}/upload-banner`, formData);
        newBanner.url = response.data.url;
      }

      await axios.put(`/api/users/${user._id}/banner`, { bannerImage: newBanner });
      setBannerImage(newBanner);
    } catch (error) {
      console.error('Failed to update banner:', error);
      throw error;
    }
  };

  return (
    <StyleContext.Provider
      value={{
        stylePreferences,
        bannerImage,
        updateStyle,
        updateBanner,
        isCurrentUser,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}; 