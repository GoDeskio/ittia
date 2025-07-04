import {useState, useCallback} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import {check, request, PERMISSIONS, RESULTS, Permission} from 'react-native-permissions';

type PermissionStatus = 'unavailable' | 'denied' | 'limited' | 'granted' | 'blocked';

interface PermissionState {
  status: PermissionStatus;
  isGranted: boolean;
  isBlocked: boolean;
}

interface UsePermissionsOptions {
  permission: Permission;
  rationale?: {
    title: string;
    message: string;
    buttonPositive?: string;
    buttonNegative?: string;
  };
}

export const usePermissions = ({permission, rationale}: UsePermissionsOptions) => {
  const [state, setState] = useState<PermissionState>({
    status: 'denied',
    isGranted: false,
    isBlocked: false,
  });

  const checkPermission = useCallback(async () => {
    try {
      const result = await check(permission);
      setState({
        status: result,
        isGranted: result === RESULTS.GRANTED,
        isBlocked: result === RESULTS.BLOCKED,
      });
      return result;
    } catch (error) {
      console.error('Error checking permission:', error);
      return RESULTS.DENIED;
    }
  }, [permission]);

  const requestPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android' && rationale) {
        const granted = await PermissionsAndroid.request(
          permission,
          rationale,
        );
        setState({
          status: granted,
          isGranted: granted === PermissionsAndroid.RESULTS.GRANTED,
          isBlocked: granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        });
        return granted;
      }

      const result = await request(permission);
      setState({
        status: result,
        isGranted: result === RESULTS.GRANTED,
        isBlocked: result === RESULTS.BLOCKED,
      });
      return result;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return RESULTS.DENIED;
    }
  }, [permission, rationale]);

  return {
    ...state,
    checkPermission,
    requestPermission,
  };
}; 