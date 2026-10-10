'use client';

import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ReanimatedView = Reanimated.createAnimatedComponent(View);

interface AnimatedViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  initialDelay?: number;
  duration?: number;
  fadeIn?: boolean;
  slideIn?: boolean;
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  slideDistance?: number;
  scale?: boolean;
  initialScale?: number;
  testID?: string;
}

/**
 * A reusable animated view component with various animation options
 */
export const AnimatedViewComponent: React.FC<AnimatedViewProps> = ({
  children,
  style,
  initialDelay = 0,
  duration = 500,
  fadeIn = true,
  slideIn = false,
  slideDirection = 'up',
  slideDistance = 20,
  scale = false,
  initialScale = 0.95,
  testID,
}) => {
  // Animation values
  const opacity = useSharedValue(fadeIn ? 0 : 1);
  const translateX = useSharedValue(
    slideIn && (slideDirection === 'left' || slideDirection === 'right')
      ? slideDirection === 'left'
        ? slideDistance
        : -slideDistance
      : 0,
  );
  const translateY = useSharedValue(
    slideIn && (slideDirection === 'up' || slideDirection === 'down')
      ? slideDirection === 'up'
        ? slideDistance
        : -slideDistance
      : 0,
  );
  const scaleValue = useSharedValue(scale ? initialScale : 1);

  // Start animations on mount
  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      if (slideIn) {
        translateX.value = withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        translateY.value = withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }

      if (scale) {
        scaleValue.value = withTiming(1, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    }, initialDelay);
  }, [
    opacity,
    translateX,
    translateY,
    scaleValue,
    initialDelay,
    duration,
    slideIn,
    scale,
  ]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scaleValue.value },
      ],
    };
  });

  return (
    <ReanimatedView
      style={[styles.container, style, animatedStyle]}
      testID={testID}
    >
      {children}
    </ReanimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base styles
  },
});
