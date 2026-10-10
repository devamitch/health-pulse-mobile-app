'use client';

import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type React from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import ChatSparkIcon from './ChatSparkIcon';

interface ActionSparkIconProps {
  size?: number;
  color?: string;
  onOptionPress?: (option: string) => void;
  useSparkIcon?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ActionSparkIcon: React.FC<ActionSparkIconProps> = ({
  size = 56,
  color = '#FE568D',
  onOptionPress,
  useSparkIcon = true,
  isOpen = false,
  onToggle,
}) => {
  const rotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withSpring(isOpen ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isOpen]);

  const animatedRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePress = () => {
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );

    onToggle?.();
  };

  return (
    <Animated.View style={animatedScaleStyle}>
      <Pressable
        style={[
          styles.fab,
          { width: size, height: size, backgroundColor: color },
        ]}
        onPress={handlePress}
      >
        <Animated.View style={animatedRotationStyle}>
          {useSparkIcon ? (
            <ChatSparkIcon
              width={size * 0.5}
              height={size * 0.5}
              color="white"
            />
          ) : (
            <Svg
              width={size * 0.5}
              height={size * 0.5}
              viewBox="0 0 24 24"
              fill="none"
            >
              <Path
                d="M12 5v14m7-7H5"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

// import { PlusSignSquareIcon } from '@hugeicons-pro/core-stroke-rounded';

export function ActionSparkIcon2({
  size = 56,
  color = '#FE568D',
}: ActionSparkIconProps) {
  return (
    <HugeiconsIcon
      icon={PlusSignIcon}
      size={size}
      color={color}
      strokeWidth={1.5}
    />
  );
}
