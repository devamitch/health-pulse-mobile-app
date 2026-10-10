import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { ColorScheme } from '@/constants/theme';

interface QuickFeedbackToastProps {
  visible: boolean;
  message: string;
  xpEarned?: number;
  emoji?: string;
  onHide: () => void;
  Colors: ColorScheme;
}

export const QuickFeedbackToast: React.FC<QuickFeedbackToastProps> = ({
  visible,
  message,
  xpEarned,
  emoji,
  onHide,
  Colors,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 2.5 seconds
      const timeout = setTimeout(() => {
        animateOut();
      }, 2500);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [visible]);

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const styles = createStyles(Colors);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={animateOut}
        style={styles.content}
      >
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          {xpEarned !== undefined && xpEarned > 0 && (
            <Text style={styles.xp}>+{xpEarned} XP</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      zIndex: 9999,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.isDark ? '#1E1E1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderLeftWidth: 4,
      borderLeftColor: Colors.primaryColor,
    },
    emoji: {
      fontSize: 32,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    message: {
      fontSize: 15,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginBottom: 4,
    },
    xp: {
      fontSize: 14,
      fontFamily: 'Nunito-ExtraBold',
      color: Colors.primaryColor,
    },
  });

export default QuickFeedbackToast;
