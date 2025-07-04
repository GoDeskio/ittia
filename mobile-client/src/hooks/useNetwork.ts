import {useState, useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string;
    carrier?: string;
  } | null;
}

export const useNetwork = () => {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
    details: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(networkState => {
      setState({
        isConnected: networkState.isConnected ?? false,
        type: networkState.type,
        isInternetReachable: networkState.isInternetReachable,
        details: networkState.details,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnectivity = async () => {
    try {
      const networkState = await NetInfo.fetch();
      setState({
        isConnected: networkState.isConnected ?? false,
        type: networkState.type,
        isInternetReachable: networkState.isInternetReachable,
        details: networkState.details,
      });
      return networkState.isConnected;
    } catch (error) {
      console.error('Failed to check network connectivity:', error);
      return false;
    }
  };

  return {
    ...state,
    checkConnectivity,
  };
}; 