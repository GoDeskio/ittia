import {useState, useEffect} from 'react';
import {Dimensions, ScaledSize} from 'react-native';

type Orientation = 'PORTRAIT' | 'LANDSCAPE';

interface OrientationState {
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  dimensions: ScaledSize;
}

export const useOrientation = () => {
  const [state, setState] = useState<OrientationState>(() => {
    const dimensions = Dimensions.get('window');
    const isPortrait = dimensions.height > dimensions.width;
    return {
      orientation: isPortrait ? 'PORTRAIT' : 'LANDSCAPE',
      isPortrait,
      isLandscape: !isPortrait,
      dimensions,
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      const isPortrait = window.height > window.width;
      setState({
        orientation: isPortrait ? 'PORTRAIT' : 'LANDSCAPE',
        isPortrait,
        isLandscape: !isPortrait,
        dimensions: window,
      });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return state;
}; 