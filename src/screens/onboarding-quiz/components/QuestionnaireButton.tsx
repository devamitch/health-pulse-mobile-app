import LinearGradient from '@/components/base/LinearGradient';
import { FONT_FAMILIES } from '@/constants/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuestionnaireButtonProps {
  onPress: () => void;
  label?: React.ReactNode;
  isLastStep?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QuestionnaireButton: React.FC<QuestionnaireButtonProps> = ({
  onPress,
  label,
  isLastStep = false,
  disabled = false,
  variant = 'primary',
}) => {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.96, { damping: 10 }),
      withSpring(1),
    );
    onPress();
  };

  const buttonText = label || (isLastStep ? 'Finish' : 'Next');

  if (variant === 'secondary') {
    return (
      <View
        style={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <AnimatedTouchable
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={disabled}
          style={[
            styles.buttonWrapper,
            buttonStyle,
            disabled && styles.disabledWrapper,
          ]}
        >
          <View
            style={[styles.secondaryButton, disabled && styles.disabledButton]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                disabled && styles.disabledText,
              ]}
            >
              {buttonText}
            </Text>
          </View>
        </AnimatedTouchable>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}
    >
      <AnimatedTouchable
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={disabled}
        style={[
          styles.buttonWrapper,
          buttonStyle,
          disabled && styles.disabledWrapper,
        ]}
      >
        <LinearGradient
          colors={disabled ? ['#CCC', '#AAA'] : ['#2562cb', '#1857C1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{buttonText}</Text>
          {/* <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFF"
            style={styles.icon}
          /> */}
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  buttonWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#1857C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#1857C1',
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#1857C1',
    letterSpacing: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  icon: {
    marginLeft: 8,
  },
  disabledWrapper: {
    opacity: 0.6,
  },
  disabledButton: {
    borderColor: '#CCC',
  },
  disabledText: {
    color: '#999',
  },
});

export default QuestionnaireButton;
