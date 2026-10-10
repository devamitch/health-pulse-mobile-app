import { useAppTheme } from '@/hooks/themeHook';
import { sortQuestsByNearestTime } from '@/utils/gamification/task-sorter';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import CollapsedTaskView from './CollapsedTaskView';
import ExpandedTaskView from './ExpandedTaskView';
import { getCollapsedCard } from './taskTrayUtils';
import { useTaskTrayGestures } from './useTaskTrayGestures';

interface TaskTrayProps {
  data: TaskCardData[];
  onCardPress?: (card: TaskCardData, index: number) => void;
  onTaskSwipe?: (card: TaskCardData) => void;
  userData: any;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  truncateUsername: (name: string) => string;
  navigation?: any;
}

const HEADER_BASE_HEIGHT = 200;

const TaskTray: React.FC<TaskTrayProps> = ({
  data,
  onCardPress,
  onTaskSwipe,
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
}) => {
  const insets = useSafeAreaInsets();
  const [containerLayout, setContainerLayout] = useState({ y: 0 });
  const { Colors } = useAppTheme();

  const triggerCardPress = useCallback(
    (card: TaskCardData, index: number) => {
      onCardPress?.(card, index);
    },
    [onCardPress],
  );

  const collapsedCard = getCollapsedCard(sortQuestsByNearestTime(data));

  const {
    isExpanded,
    expandProgress,
    collapsedTranslateY,
    scale,
    collapsedPanGesture,
    expandedPanGesture,
    collapse,
    setExpandedState,
  } = useTaskTrayGestures(triggerCardPress, collapsedCard);

  // Calculate header height dynamically
  const headerHeight =
    containerLayout.y > 0 ? containerLayout.y : HEADER_BASE_HEIGHT + insets.top;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    setContainerLayout({ y });
  }, []);

  const handleCardPress = useCallback(
    (card: TaskCardData, index: number) => {
      // Collapse animation then trigger card press
      expandProgress.value = withTiming(0, { duration: 250 });
      collapsedTranslateY.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
      });
      scale.value = withSpring(1, { damping: 20, stiffness: 90 }, finished => {
        if (finished) {
          runOnJS(setExpandedState)(false);
          runOnJS(triggerCardPress)(card, index);
        }
      });
    },
    [
      expandProgress,
      collapsedTranslateY,
      scale,
      setExpandedState,
      triggerCardPress,
    ],
  );

  // FIXED: Use Simultaneous instead of Race for better tap handling
  const collapsedCombinedGesture = Gesture.Simultaneous(
    collapsedPanGesture,
    Gesture.Tap()
      .enabled(!isExpanded)
      .maxDuration(250)
      .onEnd(() => {
        if (!isExpanded) {
          runOnJS(triggerCardPress)(collapsedCard, 0);
        }
      }),
  );

  if (!collapsedCard) {
    return null;
  }

  return (
    <>
      <CollapsedTaskView
        card={collapsedCard}
        collapsedCombinedGesture={collapsedCombinedGesture}
        panGesture={collapsedPanGesture}
        scale={scale}
        collapsedTranslateY={collapsedTranslateY}
        expandProgress={expandProgress}
        isExpanded={isExpanded}
        onSwipeLeft={onTaskSwipe}
        onLayout={handleLayout}
      />
      <ExpandedTaskView
        isExpanded={isExpanded}
        data={data}
        panGesture={expandedPanGesture}
        expandProgress={expandProgress}
        headerHeight={headerHeight}
        onClose={collapse}
        onCardPress={handleCardPress}
        onSwipeLeft={onTaskSwipe}
        {...{
          userData,
          onNotificationPress,
          onProfilePress,
          truncateUsername,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});

export default TaskTray;
