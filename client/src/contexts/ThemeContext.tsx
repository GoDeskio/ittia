import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface NeumorphicSettings {
  shadowDistance: number;
  shadowBlur: number;
  shadowIntensity: number;
  borderRadius: number;
  lightShadowOpacity: number;
  darkShadowOpacity: number;
  useInsetShadow: boolean;
}

interface AnimationSettings {
  hoverScale: number;
  hoverTranslateY: number;
  pressedScale: number;
  transitionDuration: number;
  transitionEasing: string;
}

interface StylePreferences {
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  tableColor: string;
  commentBoxColor: string;
  background: string;
  text: string;
}

interface BannerImage {
  url: string;
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
    scale: number;
  };
}

interface ThemeContextType {
  colors: StylePreferences;
  updateColors: (newColors: Partial<StylePreferences>) => void;
  updateNeumorphicSettings: (settings: NeumorphicSettings) => void;
  updateAnimationSettings: (settings: AnimationSettings) => void;
  neumorphicSettings: NeumorphicSettings;
  animationSettings: AnimationSettings;
  bannerImage?: BannerImage;
  updateBanner: (banner: Partial<BannerImage> & { file?: File }) => Promise<void>;
  isCurrentUser: (userId: string) => boolean;
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const defaultColors: StylePreferences = {
  primaryColor: '#64ffda',
  secondaryColor: '#0a192f',
  buttonColor: '#64ffda',
  tableColor: '#ffffff',
  commentBoxColor: '#f5f5f5',
  background: '#e0e5ec',
  text: '#4a4a4a'
};

const defaultNeumorphicSettings: NeumorphicSettings = {
  shadowDistance: 9,
  shadowBlur: 16,
  shadowIntensity: 0.6,
  borderRadius: 15,
  lightShadowOpacity: 0.5,
  darkShadowOpacity: 0.6,
  useInsetShadow: false,
};

const defaultAnimationSettings: AnimationSettings = {
  hoverScale: 1.02,
  hoverTranslateY: -2,
  pressedScale: 0.98,
  transitionDuration: 300,
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  updateColors: () => {},
  updateNeumorphicSettings: () => {},
  updateAnimationSettings: () => {},
  neumorphicSettings: defaultNeumorphicSettings,
  animationSettings: defaultAnimationSettings,
  updateBanner: async () => {},
  isCurrentUser: () => false,
  currentTheme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [colors, setColors] = useState(defaultColors);
  const [neumorphicSettings, setNeumorphicSettings] = useState(defaultNeumorphicSettings);
  const [animationSettings, setAnimationSettings] = useState(defaultAnimationSettings);
  const [bannerImage, setBannerImage] = useState<BannerImage>();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (user) {
      // Load user's style preferences
      axios.get(`/api/users/${user.id}/style-preferences`)
        .then(response => {
          setColors(prev => ({ ...prev, ...response.data.stylePreferences }));
          setBannerImage(response.data.bannerImage);
        })
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const updateColors = useCallback(async (newColors: Partial<StylePreferences>) => {
    if (!user) {
      throw new Error('You must be logged in to update style preferences');
    }

    try {
      await axios.put(`/api/users/${user.id}/style-preferences`, { stylePreferences: newColors });
      setColors(prev => ({ ...prev, ...newColors }));
    } catch (error) {
      console.error('Failed to update style preferences:', error);
      throw error;
    }
  }, [user]);

  const updateNeumorphicSettings = useCallback((newSettings: NeumorphicSettings) => {
    setNeumorphicSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateAnimationSettings = useCallback((newSettings: AnimationSettings) => {
    setAnimationSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateBanner = async (newBanner: Partial<BannerImage> & { file?: File }) => {
    if (!user) {
      throw new Error('You must be logged in to update banner image');
    }

    try {
      let bannerData = { ...newBanner };
      
      // If the banner includes a File object, upload it first
      if (newBanner.file) {
        const formData = new FormData();
        formData.append('banner', newBanner.file);
        const response = await axios.post(`/api/users/${user.id}/upload-banner`, formData);
        bannerData.url = response.data.url;
      }

      await axios.put(`/api/users/${user.id}/banner`, { bannerImage: bannerData });
      setBannerImage(prev => ({ ...prev, ...bannerData } as BannerImage));
    } catch (error) {
      console.error('Failed to update banner:', error);
      throw error;
    }
  };

  const isCurrentUser = (userId: string): boolean => {
    return user?.id === userId;
  };

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: colors.primaryColor,
      },
      secondary: {
        main: colors.secondaryColor,
      },
      background: {
        default: colors.background,
        paper: colors.background,
      },
      text: {
        primary: colors.text,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
            '&:hover': {
              transform: `scale(${animationSettings.hoverScale}) translateY(${animationSettings.hoverTranslateY}px)`,
            },
            '&:active': {
              transform: `scale(${animationSettings.pressedScale})`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        colors,
        updateColors,
        neumorphicSettings,
        updateNeumorphicSettings,
        animationSettings,
        updateAnimationSettings,
        bannerImage,
        updateBanner,
        isCurrentUser,
        currentTheme,
        toggleTheme,
      }}
    >
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 