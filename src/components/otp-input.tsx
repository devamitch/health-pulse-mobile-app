// import { useAppTheme } from '@/hooks/themeHook';
// import React, { useRef, useEffect } from 'react';
// import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

// export interface OtpInputProps {
//   length?: number;
//   value: string;
//   onChangeText: (value: string) => void;
//   onCodeFilled?: (code: string) => void;
// }

// const OtpInput: React.FC<OtpInputProps> = ({
//   length = 6,
//   value,
//   onChangeText,
//   onCodeFilled,
// }) => {
//   const inputs = useRef<Array<TextInput | null>>([]);
//   const { Colors } = useAppTheme();

//   // Auto-focus based on value change
//   useEffect(() => {
//     const chars = value.split('');
//     const firstEmpty = chars.findIndex(c => c === '');

//     if (firstEmpty !== -1 && inputs.current[firstEmpty]) {
//       inputs.current[firstEmpty]?.focus();
//     }
//   }, [value]);

//   const handleChange = (text: string, index: number) => {
//     const chars = value.split('');
//     chars[index] = text;

//     const newValue = chars.join('');
//     onChangeText(newValue);

//     // Move to next input
//     if (text && index < length - 1) {
//       inputs.current[index + 1]?.focus();
//     }

//     // When filled
//     if (newValue.length === length && !newValue.includes('')) {
//       onCodeFilled?.(newValue);
//     }
//   };

//   const handleKeyPress = (
//     event: NativeSyntheticEvent<TextInputKeyPressEventData>,
//     index: number
//   ) => {
//     if (event.nativeEvent.key === 'Backspace') {
//       const chars = value.split('');

//       if (!chars[index] && index > 0) {
//         chars[index - 1] = '';
//         onChangeText(chars.join(''));
//         inputs.current[index - 1]?.focus();
//       } else {
//         chars[index] = '';
//         onChangeText(chars.join(''));
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {Array.from({ length }).map((_, index) => (
//         <TextInput
//           key={index}
//           ref={ref => (inputs.current[index] = ref)}
//           style={[styles.input, {color: Colors.textColor}]}
//           keyboardType="number-pad"
//           maxLength={1}
//           value={value[index] ?? ''}
//           onChangeText={(text) => handleChange(text, index)}
//           onKeyPress={(e) => handleKeyPress(e, index)}
//         />
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignSelf: 'center',
//     gap: 8,
//   },
//   input: {
//     width: 45,
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#999',
//     borderRadius: 10,
//     textAlign: 'center',
//     fontSize: 24,
//   },
// });

// export default OtpInput;

import { useAppTheme } from '@/hooks/themeHook';
import { hapticFeedback } from '@/utils/haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  onCodeFilled?: (code: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChangeText,
  onCodeFilled,
  error = false,
  disabled = false,
}) => {
  const inputs = useRef<Array<TextInput | null>>([]);
  const { Colors } = useAppTheme();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Animated values for each input
  const scales = useRef(
    Array.from({ length }, () => useSharedValue(1)),
  ).current;

  // Auto-focus based on value change
  useEffect(() => {
    if (disabled) return;

    const chars = value.split('');
    const firstEmpty = chars.findIndex(c => c === '');

    if (firstEmpty !== -1 && inputs.current[firstEmpty]) {
      inputs.current[firstEmpty]?.focus();
    } else if (value.length === length) {
      // All filled, dismiss keyboard
      Keyboard.dismiss();
      hapticFeedback('notificationSuccess');
    }
  }, [value, length, disabled]);

  // Handle paste event
  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    // Handle paste of multiple characters
    if (text.length > 1) {
      // Clean the pasted text (remove non-digits)
      const cleanText = text.replace(/[^0-9]/g, '').slice(0, length);
      onChangeText(cleanText);

      // Focus appropriate input after paste
      const nextIndex = Math.min(cleanText.length, length - 1);
      setTimeout(() => {
        inputs.current[nextIndex]?.focus();
      }, 50);

      // Animate all filled boxes
      cleanText.split('').forEach((_, idx) => {
        scales[idx].value = withSequence(
          withSpring(1.1, { damping: 10 }),
          withSpring(1, { damping: 10 }),
        );
      });

      hapticFeedback('impactMedium');

      // Check if complete
      if (cleanText.length === length) {
        onCodeFilled?.(cleanText);
      }

      return;
    }

    // Handle single character input
    const chars = value.split('');
    chars[index] = text;
    const newValue = chars.join('');
    onChangeText(newValue);

    // Animate current box
    scales[index].value = withSequence(
      withSpring(1.15, { damping: 10 }),
      withSpring(1, { damping: 10 }),
    );

    // Move to next input
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
      hapticFeedback('impactLight');
    }

    // When filled
    if (newValue.length === length && !newValue.includes('')) {
      onCodeFilled?.(newValue);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (disabled) return;

    if (event.nativeEvent.key === 'Backspace') {
      const chars = value.split('');

      if (!chars[index] && index > 0) {
        // Current is empty, delete previous
        chars[index - 1] = '';
        onChangeText(chars.join(''));
        inputs.current[index - 1]?.focus();
      } else {
        // Delete current
        chars[index] = '';
        onChangeText(chars.join(''));
      }

      // Animate on delete
      scales[index].value = withSequence(
        withSpring(0.9, { damping: 10 }),
        withSpring(1, { damping: 10 }),
      );

      hapticFeedback('impactLight');
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    scales[index].value = withSpring(1.05, { damping: 10 });
  };

  const handleBlur = (index: number) => {
    setFocusedIndex(-1);
    scales[index].value = withSpring(1, { damping: 10 });
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const isFilled = value[index];
          const isFocused = focusedIndex === index;
          const hasError = error;

          const borderColor = interpolateColor(
            isFocused ? 1 : 0,
            [0, 1],
            [
              hasError
                ? '#FF5252'
                : isFilled
                ? Colors.primaryColor || '#1857C1'
                : '#E2E8F0',
              Colors.primaryColor || '#1857C1',
            ],
          );

          const backgroundColor = interpolateColor(
            isFilled ? 1 : 0,
            [0, 1],
            ['transparent', `${Colors.primaryColor || '#1857C1'}08`],
          );

          return {
            transform: [{ scale: scales[index].value }],
            borderColor,
            backgroundColor,
            borderWidth: isFocused ? 2.5 : 1.5,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[styles.inputWrapper, animatedStyle]}
          >
            <TextInput
              ref={ref => (inputs.current[index] = ref)}
              style={[
                styles.input,
                {
                  color: Colors.textColor || '#2D3748',
                },
              ]}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1} // Allow paste in first input
              value={value[index] ?? ''}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              onBlur={() => handleBlur(index)}
              editable={!disabled}
              selectTextOnFocus
              textContentType="oneTimeCode" // iOS autofill support
              autoComplete="sms-otp" // Android autofill support
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    width: 52,
    height: 60,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default OtpInput;
