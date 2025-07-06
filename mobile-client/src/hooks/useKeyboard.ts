import {useState, useEffect} from 'react';
import {Keyboard, KeyboardEvent, Platform} from 'react-native';

interface KeyboardState {
  keyboardHeight: number;
  keyboardVisible: boolean;
}

export const useKeyboard = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    keyboardHeight: 0,
    keyboardVisible: false,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardState({
          keyboardHeight: event.endCoordinates.height,
          keyboardVisible: true,
        });
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardState({
          keyboardHeight: 0,
          keyboardVisible: false,
        });
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return {
    ...keyboardState,
    dismissKeyboard,
  };
}; 