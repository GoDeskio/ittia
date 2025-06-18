import {useState, useEffect} from 'react';
import {Platform, Dimensions, PixelRatio} from 'react-native';
import DeviceInfo from 'react-native-device-info';

interface DeviceInfoState {
  brand: string;
  manufacturer: string;
  model: string;
  systemName: string;
  systemVersion: string;
  uniqueId: string;
  deviceId: string;
  appVersion: string;
  buildNumber: string;
  isTablet: boolean;
  isEmulator: boolean;
  hasNotch: boolean;
  screenWidth: number;
  screenHeight: number;
  scale: number;
  fontScale: number;
}

export const useDeviceInfo = () => {
  const [state, setState] = useState<DeviceInfoState>({
    brand: '',
    manufacturer: '',
    model: '',
    systemName: Platform.OS,
    systemVersion: Platform.Version.toString(),
    uniqueId: '',
    deviceId: '',
    appVersion: '',
    buildNumber: '',
    isTablet: false,
    isEmulator: false,
    hasNotch: false,
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
    scale: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
  });

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        const [
          brand,
          manufacturer,
          model,
          uniqueId,
          deviceId,
          appVersion,
          buildNumber,
          isTablet,
          isEmulator,
          hasNotch,
        ] = await Promise.all([
          DeviceInfo.getBrand(),
          DeviceInfo.getManufacturer(),
          DeviceInfo.getModel(),
          DeviceInfo.getUniqueId(),
          DeviceInfo.getDeviceId(),
          DeviceInfo.getVersion(),
          DeviceInfo.getBuildNumber(),
          DeviceInfo.isTablet(),
          DeviceInfo.isEmulator(),
          DeviceInfo.hasNotch(),
        ]);

        setState(prev => ({
          ...prev,
          brand,
          manufacturer,
          model,
          uniqueId,
          deviceId,
          appVersion,
          buildNumber,
          isTablet,
          isEmulator,
          hasNotch,
        }));
      } catch (error) {
        console.error('Error loading device info:', error);
      }
    };

    loadDeviceInfo();
  }, []);

  return state;
}; 