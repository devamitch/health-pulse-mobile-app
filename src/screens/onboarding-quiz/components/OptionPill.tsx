// ============================================
// OptionPill - Theme-aware Pill-shaped Selection Button
// ============================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '../../../constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';

interface OptionPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large' | 'wide';
  delay?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OptionPill: React.FC<OptionPillProps> = ({
  label,
  isSelected,
  onPress,
  size = 'medium',
  delay = 0,
  color = 'primary',
  disabled = false,
  style,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.pillSmall;
      case 'large':
        return styles.pillLarge;
      case 'wide':
        return styles.pillWide;
      default:
        return styles.pillMedium;
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'secondary':
        return isSelected ? styles.pillSecondarySelected : styles.pillSecondary;
      case 'success':
        return isSelected ? styles.pillSuccessSelected : styles.pillSuccess;
      case 'warning':
        return isSelected ? styles.pillWarningSelected : styles.pillWarning;
      default:
        return isSelected ? styles.pillPrimarySelected : styles.pillPrimary;
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={disabled}
        style={[
          styles.pill,
          getSizeStyles(),
          getColorStyles(),
          disabled && styles.pillDisabled,
          animatedStyle,
          style,
        ]}
      >
        <Text
          style={[
            styles.pillText,
            isSelected && styles.pillTextSelected,
            disabled && styles.pillTextDisabled,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    pill: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 25,
      marginHorizontal: 4,
      marginVertical: 6,
    },
    pillSmall: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      minWidth: 60,
    },
    pillMedium: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      minWidth: 70,
    },
    pillLarge: {
      paddingVertical: 14,
      paddingHorizontal: 28,
      minWidth: 100,
    },
    pillWide: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      minWidth: 140,
      flex: 1,
    },

    // Primary color
    pillPrimary: {
      backgroundColor: Colors.primaryBg,
    },
    pillPrimarySelected: {
      backgroundColor: '#1857C1',
    },

    // Secondary color
    pillSecondary: {
      backgroundColor: Colors.primaryBg,
    },
    pillSecondarySelected: {
      backgroundColor: Colors.textSecondary,
    },

    // Success color (green)
    pillSuccess: {
      backgroundColor: Colors.primaryBg,
    },
    pillSuccessSelected: {
      backgroundColor: Colors.greenColor,
    },

    // Warning color (orange/yellow)
    pillWarning: {
      backgroundColor: Colors.primaryBg,
    },
    pillWarningSelected: {
      backgroundColor: Colors.warning,
    },

    pillDisabled: {
      opacity: 0.5,
    },
    pillText: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.primaryColor,
      textAlign: 'center',
    },
    pillTextSelected: {
      color: 'white',
    },
    pillTextDisabled: {
      color: Colors.textDisabled,
    },
  });

export default OptionPill;
