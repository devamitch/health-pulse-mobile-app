'use client';

import type React from 'react';
import { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

const AnimatedView = Reanimated.createAnimatedComponent(View);

interface AnimatedDividerProps {
  text?: string;
  style?: StyleProp<ViewStyle>;
  lineStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  initialDelay?: number;
  duration?: number;
  lineColor?: string;
  textColor?: string;
  testID?: string;
}

/**
 * A reusable animated divider component with optional text
 */
export const AnimatedDivider: React.FC<AnimatedDividerProps> = ({
  text,
  style,
  lineStyle,
  textStyle,
  initialDelay = 0,
  duration = 500,
  lineColor,
  textColor,
  testID,
}) => {
  const { Colors } = useAppTheme();
  

  const finalLineColor = lineColor || Colors.border;
  const finalTextColor = textColor || Colors.textSecondary;
  
  // Animation values
  const opacity = useSharedValue(0);
  const lineWidth = useSharedValue(0);

  // Start animations on mount
  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      lineWidth.value = withTiming(1, {
        duration: duration * 1.2,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, initialDelay);
  }, [opacity, lineWidth, initialDelay, duration]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const leftLineAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${lineWidth.value * 100}%`,
    };
  });

  const rightLineAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${lineWidth.value * 100}%`,
    };
  });

  return (
    <AnimatedView
      style={[styles.container, style, containerAnimatedStyle]}
      testID={testID}
    >
      <AnimatedView
        style={[
          styles.line,
          { backgroundColor: finalLineColor },
          lineStyle,
          leftLineAnimatedStyle,
        ]}
      />
      {text && (
        <Text style={[styles.text, { color: finalTextColor }, textStyle]}>
          {text}
        </Text>
      )}
      <AnimatedView
        style={[
          styles.line,
          { backgroundColor: finalLineColor },
          lineStyle,
          rightLineAnimatedStyle,
        ]}
      />
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
});
