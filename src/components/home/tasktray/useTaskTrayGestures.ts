import { useCallback, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TaskCardData } from '../types';

const SWIPE_THRESHOLD = 40; // Reduced for easier swiping
const VELOCITY_THRESHOLD = 400; // Reduced for easier swiping

const ANIMATION_CONFIG = {
  damping: 25,
  stiffness: 120,
};

export const useTaskTrayGestures = (
  triggerCardPress?: (card: TaskCardData, index: number) => void,
  collapsedCard?: TaskCardData,
) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandProgress = useSharedValue(0);
  const collapsedTranslateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const expandedTranslateY = useSharedValue(0);

  const setExpandedState = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  const collapsedTapGesture = (index: number) =>
    Gesture.Tap()
      .enabled(!isExpanded)
      .onEnd(() => {
        if (triggerCardPress && collapsedCard) {
          runOnJS(triggerCardPress)(collapsedCard, index);
        }
      });

  const collapsedPanGesture = Gesture.Pan()
    .enabled(!isExpanded)
    .onUpdate(event => {
      if (event.translationY > 0) {
        const progress = Math.min(event.translationY / 150, 1);
        collapsedTranslateY.value = event.translationY * 0.3;
        expandProgress.value = progress * 0.5;
        scale.value = 1 - progress * 0.02;
      }
    })
    .onEnd(event => {
      if (
        event.translationY > SWIPE_THRESHOLD ||
        event.velocityY > VELOCITY_THRESHOLD
      ) {
        runOnJS(setExpandedState)(true);
        collapsedTranslateY.value = withSpring(0, ANIMATION_CONFIG);
        expandProgress.value = withTiming(1, { duration: 350 });
        scale.value = withSpring(1, { damping: 20, stiffness: 90 });
      } else {
        collapsedTranslateY.value = withSpring(0, ANIMATION_CONFIG);
        expandProgress.value = withTiming(0, { duration: 250 });
        scale.value = withSpring(1, { damping: 20, stiffness: 90 });
      }
    });

  // FIXED: Smart expanded pan gesture - works on cards too!
  const expandedPanGesture = Gesture.Pan()
    .enabled(isExpanded)
    .minDistance(10) // Slightly higher to avoid conflicts with taps
    .activeOffsetX([-15, 15]) // Horizontal swipes activate easily
    .activeOffsetY([-20, 20]) // Vertical needs more movement (allows scrolling)
    .failOffsetY([-80, 80]) // But don't fail on large vertical movements
    .onUpdate(event => {
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);

      // Prioritize horizontal swipes OR fast swipes in any direction
      const isHorizontalDominant = absX > absY * 0.5; // Even 50% horizontal triggers
      const isFastSwipe =
        Math.abs(event.velocityY) > 500 || Math.abs(event.velocityX) > 500;

      if (isHorizontalDominant || isFastSwipe || absY > 30) {
        expandedTranslateY.value = event.translationY;

        // Calculate progress based on swipe distance
        const progress = Math.max(
          0,
          Math.min(1, 1 - Math.abs(event.translationY) / 100),
        );
        expandProgress.value = progress;
      }
    })
    .onEnd(event => {
      const absTranslation = Math.abs(event.translationY);
      const absVelocity = Math.abs(event.velocityY);
      const absXTranslation = Math.abs(event.translationX);
      const absXVelocity = Math.abs(event.velocityX);

      // Collapse conditions:
      // 1. Fast swipe in any direction
      // 2. Decent distance in any direction
      // 3. Any horizontal swipe
      const shouldCollapse =
        absVelocity > VELOCITY_THRESHOLD ||
        absXVelocity > VELOCITY_THRESHOLD ||
        absTranslation > SWIPE_THRESHOLD ||
        absXTranslation > 30; // Even small horizontal swipes work

      if (shouldCollapse) {
        // Collapse animation
        expandProgress.value = withTiming(0, { duration: 250 });
        expandedTranslateY.value = withTiming(0, { duration: 250 });
        collapsedTranslateY.value = withSpring(0, ANIMATION_CONFIG);
        scale.value = withSpring(
          1,
          { damping: 20, stiffness: 90 },
          finished => {
            if (finished) {
              runOnJS(setExpandedState)(false);
            }
          },
        );
      } else {
        // Spring back to expanded state
        expandProgress.value = withTiming(1, { duration: 200 });
        expandedTranslateY.value = withSpring(0, ANIMATION_CONFIG);
      }
    });

  const collapsedGesture = (index: number) =>
    Gesture.Exclusive(collapsedPanGesture, collapsedTapGesture(index));

  const collapse = useCallback(() => {
    expandProgress.value = withTiming(0, { duration: 250 });
    collapsedTranslateY.value = withSpring(0, ANIMATION_CONFIG);
    expandedTranslateY.value = withTiming(0, { duration: 250 });
    scale.value = withSpring(1, { damping: 20, stiffness: 90 }, finished => {
      if (finished) {
        runOnJS(setExpandedState)(false);
      }
    });
  }, [
    expandProgress,
    collapsedTranslateY,
    expandedTranslateY,
    scale,
    setExpandedState,
  ]);

  return {
    isExpanded,
    expandProgress,
    collapsedTranslateY,
    expandedTranslateY,
    scale,
    collapsedPanGesture,
    expandedPanGesture,
    collapse,
    setExpandedState,
    collapsedTapGesture,
    collapsedGesture,
  };
};
