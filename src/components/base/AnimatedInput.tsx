import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ColorValue,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedView = Reanimated.createAnimatedComponent(View);
type AnimatedInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  index: number;
  showPasswordStrength?: boolean;
  clearErrorAfterDelay?: boolean;
  labelBackgroundColor?: ColorValue;
  isLabelVisible?: boolean;
  inputFieldColor?: ColorValue;
  inputColor?: ColorValue;
};

// Password strength indicator
type PasswordStrength = 'weak' | 'medium' | 'strong' | 'none';

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return 'none';

  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength =
    (hasLowerCase ? 1 : 0) +
    (hasUpperCase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  if (password.length < 6) return 'weak';
  if (strength <= 2) return 'weak';
  if (strength === 3) return 'medium';
  return 'strong';
};

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  leftIcon,
  rightIcon,
  onRightIconPress,
  index,
  showPasswordStrength = false,
  clearErrorAfterDelay = true,
  labelBackgroundColor,
  isLabelVisible = true,
  inputFieldColor,
  inputColor,
}) => {
  const { Colors } = useAppTheme();
  const primaryColor = Colors.primaryColor;
  const errorColor = Colors.error;

  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState(error);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const labelPosition = useSharedValue(value ? 1 : 0);
  const errorOpacity = useSharedValue(0);
  const shake = useSharedValue(0);

  // Password strength
  const passwordStrength = showPasswordStrength
    ? getPasswordStrength(value)
    : 'none';

  useEffect(() => {
    // Entrance animation with staggered delay based on index
    opacity.value = withDelay(
      100 * index,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      100 * index,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  useEffect(() => {
    setLocalError(error);

    // Error animation
    if (error) {
      errorOpacity.value = withTiming(1, { duration: 200 });
      shake.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      // Clear error after delay
      if (clearErrorAfterDelay) {
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }

        errorTimeoutRef.current = setTimeout(() => {
          errorOpacity.value = withTiming(0, { duration: 300 });
          setLocalError('');
        }, 5000); // Clear error after 5 seconds
      }
    } else {
      errorOpacity.value = withTiming(0, { duration: 200 });
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    labelPosition.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
  };

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: shake.value },
      ],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            labelPosition.value,
            [0, 1],
            [0, -12],
            Extrapolate.CLAMP,
          ),
        },
        {
          scale: interpolate(
            labelPosition.value,
            [0, 1],
            [1, 0.9],
            Extrapolate.CLAMP,
          ),
        },
      ],
      color: localError
        ? errorColor
        : isFocused
        ? primaryColor
        : Colors.textPrimaryColor,
      fontSize: interpolate(
        labelPosition.value,
        [0, 1],
        [16, 14],
        Extrapolate.CLAMP,
      ),
    };
  });

  const inputWrapperStyle = useAnimatedStyle(() => {
    return {
      borderColor: localError
        ? errorColor
        : isFocused
        ? primaryColor
        : Colors.border,
      borderWidth: isFocused ? 1.5 : 1,
      backgroundColor: isFocused
        ? 'rgba(30, 136, 229, 0.03)'
        : inputFieldColor ?? Colors.surface,
    };
  });

  const errorMessageStyle = useAnimatedStyle(() => {
    return {
      opacity: errorOpacity.value,
      transform: [
        {
          translateY: interpolate(
            errorOpacity.value,
            [0, 1],
            [-10, 0],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  });

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'strong':
        return Colors.greenColor;
      default:
        return 'transparent';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Weak password';
      case 'medium':
        return 'Medium strength';
      case 'strong':
        return 'Strong password';
      default:
        return '';
    }
  };

  return (
    <Reanimated.View style={[styles.inputContainer, containerStyle]}>
      {isLabelVisible ? (
        <Reanimated.Text
          style={[
            styles.inputLabel,
            labelStyle,
            labelBackgroundColor && { backgroundColor: labelBackgroundColor },
          ]}
        >
          {label}
        </Reanimated.Text>
      ) : null}

      <Reanimated.View
        style={[
          styles.inputWrapper,
          inputWrapperStyle,
          inputFieldColor && { backgroundColor: inputFieldColor },
        ]}
      >
        {leftIcon}
        <TextInput
          style={[styles.input, { color: inputColor ?? Colors.textPrimaryColor }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={primaryColor}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Reanimated.View>

      {localError && (
        <Reanimated.Text style={[styles.errorText, errorMessageStyle]}>
          {localError}
        </Reanimated.Text>
      )}

      {showPasswordStrength && value.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.strengthBars}>
            <View
              style={[
                styles.strengthBar,
                {
                  backgroundColor:
                    passwordStrength !== 'none'
                      ? getPasswordStrengthColor()
                      : Colors.border,
                },
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                {
                  backgroundColor: ['medium', 'strong'].includes(
                    passwordStrength,
                  )
                    ? getPasswordStrengthColor()
                    : Colors.border,
                },
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                {
                  backgroundColor:
                    passwordStrength === 'strong'
                      ? getPasswordStrengthColor()
                      : Colors.border,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.strengthText, { color: getPasswordStrengthColor() }]}
          >
            {getPasswordStrengthText()}
          </Text>
        </View>
      )}
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 28,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    position: 'absolute',
    top: -10,
    left: 16,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 0,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: FONT_FAMILIES.nunitoMedium,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  iconContainer: {
    marginHorizontal: 5,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    height: 4,
    width: 24,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: FONT_FAMILIES.nunitoMedium,
  },
});
