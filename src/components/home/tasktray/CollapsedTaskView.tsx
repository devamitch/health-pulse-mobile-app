import { ColorScheme, ElevationStyle } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import TaskCard from './task-card';

interface CollapsedTaskViewProps {
  card: TaskCardData;
  onPress: () => void; // Tap to navigate
  onSwipeDown: () => void; // Swipe down to open modal
  onSwipeLeft?: (card: TaskCardData) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const SWIPE_DOWN_THRESHOLD = 40;
const VELOCITY_THRESHOLD = 400;

const CollapsedTaskView: React.FC<CollapsedTaskViewProps> = ({
  card,
  onPress,
  onSwipeDown,
  onSwipeLeft,
  onLayout,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const top = useSafeAreaInsets().top + 100;

  const translateY = useSharedValue(0);
  const collapsedTranslateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const expandProgress = useSharedValue(1);

  // Pan gesture - swipe down to open modal
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      // Only track downward swipes
      if (event.translationY > 0) {
        translateY.value = event.translationY * 0.3; // Dampen movement
        scale.value = 1 - event.translationY * 0.0005; // Slight scale
      }
    })
    .onEnd(event => {
      const shouldOpen =
        event.translationY > SWIPE_DOWN_THRESHOLD ||
        event.velocityY > VELOCITY_THRESHOLD;

      if (shouldOpen) {
        // Open modal
        runOnJS(onSwipeDown)();
      }

      // Reset position
      translateY.value = withSpring(0, { damping: 20, stiffness: 120 });
      scale.value = withSpring(1, { damping: 20, stiffness: 120 });
    });

  // Tap gesture - navigate
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onPress)();
    });

  // Combined gesture - tap OR swipe
  const combinedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const stackCard1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: 0.98 },
      { translateY: collapsedTranslateY.value * 0.8 },
    ],
    opacity: interpolate(expandProgress.value, [0, 0.5, 1], [0.7, 0.4, 0]),
  }));

  // Stack card 2 animation (bottom card)
  const stackCard2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: 0.96 },
      { translateY: collapsedTranslateY.value * 0.6 },
    ],
    opacity: interpolate(expandProgress.value, [0, 0.5, 1], [0.5, 0.2, 0]),
  }));

  return (
    <View style={[styles.container, { top }]} onLayout={onLayout}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.collapsedContainer, animatedStyle]}>
          <TaskCard data={card} onSwipeLeft={() => onSwipeLeft?.(card)} />

          {/* Stack card effects */}
          <Animated.View style={[styles.stackCard, styles.stackCard1]} />
          <Animated.View style={[styles.stackCard, styles.stackCard2]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default CollapsedTaskView;

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 24,
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 101,
      flex: 1,
      ...ElevationStyle?.['3d'],
    },
    collapsedContainer: {
      width: '100%',
      position: 'relative',
    },
    stackCard: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: Colors.isDark ? Colors.surface : Colors.white,
      borderRadius: 24,
      shadowColor: Colors.isDark ? '#000' : Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Colors.isDark ? 0.15 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      zIndex: -2,
    },
    stackCard1: {
      top: -4,
      left: 4,
      right: 4,
      transform: [{ scale: 0.98 }],
      opacity: 0.6,
    },
    stackCard2: {
      top: -8,
      left: 8,
      right: 8,
      transform: [{ scale: 0.96 }],
      opacity: 0.5,
    },
  });
