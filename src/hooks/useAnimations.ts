// import { APP_CONFIG } from '@/config/app-config';
// import { useCallback, useEffect, useRef } from 'react';
// import {
//   Easing,
//   useAnimatedStyle,
//   useSharedValue,
//   withDelay,
//   withRepeat,
//   withSequence,
//   withSpring,
//   withTiming,
// } from 'react-native-reanimated';

// // Optimize animation performance with memoized configs
// const SPRING_CONFIG = {
//   damping: 15,
//   stiffness: 100,
//   mass: 1,
//   overshootClamping: false,
//   restDisplacementThreshold: 0.01,
//   restSpeedThreshold: 2,
// };

// const TIMING_CONFIG = {
//   duration: 300,
//   easing: Easing.bezier(0.25, 0.1, 0.25, 1),
// };

// // Fade in animation
// export const useFadeInAnimation = (
//   delay = 0,
//   duration = 800,
//   initialValue = 0,
// ) => {
//   const opacity = useSharedValue(initialValue);
//   const isAnimating = useRef(false);

//   useEffect(() => {
//     if (isAnimating.current) return;

//     isAnimating.current = true;
//     opacity.value = withDelay(
//       delay,
//       withTiming(1, {
//         duration,
//         easing: Easing.out(Easing.cubic),
//       }),
//     );

//     return () => {
//       isAnimating.current = false;
//     };
//   }, []);

//   const style = useAnimatedStyle(
//     () => ({
//       opacity: opacity.value,
//     }),
//     [],
//   );

//   return { opacity, style };
// };

// // Scale animation
// export const useScaleAnimation = (
//   delay = 0,
//   duration = 800,
//   initialScale = 0.9,
// ) => {
//   const scale = useSharedValue(initialScale);
//   const isAnimating = useRef(false);

//   useEffect(() => {
//     if (isAnimating.current) return;

//     isAnimating.current = true;
//     scale.value = withDelay(
//       delay,
//       withTiming(1, {
//         duration,
//         easing: Easing.out(Easing.cubic),
//       }),
//     );

//     return () => {
//       isAnimating.current = false;
//     };
//   }, []);

//   const style = useAnimatedStyle(
//     () => ({
//       transform: [{ scale: scale.value }],
//     }),
//     [],
//   );

//   return { scale, style };
// };

// // Slide animation
// export const useSlideAnimation = (delay = 0, duration = 800, initialY = 50) => {
//   const translateY = useSharedValue(initialY);
//   const isAnimating = useRef(false);

//   useEffect(() => {
//     if (isAnimating.current) return;

//     isAnimating.current = true;
//     translateY.value = withDelay(
//       delay,
//       withTiming(0, {
//         duration,
//         easing: Easing.out(Easing.cubic),
//       }),
//     );

//     return () => {
//       isAnimating.current = false;
//     };
//   }, []);

//   const style = useAnimatedStyle(
//     () => ({
//       transform: [{ translateY: translateY.value }],
//     }),
//     [],
//   );

//   return { translateY, style };
// };

// // Button press animation
// export const useButtonPressAnimation = () => {
//   const scale = useSharedValue(1);

//   const onPressIn = useCallback(() => {
//     scale.value = withTiming(0.95, { duration: 100 });
//   }, []);

//   const onPressOut = useCallback(() => {
//     scale.value = withTiming(1, { duration: 200 });
//   }, []);

//   const style = useAnimatedStyle(
//     () => ({
//       transform: [{ scale: scale.value }],
//     }),
//     [],
//   );

//   return { scale, style, onPressIn, onPressOut };
// };

// // Card swipe animation
// export const useCardSwipeAnimation = (index = 0) => {
//   const translateX = useSharedValue(100);
//   const opacity = useSharedValue(0);
//   const scale = useSharedValue(1);
//   const isAnimating = useRef(false);

//   useEffect(() => {
//     if (isAnimating.current) return;

//     isAnimating.current = true;
//     translateX.value = withDelay(index * 100, withSpring(0, SPRING_CONFIG));
//     opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));

//     return () => {
//       isAnimating.current = false;
//     };
//   }, [index]);

//   const handleSwipeGesture = useCallback(translationX => {
//     if (Math.abs(translationX) > 50) {
//       scale.value = withSequence(
//         withTiming(translationX > 0 ? 1.05 : 0.95, { duration: 100 }),
//         withTiming(1, { duration: 100 }),
//       );
//     }

//     translateX.value = withSpring(0, SPRING_CONFIG);
//   }, []);

//   const style = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateX: translateX.value }, { scale: scale.value }],
//       opacity: opacity.value,
//     };
//   });

//   return { translateX, opacity, scale, style, handleSwipeGesture };
// };

// // Pulse animation
// export const usePulseAnimation = (
//   minScale = 0.95,
//   maxScale = 1.05,
//   duration = 1500,
// ) => {
//   const scale = useSharedValue(1);
//   const isAnimating = useRef(false);

//   useEffect(() => {
//     if (isAnimating.current) return;

//     isAnimating.current = true;

//     // Use a more efficient animation approach for lower-end devices
//     if (APP_CONFIG.PERFORMANCE.limitAnimationFPS) {
//       // Simpler animation for better performance
//       scale.value = withRepeat(
//         withTiming(maxScale, { duration: duration }),
//         -1,
//         true,
//       );
//     } else {
//       // Full animation for capable devices
//       scale.value = withRepeat(
//         withSequence(
//           withTiming(maxScale, { duration: duration / 2 }),
//           withTiming(minScale, { duration: duration / 2 }),
//         ),
//         -1,
//         true,
//       );
//     }

//     return () => {
//       isAnimating.current = false;
//     };
//   }, []);

//   const style = useAnimatedStyle(
//     () => ({
//       transform: [{ scale: scale.value }],
//     }),
//     [],
//   );

//   return { scale, style };
// };

// hooks/useAnimations.tsx
import { APP_CONFIG } from '@/config/app-config';
import { useCallback, useEffect, useRef } from 'react';
import {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Optimize animation performance with memoized configs
export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 100,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

export const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

// Fade in animation
export const useFadeInAnimation = (
  delay = 0,
  duration = 800,
  initialValue = 0,
) => {
  const opacity = useSharedValue(initialValue);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );

    return () => {
      isAnimating.current = false;
    };
  }, [delay, duration, initialValue, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { opacity, style };
};

// Scale animation
export const useScaleAnimation = (
  delay = 0,
  duration = 800,
  initialScale = 0.9,
) => {
  const scale = useSharedValue(initialScale);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    scale.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );

    return () => {
      isAnimating.current = false;
    };
  }, [delay, duration, initialScale, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, style };
};

// Slide animation
export const useSlideAnimation = (delay = 0, duration = 800, initialY = 50) => {
  const translateY = useSharedValue(initialY);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );

    return () => {
      isAnimating.current = false;
    };
  }, [delay, duration, initialY, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { translateY, style };
};

// Button press animation
export const useButtonPressAnimation = () => {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withTiming(0.95, { duration: 100 });
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 200 });
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, style, onPressIn, onPressOut };
};

// Card swipe animation with proper gesture handler
export const useCardSwipeAnimation = (
  index = 0,
  onSwipe?: (direction: 'left' | 'right') => void,
) => {
  const translateX = useSharedValue(100);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const isAnimating = useRef(false);

  // Entry animation
  useEffect(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;

    // Animate in with delay based on index
    translateX.value = withDelay(index * 100, withSpring(0, SPRING_CONFIG));

    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));

    return () => {
      isAnimating.current = false;
    };
  }, [index, translateX, opacity]);

  // Properly typed gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      context.startTime = Date.now();
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY / 3; // Reduce vertical movement

      // Scale down slightly when dragging
      scale.value = withTiming(0.98, { duration: 100 });
    },
    onEnd: (event, context) => {
      const velocity = Math.abs(event.velocityX);
      const distance = Math.abs(event.translationX);
      const isQuickSwipe = velocity > 800;
      const isLongSwipe = distance > 100;

      if ((isQuickSwipe || isLongSwipe) && onSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(onSwipe)(direction);
      } else {
        // Return to original position with spring animation
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      }

      // Restore scale
      scale.value = withTiming(1, { duration: 200 });
    },
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return { translateX, translateY, opacity, scale, style, gestureHandler };
};

// 3D card animation with proper gesture handler
export const use3DCardAnimation = () => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isActive = useSharedValue(false);

  const onCardPress = useCallback(() => {
    isActive.value = true;
    scale.value = withSpring(1.05, {
      damping: 10,
      stiffness: 100,
    });
  }, [scale, isActive]);

  const onCardRelease = useCallback(() => {
    isActive.value = false;
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 120,
    });
  }, [scale, isActive]);

  // Properly typed gesture handler for 3D effect
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = rotateY.value;
      context.startY = rotateX.value;
    },
    onActive: (event, context) => {
      if (isActive.value) {
        // Calculate rotation based on touch position
        rotateX.value =
          context.startY +
          interpolate(
            event.translationY,
            [-200, 0, 200],
            [-15, 0, 15],
            Extrapolate.CLAMP,
          );

        rotateY.value =
          context.startX +
          interpolate(
            event.translationX,
            [-200, 0, 200],
            [15, 0, -15],
            Extrapolate.CLAMP,
          );
      }
    },
    onEnd: () => {
      // Reset rotation with spring animation
      rotateX.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });

      rotateY.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });
    },
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { scale: scale.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  });

  return {
    rotateX,
    rotateY,
    scale,
    isActive,
    style,
    onCardPress,
    onCardRelease,
    gestureHandler,
  };
};

// Pulse animation with performance optimization
export const usePulseAnimation = (
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1500,
) => {
  const scale = useSharedValue(1);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;

    // Use a more efficient animation approach for lower-end devices
    if (APP_CONFIG?.PERFORMANCE?.limitAnimationFPS) {
      // Simpler animation for better performance
      scale.value = withRepeat(
        withTiming(maxScale, { duration: duration }),
        -1,
        true,
      );
    } else {
      // Full animation for capable devices
      scale.value = withRepeat(
        withSequence(
          withTiming(maxScale, { duration: duration / 2 }),
          withTiming(minScale, { duration: duration / 2 }),
        ),
        -1,
        true,
      );
    }

    return () => {
      isAnimating.current = false;
      // Cancel animation on unmount
      scale.value = 1;
    };
  }, [minScale, maxScale, duration, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, style };
};

// Gradient animation
export const useGradientAnimation = (duration = 2000) => {
  const position = useSharedValue(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    position.value = withRepeat(withTiming(1, { duration }), -1, true);

    return () => {
      isAnimating.current = false;
      position.value = 0;
    };
  }, [duration, position]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      position.value,
      [0, 0.5, 1],
      [0.9, 1, 0.9],
      Extrapolate.CLAMP,
    ),
  }));

  return { position, style };
};

// Parallax scroll effect
export const useParallaxEffect = (scrollY: any, factor = 0.5) => {
  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scrollY.value * factor * -1 }],
    };
  });

  return { style };
};
