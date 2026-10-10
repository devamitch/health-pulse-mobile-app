import { CustomThemeType } from '@/hooks/themeHook';
import { hapticFeedback } from '@/utils/haptics';
import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'confetti';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  icon?: string;
  showProgress?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
  position?: 'top' | 'bottom';
}

interface ToastProps extends ToastConfig {
  onDismiss: () => void;
  theme: CustomThemeType;
}

const createToastThemes = (theme: CustomThemeType) => {
  const isDark = theme.Colors.isDark;

  return {
    success: {
      icon: 'check-circle',
      // Light: Matte mint green | Dark: Vibrant teal
      backgroundColor: isDark ? '#10B981' : '#D1F4E0',
      iconBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#A7F3D0',
      textColor: isDark ? '#FFFFFF' : '#065F46',
      iconColor: isDark ? '#FFFFFF' : '#059669',
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(5, 150, 105, 0.2)',
      progressColor: isDark ? '#FFFFFF' : '#059669',
      blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      overlayOpacity: isDark ? 0.95 : 0.85,
    },
    error: {
      icon: 'alert-circle',
      // Light: Matte pink | Dark: Vibrant red/pink
      backgroundColor: isDark ? '#EF4444' : '#FECDD3',
      iconBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#FCA5A5',
      textColor: isDark ? '#FFFFFF' : '#991B1B',
      iconColor: isDark ? '#FFFFFF' : '#DC2626',
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(220, 38, 38, 0.2)',
      progressColor: isDark ? '#FFFFFF' : '#DC2626',
      blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      overlayOpacity: isDark ? 0.95 : 0.85,
    },
    warning: {
      icon: 'alert',
      // Light: Matte amber | Dark: Vibrant orange
      backgroundColor: isDark ? '#F59E0B' : '#FEF3C7',
      iconBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#FCD34D',
      textColor: isDark ? '#FFFFFF' : '#92400E',
      iconColor: isDark ? '#FFFFFF' : '#D97706',
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(217, 119, 6, 0.2)',
      progressColor: isDark ? '#FFFFFF' : '#D97706',
      blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      overlayOpacity: isDark ? 0.95 : 0.85,
    },
    info: {
      icon: 'information',
      // Light: Matte blue | Dark: Vibrant blue
      backgroundColor: isDark ? '#3B82F6' : '#DBEAFE',
      iconBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#93C5FD',
      textColor: isDark ? '#FFFFFF' : '#1E40AF',
      iconColor: isDark ? '#FFFFFF' : '#2563EB',
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(37, 99, 235, 0.2)',
      progressColor: isDark ? '#FFFFFF' : '#2563EB',
      blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      overlayOpacity: isDark ? 0.95 : 0.85,
    },
    default: {
      icon: 'message-text',
      // Light: Matte grey | Dark: Vibrant slate
      backgroundColor: isDark ? '#64748B' : '#F1F5F9',
      iconBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
      textColor: isDark ? '#FFFFFF' : '#334155',
      iconColor: isDark ? '#FFFFFF' : '#64748B',
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(100, 116, 139, 0.2)',
      progressColor: isDark ? '#FFFFFF' : '#64748B',
      blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      overlayOpacity: isDark ? 0.95 : 0.85,
    },
    confetti: {
      icon: 'party-popper',
      // Light: Matte purple | Dark: Vibrant pink/purple
      backgroundColor: isDark ? '#EC4899' : '#FCE7F3',
      iconBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#FBCFE8',
      textColor: isDark ? '#FFFFFF' : '#9F1239',
      iconColor: isDark ? '#FFFFFF' : '#E11D48',
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(225, 29, 72, 0.2)',
      progressColor: isDark ? '#FFFFFF' : '#E11D48',
      blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
      overlayOpacity: isDark ? 0.95 : 0.85,
    },
  };
};

export const ToastComponent: React.FC<ToastProps> = ({
  message,
  type = 'default',
  duration = 3000,
  icon,
  showProgress = false,
  action,
  position = 'bottom',
  onDismiss,
  theme,
}) => {
  const translateY = useSharedValue(position === 'top' ? -150 : 150);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const iconScale = useSharedValue(0.8);
  const progressWidth = useSharedValue(100);
  const confettiRef = useRef<any>(null);

  const TOAST_THEMES = createToastThemes(theme);
  const themeConfig = TOAST_THEMES[type];
  const displayIcon = icon || themeConfig.icon;

  useEffect(() => {
    // Smooth entrance animations
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });

    // Subtle icon animation
    iconScale.value = withSequence(
      withTiming(1.15, { duration: 150 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );

    // Progress bar
    if (showProgress) {
      progressWidth.value = withTiming(0, {
        duration: duration,
        easing: Easing.linear,
      });
    }

    // Confetti
    if (type === 'confetti' && confettiRef.current) {
      setTimeout(() => {
        confettiRef.current?.start();
      }, 150);
    }

    // Haptic feedback
    const hapticType =
      type === 'success'
        ? 'notificationSuccess'
        : type === 'error'
        ? 'notificationError'
        : type === 'warning'
        ? 'notificationWarning'
        : type === 'confetti'
        ? 'impactHeavy'
        : 'impactLight';
    hapticFeedback(hapticType);

    // Auto dismiss
    const timer = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(position === 'top' ? -150 : 150, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
    scale.value = withTiming(0.95, { duration: 200 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        position === 'top' ? styles.containerTop : styles.containerBottom,
      ]}
    >
      <View
        style={[
          styles.toastWrapper,
          {
            borderColor: themeConfig.borderColor,
            overflow: 'hidden',
          },
        ]}
      >
        {/* BlurView Background */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={themeConfig.blurType}
          blurAmount={15}
          reducedTransparencyFallbackColor={themeConfig.backgroundColor}
        />

        {/* Color Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: themeConfig.backgroundColor,
              opacity: themeConfig.overlayOpacity,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.contentRow}>
          {/* Icon */}
          <Animated.View style={iconAnimatedStyle}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: themeConfig.iconBackgroundColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={displayIcon}
                size={20}
                color={themeConfig.iconColor}
              />
            </View>
          </Animated.View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text
              style={[styles.message, { color: themeConfig.textColor }]}
              numberOfLines={3}
            >
              {message}
            </Text>
          </View>

          {/* Action or Close */}
          {action ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: themeConfig.iconBackgroundColor,
                },
              ]}
              onPress={() => {
                action.onPress();
                dismiss();
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.actionText, { color: themeConfig.textColor }]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={dismiss}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={16}
                color={themeConfig.iconColor}
                style={{ opacity: 0.7 }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        {showProgress && (
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: `${themeConfig.progressColor}20` },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                progressStyle,
                { backgroundColor: themeConfig.progressColor },
              ]}
            />
          </View>
        )}
      </View>

      {/* Confetti */}
      {type === 'confetti' && (
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={2500}
          explosionSpeed={400}
          colors={[
            '#10B981',
            '#3B82F6',
            '#F59E0B',
            '#EC4899',
            '#34D399',
            '#60A5FA',
            '#FBBF24',
            '#F472B6',
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  containerTop: {
    top: Platform.OS === 'ios' ? 60 : 24,
  },
  containerBottom: {
    bottom: Platform.OS === 'ios' ? 50 : 24,
  },
  toastWrapper: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    // Shadow for elevation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 6,
  },
  progressContainer: {
    height: 3,
  },
  progressBar: {
    height: '100%',
  },
});

export default ToastComponent;
