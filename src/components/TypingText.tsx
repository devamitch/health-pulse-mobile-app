import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface TypingTextProps {
  text: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  typingSpeed?: number;
  onComplete?: () => void;
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  containerStyle,
  textStyle,
  typingSpeed = 0,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const animationValue = useSharedValue(0);

  useEffect(() => {
    let index = 0;
    animationValue.value = withTiming(1, { duration: 500 });

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typingSpeed]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animationValue.value,
  }));

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <Text style={[styles.text, textStyle]}>{displayedText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
  },
});

export default TypingText;
