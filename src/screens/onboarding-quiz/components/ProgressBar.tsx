import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  totalSteps: number;
  color?: string;
  backgroundColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  totalSteps,
  color = '#0081EF',
  backgroundColor = '#E5E5E5',
}) => {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming((progress / totalSteps) * 100, {
      duration: 300,
    });
  }, [progress, totalSteps]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[styles.bar, { backgroundColor: color }, animatedStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ProgressBar;
