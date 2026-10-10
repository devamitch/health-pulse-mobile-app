import { useEffect } from 'react';
import {
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Spring animation configurations for natural header behavior
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

export const useHeaderAnimation = (
  scrollY: SharedValue<number>,
  options: {
    scrollThreshold: number;
    collapsedHeight: number;
    expandedHeight: number;
    insetTop: number;
  },
) => {
  const headerHeight = useSharedValue(
    options.expandedHeight + options.insetTop,
  );
  const headerBorderRadius = useSharedValue(8);
  const contentOpacity = useSharedValue(0);
  const titleFontSize = useSharedValue(20);

  useAnimatedReaction(
    () => scrollY.value,
    currentScrollY => {
      const isCollapsed = currentScrollY > options.scrollThreshold;

      // Animate height
      const newHeight = isCollapsed
        ? options.collapsedHeight + options.insetTop
        : options.expandedHeight + options.insetTop;
      headerHeight.value = withSpring(newHeight, SPRING_CONFIG);

      // Animate border radius
      const newBorderRadius = isCollapsed ? 0 : 30;
      headerBorderRadius.value = withSpring(newBorderRadius, SPRING_CONFIG);

      // Animate content opacity
      const newContentOpacity = isCollapsed ? 0 : 1;
      contentOpacity.value = withSpring(newContentOpacity, SPRING_CONFIG);

      // Animate title font size
      const newTitleFontSize = isCollapsed ? 19 : 20;
      titleFontSize.value = withSpring(newTitleFontSize, SPRING_CONFIG);
    },
  );

  const headerStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
    borderBottomRightRadius: headerBorderRadius.value,
    borderBottomLeftRadius: headerBorderRadius.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: titleFontSize.value,
  }));

  return { headerStyle, contentStyle, titleStyle };
};

export const usePulseAnimation = (enabled: boolean) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (enabled) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 2000 }),
          withTiming(1, { duration: 2000 }),
        ),
        -1,
        true,
      );
    }
  }, [enabled]);

  const pulseStyle = useAnimatedStyle(() => {
    const opacity = enabled ? interpolate(pulse.value, [0, 1], [0.98, 1]) : 1;
    return { opacity };
  });

  return { pulseStyle };
};
