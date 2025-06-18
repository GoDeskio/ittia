import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AudioWaveformProps {
  level: number;
  isListening: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  level,
  isListening,
}) => {
  const bars = 30;
  const barRefs = useRef<Animated.Value[]>([]);

  useEffect(() => {
    barRefs.current = Array(bars)
      .fill(0)
      .map(() => new Animated.Value(0));
  }, []);

  useEffect(() => {
    if (isListening) {
      const animations = barRefs.current.map((bar, index) => {
        const targetHeight = Math.random() * level;
        return Animated.timing(bar, {
          toValue: targetHeight,
          duration: 100,
          useNativeDriver: false,
        });
      });

      Animated.parallel(animations).start();
    } else {
      barRefs.current.forEach(bar => {
        Animated.timing(bar, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [level, isListening]);

  return (
    <View style={styles.container}>
      {barRefs.current.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: bar.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 50],
              }),
              backgroundColor: isListening ? '#2196F3' : '#BDBDBD',
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
}); 