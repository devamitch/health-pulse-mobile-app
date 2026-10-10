import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks/themeHook';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: any;
  scale?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  scale = 1,
}) => {
  const { Colors, DEffect } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale, { damping: 12, stiffness: 100 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: Colors.secondaryColor,
            ...DEffect,
          },
        ]}
        onPress={onPress}
      >
        <Image source={icon} style={styles.fabIcon} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 100,
    alignSelf: 'flex-end',
    alignContent: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 10,
  },
  fabIcon: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
    alignSelf: 'center',
  },
});
