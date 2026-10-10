// import { useAppTheme } from '@/hooks/themeHook';
// import React from 'react';
// import {
//   ActivityIndicator,
//   StyleProp,
//   StyleSheet,
//   Text,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { RectButton } from 'react-native-gesture-handler';

// interface IconButtonProps {
//   icon: React.ReactNode;
//   onPress: () => void;
//   variant?: 'light' | 'white';
//   size?: number;
//   disabled?: boolean;
// }

// interface ButtonProps {
//   text: string;
//   onPress: () => void;
//   variant?: 'outline' | 'contained';
//   icon?: React.ReactNode;
//   disabled?: boolean;
//   loading?: boolean;
//   size?: number;
//   style?: StyleProp<ViewStyle>;
// }

// export const IconButton: React.FC<IconButtonProps> = ({
//   icon,
//   onPress,
//   variant = 'light',
//   size = 40,
//   disabled = false,
// }) => {
//   const backgroundColor =
//     variant === 'light'
//       ? `rgba(24, 87, 193, 0.1)`
//       : `rgba(255, 255, 255, 0.25)`;

//   return (
//     <RectButton
//       onPress={onPress}
//       enabled={!disabled}
//       style={[
//         styles.iconButton,
//         {
//           width: size,
//           height: size,
//           borderRadius: size / 2,
//           backgroundColor,
//           opacity: disabled ? 0.5 : 1,
//         },
//       ]}
//     >
//       {icon}
//     </RectButton>
//   );
// };

// export const Button: React.FC<ButtonProps> = ({
//   text,
//   onPress,
//   variant = 'contained',
//   icon,
//   disabled = false,
//   loading = false,
//   size = 14,
//   style,
// }) => {
//   const { Colors } = useAppTheme();
//   const isOutline = variant === 'outline';
//   const buttonBackgroundColor = isOutline ? Colors.white : Colors.primaryColor;
//   const buttonBorderColor = isOutline ? Colors.primaryColor : 'transparent';
//   const buttonTextColor = isOutline ? Colors.primaryColor : Colors.white;

//   return (
//     <RectButton
//       onPress={onPress}
//       enabled={!disabled && !loading}
//       style={[
//         styles.button,
//         {
//           backgroundColor: buttonBackgroundColor,
//           borderWidth: isOutline ? 1 : 0,
//           borderColor: buttonBorderColor,
//         },
//         disabled && styles.disabledButton,
//         style,
//       ]}
//     >
//       {loading ? (
//         <ActivityIndicator color={buttonTextColor} size="small" />
//       ) : (
//         <>
//           {icon && <View style={styles.iconContainer}>{icon}</View>}
//           <Text
//             style={[
//               styles.buttonText,
//               { color: buttonTextColor, fontSize: size },
//             ]}
//           >
//             {text}
//           </Text>
//         </>
//       )}
//     </RectButton>
//   );
// };

// const styles = StyleSheet.create({
//   iconButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     borderRadius: 30,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     maxHeight: 48,
//     width: '100%',
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     fontFamily: 'Nunito-ExtraBold',
//     fontSize: 14,
//     letterSpacing: 0.3,
//     fontWeight: '700',
//   },
//   iconContainer: {
//     marginRight: 8,
//   },
// });

// export default Button;

import { useAppTheme } from '@/hooks/themeHook';
import { hapticFeedback } from '@/utils/haptics';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'light' | 'white' | 'primary';
  size?: number;
  disabled?: boolean;
}

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'outline' | 'contained' | 'text' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'light',
  size = 48,
  disabled = false,
}) => {
  const { Colors } = useAppTheme();
  const scale = useSharedValue(1);

  const backgroundColor =
    variant === 'light'
      ? `${Colors.primaryColor || '#1857C1'}15`
      : variant === 'primary'
      ? Colors.primaryColor || '#1857C1'
      : 'rgba(255, 255, 255, 0.95)';

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 12 });
    hapticFeedback('impactLight');
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedRectButton
      onPress={onPress}
      enabled={!disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.iconButton,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
        Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 2,
          },
        }),
      ]}
    >
      {icon}
    </AnimatedRectButton>
  );
};

export const Button: React.FC<ButtonProps> = ({
  text,
  onPress,
  variant = 'contained',
  icon,
  disabled = false,
  loading = false,
  size = 16,
  style,
  fullWidth = true,
}) => {
  const { Colors } = useAppTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isOutline = variant === 'outline';
  const isText = variant === 'text';
  const isGhost = variant === 'ghost';
  const isContained = variant === 'contained';

  // Button colors based on variant
  const buttonBackgroundColor = isContained
    ? Colors.primaryColor || '#1857C1'
    : isOutline
    ? 'transparent'
    : isGhost
    ? `${Colors.primaryColor || '#1857C1'}10`
    : 'transparent';

  const buttonBorderColor = isOutline
    ? Colors.primaryColor || '#1857C1'
    : 'transparent';

  const buttonTextColor = isContained
    ? Colors.white || '#FFFFFF'
    : Colors.primaryColor || '#1857C1';

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12 });
    opacity.value = withTiming(0.85, { duration: 100 });
    hapticFeedback('impactLight');
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedRectButton
      onPress={onPress}
      enabled={!disabled && !loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: buttonBackgroundColor,
          borderWidth: isOutline ? 2 : 0,
          borderColor: buttonBorderColor,
          width: fullWidth ? '100%' : 'auto',
          paddingHorizontal: isText ? 8 : 24,
          minWidth: isText ? 'auto' : 120,
        },
        (disabled || loading) && styles.disabledButton,
        isText && styles.textButton,
        style,
        Platform.select({
          ios: {
            shadowColor: isContained ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isContained ? 0.15 : 0,
            shadowRadius: 4,
          },
          android: {
            elevation: isContained ? 3 : 0,
          },
        }),
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={buttonTextColor}
            size="small"
            style={styles.activityIndicator}
          />
          <Text
            style={[
              styles.buttonText,
              { color: buttonTextColor, fontSize: size, marginLeft: 8 },
            ]}
          >
            {text}
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.buttonText,
              { color: buttonTextColor, fontSize: size },
              icon && styles.buttonTextWithIcon,
            ]}
          >
            {text}
          </Text>
        </View>
      )}
    </AnimatedRectButton>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  textButton: {
    minHeight: 40,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    letterSpacing: 0.3,
    fontWeight: '700',
  },
  buttonTextWithIcon: {
    marginLeft: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    marginRight: 0,
  },
});

export default Button;
