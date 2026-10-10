import type React from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Reanimated.createAnimatedComponent(RectButton);
const AnimatedView = Reanimated.View;

interface AnimatedSocialButtonProps {
  onPress: () => void;
  text: string;
  icon: ImageSourcePropType;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  iconBackgroundColor?: string;
  contentBackgroundColor?: string;
  iconTintColor?: string;
  loadingColor?: string;
  height?: number;
  width?: string | number;
  testID?: string;
  accessibilityLabel?: string;
  type?: 'google' | 'apple' | 'default';
  borderRadius?: number;
}

export type SocialButtonProps = {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  index: number;
};
/**
 * A reusable animated social button component with loading state
 */
export const AnimatedSocialButton: React.FC<AnimatedSocialButtonProps> = ({
  onPress,
  text,
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  backgroundColor,
  iconBackgroundColor,
  contentBackgroundColor,
  iconTintColor,
  loadingColor,
  height = 48,
  width = '100%',
  testID,
  accessibilityLabel,
  type = 'default',
  borderRadius = 4,
}) => {
  let defaultStyles = {
    backgroundColor: backgroundColor || '#FFFFFF',
    iconBackgroundColor: iconBackgroundColor || '#FFFFFF',
    contentBackgroundColor: contentBackgroundColor || '#FFFFFF',
    textColor: '#000000',
    loadingColor: loadingColor || '#000000',
    borderRadius: borderRadius,
    borderWidth: 0,
    borderColor: 'transparent',
  };

  if (type === 'google') {
    defaultStyles = {
      backgroundColor: backgroundColor || '#ffffff',
      iconBackgroundColor: iconBackgroundColor || '#ffffff',
      contentBackgroundColor: contentBackgroundColor || '#ffffff',
      textColor: '#5f6368', // Google's text color
      loadingColor: loadingColor || '#5f6368',
      borderRadius,
      borderWidth: 1,
      borderColor: '#dadce0', // Google's border color
      overflow: 'hidden',
    };
  } else if (type === 'apple') {
    defaultStyles = {
      backgroundColor: backgroundColor || '#000000',
      iconBackgroundColor: iconBackgroundColor || '#000000',
      contentBackgroundColor: contentBackgroundColor || '#000000',
      textColor: '#FFFFFF',
      loadingColor: loadingColor || '#FFFFFF',
      borderRadius: borderRadius,
      borderWidth: 0,
      borderColor: 'transparent',
    };
  }

  return (
    <RectButton
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: defaultStyles.backgroundColor,
          height,
          width,
          borderRadius: defaultStyles.borderRadius,
          borderWidth: defaultStyles.borderWidth,
          borderColor: defaultStyles.borderColor,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || text}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      enabled={!disabled && !loading}
    >
      <></>
      {loading ? (
        <ActivityIndicator color={defaultStyles.loadingColor} size="small" />
      ) : (
        <>
          <View
            style={[
              styles.textContainer,
              {
                backgroundColor: defaultStyles.contentBackgroundColor,
                height,
                paddingLeft: type === 'google' ? 24 : 16,
                paddingRight: type === 'google' ? 24 : 16,
              },
            ]}
          >
            <Image
              source={icon}
              style={[
                styles.icon,
                iconTintColor ? { tintColor: iconTintColor } : null,
                type === 'google'
                  ? { width: 18, height: 18 }
                  : { width: 20, height: 20 },
              ]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.text,
                { color: defaultStyles.textColor },
                textStyle,
              ]}
            >
              {text}
            </Text>
          </View>
        </>
      )}
    </RectButton>
  );
};

export const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  onPress,
  backgroundColor = '#FFFFFF',
  borderColor = '#E0E0E0',
  index,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    opacity.value = withDelay(
      300 + index * 100,
      withTiming(1, { duration: 300 }),
    );
    scale.value = withDelay(
      300 + index * 100,
      withSpring(1, { damping: 12, stiffness: 120 }),
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      backgroundColor,
      borderColor,
    };
  });

  return (
    <RectButton
      activeOpacity={0.9}
      onPress={onPress}
      // onBegan={handlePressIn}
      // // onPressIn={handlePressIn}
      // onEnded={handlePressOut}
    >
      <Reanimated.View style={[styles.socialIconButton, animatedStyle]}>
        {icon}
      </Reanimated.View>
    </RectButton>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    overflow: 'hidden',
    // Reduced shadow for more sophisticated look
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  socialIconButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
