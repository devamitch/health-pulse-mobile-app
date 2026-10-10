// ============================================
// QuestionnaireHeader - Theme-aware Header with Progress
// ============================================

import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Extrapolate,
  FadeIn,
  FadeOut,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '../../../constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';

interface QuestionnaireHeaderProps {
  onBack: () => void;
  onSkip?: () => void;
  showSkip: boolean;
  canGoBack: boolean;
  scrollX?: SharedValue<number>;
  totalScreens: number;
  screenWidth: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QuestionnaireHeader: React.FC<QuestionnaireHeaderProps> = ({
  onBack,
  onSkip,
  showSkip,
  canGoBack,
  scrollX,
  totalScreens,
  screenWidth,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const insets = useSafeAreaInsets();
  const backScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const skipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  // Progress bar animation
  const progressStyle = useAnimatedStyle(() => {
    'worklet';
    if (!scrollX) {
      return { width: '0%' };
    }
    const currentPosition = scrollX.value / screenWidth;
    const progressPercentage = interpolate(
      currentPosition,
      [0, totalScreens - 1],
      [0, 100],
      Extrapolate.CLAMP,
    );
    return {
      width: `${Math.max(progressPercentage, 5)}%`,
    };
  });

  const handleBackPress = () => {
    backScale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1),
    );
    onBack();
  };

  const handleSkipPress = () => {
    skipScale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1),
    );
    onSkip?.();
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      {/* Back Button */}
      <AnimatedTouchable
        onPress={handleBackPress}
        style={[styles.backButton, backStyle]}
        activeOpacity={0.7}
        disabled={!canGoBack}
      >
        <View style={[styles.iconContainer, !canGoBack && styles.disabled]}>
          <Ionicons
            name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
            size={22}
            color={canGoBack ? Colors.textColor : Colors.textDisabled}
          />
        </View>
      </AnimatedTouchable>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]}>
            <LinearGradient
              colors={[Colors.primaryColor, Colors.primaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
      </View>

      {/* Skip Button */}
      {showSkip ? (
        <AnimatedTouchable
          onPress={handleSkipPress}
          style={[styles.skipButton, skipStyle]}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </AnimatedTouchable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </Animated.View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.surfaceHover,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: {
      opacity: 0.6,
    },
    progressContainer: {
      flex: 1,
      paddingHorizontal: 12,
    },
    progressTrack: {
      width: '100%',
      height: 12,
      backgroundColor: Colors.isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(24, 87, 193, 0.15)',
      borderRadius: 6,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 6,
      overflow: 'hidden',
      shadowColor: 'black',
      elevation: 2,
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowRadius: 2,
      shadowOpacity: 0.9,
    },
    progressGradient: {
      flex: 1,
    },
    skipButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    skipText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textSecondary,
    },
    placeholder: {
      width: 44,
    },
  });

export default QuestionnaireHeader;
