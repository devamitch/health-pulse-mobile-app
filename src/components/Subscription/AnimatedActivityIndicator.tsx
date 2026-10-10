'use client';

import type React from 'react';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface AnimatedActivityIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
}

const AnimatedActivityIndicator: React.FC<AnimatedActivityIndicatorProps> = ({
  size = 'small',
  color = '#1857C1',
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const spin = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={spin}>
      <MaterialCommunityIcons
        name="loading"
        size={size === 'small' ? 20 : 30}
        color={color}
      />
    </Animated.View>
  );
};

export default AnimatedActivityIndicator;
