import {useCallback} from 'react';
import {useNavigation as useRNNavigation} from '@react-navigation/native';
import {NavigationProps} from '../types';

export const useNavigation = () => {
  const navigation = useRNNavigation<NavigationProps['navigation']>();

  const navigate = useCallback(
    (screen: string, params?: any) => {
      navigation.navigate(screen, params);
    },
    [navigation],
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const reset = useCallback(
    (screen: string, params?: any) => {
      navigation.reset({
        index: 0,
        routes: [{name: screen, params}],
      });
    },
    [navigation],
  );

  const replace = useCallback(
    (screen: string, params?: any) => {
      navigation.replace(screen, params);
    },
    [navigation],
  );

  const push = useCallback(
    (screen: string, params?: any) => {
      navigation.push(screen, params);
    },
    [navigation],
  );

  const pop = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const popToTop = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  return {
    navigate,
    goBack,
    reset,
    replace,
    push,
    pop,
    popToTop,
  };
}; 