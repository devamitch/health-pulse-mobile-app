import { useAppTheme } from '@/hooks/themeHook';
import { SendIcon } from '@/icons/chat';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';
import LoaderKit from 'react-native-loader-kit';
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BlurView from '../base/BlurView';

interface ChatInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: () => void | Promise<void>;
  onStop?: () => void | Promise<void>;
  loading?: boolean;
  streaming?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
  minHeight?: number;
  sendButtonColor?: string;
  stopButtonColor?: string;
  inputBackgroundColor?: string;
  borderColor?: string;
  focusedBorderColor?: string;
  placeholderTextColor?: string;
  textColor?: string;
  borderRadius?: number;
  elevation?: number;
  showCharacterCount?: boolean;
  maxLength?: number;
  showStopButton?: boolean;
  showSendButton?: boolean;
  enableAnimations?: boolean;
  animationDuration?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconPress?: (pointerInside: boolean) => void;
  onRightIconPress?: (pointerInside: boolean) => void;
  customSendIcon?: React.ReactNode;
  customStopIcon?: React.ReactNode;
  inputStyle?: any;
  containerStyle?: any;
  buttonStyle?: any;
  characterCountStyle?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  multiline?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  disableFullscreenUI?: boolean;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
}

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

const ChatInput: React.FC<ChatInputProps> = ({
  value = '',
  onChangeText = () => {},
  onSend = () => {},
  onStop = () => {},
  loading = false,
  streaming = false,
  placeholder = 'Ask me anything...',
  disabled = false,
  maxHeight = 150,
  minHeight = 56,
  sendButtonColor,
  stopButtonColor,
  inputBackgroundColor,
  borderColor,
  focusedBorderColor,
  placeholderTextColor,
  textColor,
  borderRadius = 40,
  elevation = 0,
  showCharacterCount = false,
  maxLength,
  showStopButton = true,
  showSendButton = true,
  enableAnimations = true,
  animationDuration = 200,
  springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  customSendIcon,
  customStopIcon,
  inputStyle,
  containerStyle,
  buttonStyle,
  characterCountStyle,
  onFocus,
  onBlur,
  onSubmitEditing,
  multiline = true,
  autoFocus = false,
  blurOnSubmit = false,
  returnKeyType = 'send',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  keyboardType = 'default',
  disableFullscreenUI = true,
  textAlignVertical = 'center',
}) => {
  const { Colors } = useAppTheme();

  // Set default colors from theme if not provided
  sendButtonColor = sendButtonColor || Colors.primaryColor;
  stopButtonColor = stopButtonColor || Colors.red;
  inputBackgroundColor = inputBackgroundColor || Colors.surface;
  borderColor = borderColor || Colors.greyColor400;
  focusedBorderColor = focusedBorderColor || Colors.primaryColor;
  placeholderTextColor = placeholderTextColor || Colors.greyColor600;
  textColor = textColor || Colors.textPrimaryColor;

  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(minHeight);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const focusAnim = useSharedValue(0);
  const borderWidthAnim = useSharedValue(1);
  const sendButtonAnim = useSharedValue(value.trim() ? 1 : 0.5);
  const stopButtonAnim = useSharedValue(0);
  const characterCountAnim = useSharedValue(0);

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();

    if (enableAnimations) {
      focusAnim.value = withTiming(1, { duration: animationDuration });
      borderWidthAnim.value = withTiming(2, { duration: animationDuration });
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();

    if (enableAnimations) {
      focusAnim.value = withTiming(0, { duration: animationDuration });
      borderWidthAnim.value = withTiming(1, { duration: animationDuration });
    }
  };

  // Handle text change
  const handleChangeText = (text: string) => {
    onChangeText(text);

    if (enableAnimations) {
      sendButtonAnim.value = withTiming(text.trim() ? 1 : 0.5, {
        duration: animationDuration,
      });

      if (showCharacterCount && maxLength) {
        characterCountAnim.value = text.length / maxLength;
      }
    }
  };

  // Handle send
  const handleSend = () => {
    if (value.trim()) {
      onSend();
      if (Platform.OS === 'ios') {
        Keyboard.dismiss();
      }
    }
  };

  // Handle key press
  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      handleSend();
    }
  };

  // Animated styles
  const borderAnimatedStyle = useAnimatedStyle(() => {
    const borderColorValue = interpolateColor(
      focusAnim.value,
      [0, 1],
      [borderColor, focusedBorderColor],
    );

    return {
      borderColor: borderColorValue,
      borderWidth: borderWidthAnim.value,
    };
  });

  const sendButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: sendButtonAnim.value,
      right: 12,
      transform: [{ scale: 1 }],
    };
  });

  const stopButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: stopButtonAnim.value,
      transform: [{ scale: stopButtonAnim.value }],
    };
  });

  const characterCountAnimatedStyle = useAnimatedStyle(() => {
    if (!showCharacterCount || !maxLength) return {};

    const color = interpolateColor(
      characterCountAnim.value,
      [0, 0.8, 1],
      [placeholderTextColor, placeholderTextColor, stopButtonColor],
    );

    return {
      color,
    };
  });

  // Update stop button animation when loading/streaming changes
  useEffect(() => {
    if (enableAnimations) {
      stopButtonAnim.value = withTiming(loading || streaming ? 1 : 0, {
        duration: animationDuration,
      });
      sendButtonAnim.value = withTiming(
        !loading && !streaming && value.trim() ? 1 : 0.5,
        { duration: animationDuration },
      );
    }
  }, [loading, streaming]);

  // Render send button
  const renderSendButton = () => {
    if (!showSendButton) return null;

    return (
      <Animated.View
        style={[styles.buttonContainer, sendButtonAnimatedStyle, buttonStyle]}
      >
        <AnimatedRectButton
          onPress={handleSend}
          enabled={!disabled && !!value.trim()}
          style={[styles.button, { opacity: value.trim() ? 1 : 0.5 }]}
        >
          <SendIcon
            color={value.trim() ? sendButtonColor : placeholderTextColor}
          />
        </AnimatedRectButton>
      </Animated.View>
    );
  };

  // Render stop button
  const renderStopButton = () => {
    if (!showStopButton || (!loading && !streaming)) return null;

    return (
      <Animated.View
        style={[styles.buttonContainer, stopButtonAnimatedStyle, buttonStyle]}
      >
        <RectButton onPress={onStop} enabled={!disabled} style={styles.button}>
          {customStopIcon || (
            <Icon name="stop" size={24} color={stopButtonColor} />
          )}
        </RectButton>
      </Animated.View>
    );
  };

  // Render character count
  const renderCharacterCount = () => {
    if (!showCharacterCount || !maxLength) return null;

    return (
      <Animated.Text
        style={[
          styles.characterCount,
          characterCountAnimatedStyle,
          characterCountStyle,
        ]}
      >
        {value.length}/{maxLength}
      </Animated.Text>
    );
  };
  const insets = useSafeAreaInsets();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GestureHandlerRootView
        style={[styles.mainContainer, { paddingBottom: insets.bottom + 15 }]}
      >
        <View
          style={[
            {
              backgroundColor: Colors.surface,

              borderRadius,
            },
            // containerStyle,
          ]}
        >
          <Animated.View
            style={[
              styles.borderView,
              // borderAnimatedStyle,
              {
                borderRadius,
                backgroundColor: inputBackgroundColor,
              },
            ]}
          >
            {/* Left Icon */}
            {leftIcon && (
              <RectButton
                onPress={
                  onLeftIconPress
                    ? pointerInside => onLeftIconPress(pointerInside)
                    : undefined
                }
                style={styles.leftIcon}
                enabled={!disabled}
              >
                {leftIcon}
              </RectButton>
            )}

            {/* Text Input */}
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: textColor,
                  // minHeight,
                  // maxHeight,
                  // paddingLeft: leftIcon ? 40 : 16,
                  // paddingRight: rightIcon ? 40 : 16,
                  textAlignVertical,
                },
                inputStyle,
              ]}
              value={value}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              multiline={multiline}
              blurOnSubmit={blurOnSubmit}
              returnKeyType={returnKeyType}
              editable={!disabled}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              autoFocus={autoFocus}
              keyboardType={keyboardType}
              disableFullscreenUI={disableFullscreenUI}
              onKeyPress={handleKeyPress}
              maxLength={maxLength}
              onContentSizeChange={({ nativeEvent }) => {
                const newHeight = Math.max(
                  minHeight,
                  Math.min(
                    maxHeight,
                    nativeEvent.contentSize.height +
                      (Platform.OS === 'ios' ? 16 : 8),
                  ),
                );

                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setInputHeight(newHeight);
              }}
            />

            {/* Right Icon */}
            {rightIcon && (
              <RectButton
                onPress={
                  onRightIconPress
                    ? pointerInside => onRightIconPress(pointerInside)
                    : undefined
                }
                style={styles.rightIcon}
                enabled={!disabled}
              >
                {rightIcon}
              </RectButton>
            )}

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              {renderCharacterCount()}
              {renderStopButton()}
              {renderSendButton()}
            </View>
          </Animated.View>
        </View>
        {loading && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={Colors.isDark ? 'dark' : 'light'}
              blurAmount={10}
            />
            <LoaderKit
              style={styles.loader}
              name={'BallPulse'}
              color={Colors.greyColor400}
            />
          </Animated.View>
        )}
      </GestureHandlerRootView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    paddingTop: 10,
    overflow: 'hidden',
  },
  container: {
    padding: 8,
  },
  borderView: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    // Note: backgroundColor is set dynamically via Colors.surface
    // overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    alignItems: 'center',
    // Note: backgroundColor is set dynamically via Colors.surface
    paddingHorizontal: 30,
    borderRadius: 100,
    paddingVertical: 15,
    overflow: 'hidden',
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    padding: 4,
  },
  rightIcon: {
    position: 'absolute',
    right: 30,
    zIndex: 1,
    padding: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonContainer: {
    marginLeft: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    marginRight: 8,
  },
  loader: {
    width: 30,
    height: 30,
  },
});

export default ChatInput;
