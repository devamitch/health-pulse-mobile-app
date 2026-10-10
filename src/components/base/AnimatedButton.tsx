'use client';

import type React from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Reanimated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps {
  onPress: () => void;
  text: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  activeBackgroundColor?: string;
  loadingColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  height?: number;
  width?: string | number;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * A reusable animated button component with loading state
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  text,
  loading = false,
  disabled = false,
  style,
  textStyle,
  backgroundColor,
  activeBackgroundColor,
  loadingColor,
  borderColor,
  borderWidth,
  borderRadius = 28,
  height = 56,
  width = '100%',
  testID,
  accessibilityLabel,
}) => {
  const { Colors } = useAppTheme();
  
  // Use theme colors as defaults
  const finalBgColor = backgroundColor || Colors.primaryColor;
  const finalLoadingColor = loadingColor || Colors.white;
  const finalBorderColor = borderColor || finalBgColor;
  
  // Animation values
  const scale = useSharedValue(1);
  const bgColorProgress = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Update opacity when disabled state changes
  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.6 : 1, {
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [disabled, opacity]);

  // Handle press animations
  const handlePressIn = () => {
    scale.value = withTiming(0.98, {
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    if (activeBackgroundColor) {
      bgColorProgress.value = withTiming(1, {
        duration: 100,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    if (activeBackgroundColor) {
      bgColorProgress.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const animatedBgColor = activeBackgroundColor
      ? interpolateColor(
          bgColorProgress.value,
          [0, 1],
          [finalBgColor, activeBackgroundColor],
        )
      : finalBgColor;

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: animatedBgColor,
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedTouchable
      onPress={loading || disabled ? undefined : onPress}
      onPressIn={loading || disabled ? undefined : handlePressIn}
      onPressOut={loading || disabled ? undefined : handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.button,
        {
          backgroundColor: finalBgColor,
          borderColor: finalBorderColor,
          borderWidth: borderWidth || 0,
          borderRadius,
          height,
          width,
        },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || text}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={finalLoadingColor} size="small" />
      ) : (
        <Text style={[styles.text, textStyle]}>{text}</Text>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
});
