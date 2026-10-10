'use client';

import { BlurView } from '@react-native-community/blur';
import type React from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import Reanimated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedView = Reanimated.createAnimatedComponent(View);

interface AnimatedLoaderProps {
  loading: boolean;
  size?: 'small' | 'large';
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  pulseAnimation?: boolean;
}

/**
 * A reusable animated loader component with fade in/out animations
 */
export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  loading,
  size = 'large',
  color = '#1857C1',
  backgroundColor = 'rgba(255, 255, 255, 0.8)',
  opacity: customOpacity = 0.8,
  style,
  testID,
  pulseAnimation = false,
}) => {
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const { height, width } = useWindowDimensions();
  // Start animations when loading state changes
  useEffect(() => {
    if (loading) {
      opacity.value = withTiming(customOpacity, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      if (pulseAnimation) {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, {
              duration: 700,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            withTiming(1, {
              duration: 700,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            withTiming(1, {
              duration: 700,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
          ),
          -1,
          true,
        );
      }
    } else {
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      if (pulseAnimation) {
        cancelAnimation(scale);
        scale.value = 1;
      }
    }

    return () => {
      if (pulseAnimation) {
        cancelAnimation(scale);
      }
    };
  }, [loading, opacity, scale, customOpacity, pulseAnimation]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Modal
      isVisible={loading}
      presentationStyle="formSheet"
      backdropColor="rgba(255,255,255,0.1)"
      backdropOpacity={0.2}
      hasBackdrop={false}
      useNativeDriver
      useNativeDriverForBackdrop
      animationInTiming={300}
      animationOutTiming={300}
      style={[StyleSheet.absoluteFill, { padding: 0, flex: 1, margin: 0 }]}
      deviceHeight={height + 10}
      deviceWidth={width}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={5}
      />
      <AnimatedView
        style={[styles.container, { backgroundColor }, style, animatedStyle]}
        testID={testID}
      >
        <ActivityIndicator size={size} color={color} />
      </AnimatedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
