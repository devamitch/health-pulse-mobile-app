'use client';

import { useAppTheme } from '@/hooks/themeHook';
/**
 * Loading Animation Component
 * Displays a pulsing animation during processing states
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface LoadingAnimationProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  text,
  size = 'medium',
}) => {
  const { Colors } = useAppTheme();

  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(1);
  const opacity3 = useSharedValue(1);

  const dotSize = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const gap = size === 'small' ? 8 : size === 'medium' ? 12 : 16;

  useEffect(() => {
    const animationConfig = {
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.6, 1),
    };

    // Dot 1
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.3, animationConfig),
        withTiming(1, animationConfig),
      ),
      -1,
      false,
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.4, animationConfig),
        withTiming(1, animationConfig),
      ),
      -1,
      false,
    );

    // Dot 2 (delayed)
    setTimeout(() => {
      scale2.value = withRepeat(
        withSequence(
          withTiming(1.3, animationConfig),
          withTiming(1, animationConfig),
        ),
        -1,
        false,
      );
      opacity2.value = withRepeat(
        withSequence(
          withTiming(0.4, animationConfig),
          withTiming(1, animationConfig),
        ),
        -1,
        false,
      );
    }, 200);

    // Dot 3 (delayed more)
    setTimeout(() => {
      scale3.value = withRepeat(
        withSequence(
          withTiming(1.3, animationConfig),
          withTiming(1, animationConfig),
        ),
        -1,
        false,
      );
      opacity3.value = withRepeat(
        withSequence(
          withTiming(0.4, animationConfig),
          withTiming(1, animationConfig),
        ),
        -1,
        false,
      );
    }, 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { gap }]}>
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: Colors.primaryColor,
            },
            dot1Style,
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: Colors.primaryColor,
            },
            dot2Style,
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: Colors.primaryColor,
            },
            dot3Style,
          ]}
        />
      </View>
      {text && (
        <Text style={[styles.text, { color: Colors.textSecondary }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
  text: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },
});

export default LoadingAnimation;
