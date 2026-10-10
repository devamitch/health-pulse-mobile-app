import { sortQuestsByNearestTime } from '@/utils/gamification/task-sorter';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import CollapsedTaskView from './CollapsedTaskView';
import { getCollapsedCard } from './taskTrayUtils';

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [containerLayout, setContainerLayout] = useState({ y: 0 });

  const navigation = useNavigation();
  const collapsedCard = getCollapsedCard(sortQuestsByNearestTime(data));

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    setContainerLayout({ y });
  }, []);

  const handleCollapsedTap = useCallback(() => {
    // Tap to navigate - trigger card press on the collapsed card
    onCardPress?.(collapsedCard, 0);
  }, [collapsedCard, onCardPress]);

  const handleCollapsedSwipeDown = useCallback(() => {
    // Swipe down to open modal
    setIsModalVisible(true);
    navigation.navigate('TasksView');
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleCardPress = useCallback(
    (card: TaskCardData, index: number) => {
      // Close modal first
      setIsModalVisible(false);
      // Then trigger card press
      setTimeout(() => {
        onCardPress?.(card, index);
      }, 300);
    },
    [onCardPress],
  );

  if (!collapsedCard) {
    return null;
  }

  return (
    <>
      {/* Collapsed Card - Tap to navigate, Swipe down to open modal */}
      <CollapsedTaskView
        card={collapsedCard}
        onPress={handleCollapsedTap}
        onSwipeDown={handleCollapsedSwipeDown}
        onSwipeLeft={onTaskSwipe}
        onLayout={handleLayout}
      />

      {/* Modal with Expance Card */}
    </>
  );
};

export default TaskTray;
