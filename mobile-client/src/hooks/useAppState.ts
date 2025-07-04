import {useState, useEffect} from 'react';
import {AppState, AppStateStatus} from 'react-native';

type AppStateType = 'active' | 'background' | 'inactive';

interface AppStateHook {
  appState: AppStateType;
  isActive: boolean;
  isBackground: boolean;
  isInactive: boolean;
}

export const useAppState = (): AppStateHook => {
  const [appState, setAppState] = useState<AppStateType>(() => {
    const currentState = AppState.currentState;
    return currentState as AppStateType;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState as AppStateType);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
  };
}; 