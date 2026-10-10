// components/subscription/AnimatedCard.tsx
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Spring configuration for consistent animations
const DEFAULT_SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  style?: any;
  isActive?: boolean;
  index?: number;
  swipeThreshold?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass?: number;
    overshootClamping?: boolean;
  };
  disableGestures?: boolean;
  enableRotation?: boolean;
  enableScale?: boolean;
  entranceDelay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  onLongPress,
  onSwipe,
  style,
  isActive = false,
  index = 0,
  swipeThreshold = 100,
  springConfig = DEFAULT_SPRING_CONFIG,
  disableGestures = false,
  enableRotation = true,
  enableScale = true,
  entranceDelay = 100,
}) => {
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const borderWidth = useSharedValue(isActive ? 2 : 0);
  const elevation = useSharedValue(isActive ? 10 : 5);

  // Initialize animations
  useEffect(() => {
    // Staggered entrance animation
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });

    // Initial slide-in animation
    translateX.value = 50;
    translateX.value = withDelay(
      index * entranceDelay,
      withSpring(0, springConfig),
    );

    // Initial scale animation
    scale.value = withDelay(index * entranceDelay, withSpring(1, springConfig));

    // Update border width and elevation when active state changes
    borderWidth.value = withTiming(isActive ? 2 : 0, { duration: 300 });
    elevation.value = withSpring(isActive ? 10 : 5, springConfig);

    // Apply scale effect if active and scale is enabled
    if (enableScale) {
      if (isActive) {
        scale.value = withSpring(1.03, springConfig);
      } else {
        scale.value = withSpring(1, springConfig);
      }
    }
  }, [isActive, index, enableScale, entranceDelay]);

  // Handle press in
  const handlePressIn = () => {
    if (enableScale) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  };

  // Handle press out
  const handlePressOut = () => {
    if (enableScale) {
      scale.value = withSpring(isActive ? 1.03 : 1, springConfig);
    }
    if (onPress) onPress();
  };

  // Gesture handler for 3D effect and swipe
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      context.startRotateX = rotateX.value;
      context.startRotateY = rotateY.value;
      context.startTime = Date.now();
    },
    onActive: (event, context) => {
      // Update position
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY * 0.5; // Reduce vertical movement

      // Apply 3D rotation effect if enabled
      if (enableRotation) {
        rotateY.value =
          context.startRotateY +
          interpolate(
            event.translationX,
            [-200, 0, 200],
            [10, 0, -10],
            Extrapolate.CLAMP,
          );

        rotateX.value =
          context.startRotateX +
          interpolate(
            event.translationY,
            [-200, 0, 200],
            [-10, 0, 10],
            Extrapolate.CLAMP,
          );
      }

      // Apply subtle scale effect while dragging
      if (enableScale) {
        scale.value = withTiming(0.98, { duration: 50 });
      }
    },
    onEnd: (event, context) => {
      const velocity = Math.abs(event.velocityX);
      const distance = Math.abs(event.translationX);
      const direction = event.translationX > 0 ? 'right' : 'left';
      const isQuickSwipe = velocity > 800;
      const isLongSwipe = distance > swipeThreshold;

      // Check if swipe threshold is met
      if ((isQuickSwipe || isLongSwipe) && onSwipe) {
        runOnJS(onSwipe)(direction);

        // Animate card off screen in swipe direction
        translateX.value = withTiming(direction === 'right' ? width : -width, {
          duration: 300,
        });

        // Fade out when swiped
        opacity.value = withTiming(0, { duration: 300 });
      } else {
        // Reset position with spring animation
        translateX.value = withSpring(0, springConfig);
        translateY.value = withSpring(0, springConfig);

        // Reset rotation with spring animation
        if (enableRotation) {
          rotateX.value = withSpring(0, springConfig);
          rotateY.value = withSpring(0, springConfig);
        }

        // Reset scale
        if (enableScale) {
          scale.value = withSpring(isActive ? 1.03 : 1, springConfig);
        }
      }
    },
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate shadow based on elevation
    const shadowOpacity = interpolate(
      elevation.value,
      [5, 10],
      [0.1, 0.25],
      Extrapolate.CLAMP,
    );

    const shadowRadius = interpolate(
      elevation.value,
      [5, 10],
      [12, 16],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { perspective: 1000 },
        { rotateX: enableRotation ? `${rotateX.value}deg` : '0deg' },
        { rotateY: enableRotation ? `${rotateY.value}deg` : '0deg' },
      ],
      opacity: opacity.value,
      borderWidth: borderWidth.value,
      shadowOpacity,
      shadowRadius,
      elevation: elevation.value,
    };
  });

  // Render with or without gesture handler based on disableGestures prop
  if (disableGestures) {
    return (
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          style={styles.touchable}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          style={styles.touchable}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedCard;
