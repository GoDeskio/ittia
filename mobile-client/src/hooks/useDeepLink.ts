import {useState, useEffect} from 'react';
import {Linking} from 'react-native';

interface DeepLinkState {
  url: string | null;
  params: Record<string, string>;
}

export const useDeepLink = () => {
  const [state, setState] = useState<DeepLinkState>({
    url: null,
    params: {},
  });

  useEffect(() => {
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    const handleDeepLink = (url: string) => {
      try {
        const urlObj = new URL(url);
        const params: Record<string, string> = {};
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        setState({
          url,
          params,
        });
      } catch (error) {
        console.error('Error parsing deep link URL:', error);
      }
    };

    const subscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url);
    });

    getInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('URL not supported:', url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return {
    ...state,
    openURL,
  };
}; 