import { ColorScheme, ElevationStyle } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  ComposedGesture,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import TaskCard from './task-card';

interface CollapsedTaskViewProps {
  card: TaskCardData;
  panGesture: ReturnType<typeof Gesture.Pan>;
  scale: SharedValue<number>;
  collapsedTranslateY: SharedValue<number>;
  expandProgress: SharedValue<number>;
  isExpanded: boolean;
  onSwipeLeft?: (card: TaskCardData) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  collapsedCombinedGesture: ComposedGesture;
}

const CollapsedTaskView: React.FC<CollapsedTaskViewProps> = ({
  card,
  panGesture,
  scale,
  collapsedTranslateY,
  expandProgress,
  isExpanded,
  onSwipeLeft,
  onLayout,
  collapsedCombinedGesture,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);

  // Main card animation
  const collapsedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: collapsedTranslateY.value },
    ],
    // Fade out as expanded view appears
    opacity: interpolate(expandProgress.value, [0, 0.3, 1], [1, 0.5, 0]),
  }));

  // Stack card 1 animation (middle card)
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

  const top = useSafeAreaInsets().top + 100;

  // Hide collapsed view completely when expanded
  if (isExpanded) return null;

  return (
    <View style={[styles.container, { top }]} onLayout={onLayout}>
      <GestureDetector gesture={collapsedCombinedGesture}>
        <Animated.View style={[styles.collapsedContainer, collapsedCardStyle]}>
          <TaskCard data={card} onSwipeLeft={() => onSwipeLeft?.(card)} />

          {/* Stack card effects */}
          <Animated.View
            style={[styles.stackCard, styles.stackCard1, stackCard1Style]}
          />
          <Animated.View
            style={[styles.stackCard, styles.stackCard2, stackCard2Style]}
          />
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
    },
    stackCard2: {
      top: -8,
      left: 8,
      right: 8,
    },
  });
