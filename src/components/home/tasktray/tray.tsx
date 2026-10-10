import { sortQuestsByNearestTime } from '@/utils/gamification/task-sorter';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { TaskCardData } from '../types';
import CollapsedTaskView from './CollapsedTaskView';
import ExpandedScreenModal from './ExpandedScreenModal';
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

const TaskTray: React.FC<TaskTrayProps> = ({
  data,
  onCardPress,
  onTaskSwipe,
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
}) => {
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
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

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

      <ExpandedScreenModal
        visible={isModalVisible}
        onClose={handleModalClose}
        userData={userData}
        onNotificationPress={onNotificationPress}
        onProfilePress={onProfilePress}
        truncateUsername={truncateUsername}
      />
    </>
  );
};

export default TaskTray;
