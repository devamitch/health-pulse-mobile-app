'use client';

import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from './colors';

interface AIBadgeProps {
  text?: string;
  color?: string;
  backgroundColor?: string;
}

const AIBadge: React.FC<AIBadgeProps> = ({
  text = 'AI Powered',
  color = '#FFFFFF',
  backgroundColor = COLORS.primary,
}) => {
  const opacity = useSharedValue(0.7);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.7, { duration: 1000 }),
      ),
      -1,
      true,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.badge, { backgroundColor }, animatedStyle]}>
      <MaterialCommunityIcons name="brain" size={14} color={color} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default AIBadge;
