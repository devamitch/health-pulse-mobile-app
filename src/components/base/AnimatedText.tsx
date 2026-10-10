'use client';

import type React from 'react';
import { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

const AnimatedText = Reanimated.createAnimatedComponent(Text);

interface AnimatedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  initialDelay?: number;
  duration?: number;
  fadeIn?: boolean;
  slideIn?: boolean;
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  slideDistance?: number;
  testID?: string;
}

/**
 * A reusable animated text component with various animation options
 */
export const AnimatedTextComponent: React.FC<AnimatedTextProps> = ({
  text,
  style,
  initialDelay = 0,
  duration = 500,
  fadeIn = true,
  slideIn = false,
  slideDirection = 'up',
  slideDistance = 20,
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
    }, initialDelay);
  }, [opacity, translateX, translateY, initialDelay, duration, slideIn]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <AnimatedText style={[styles.text, style, animatedStyle]} testID={testID}>
      {text}
    </AnimatedText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
});
