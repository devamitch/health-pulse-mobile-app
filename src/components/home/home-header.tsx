import { FONT_FAMILIES } from '@/constants/typography';
import useGameProgression from '@/hooks/useGameProgression';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { sortTasksByNearestTime } from '@/utils/gamification/task-sorter';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Task, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuestCompletedModal } from '../modals/quest_completed_modal';
import HomeContent from './tasktray/home-content';
import TaskTrayCard from './tasktray/task-tray-card';

interface HomeHeaderProps {
  userData: any;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  truncateUsername: (name: string) => string;
  navigation?: any;
}

const HEADER_BASE_HEIGHT = 220;

const HomeHeader: React.FC<HomeHeaderProps> = ({
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { tasks, handleTaskPress } = useGameProgression();
  const dispatch = useAppDispatch();

  const { userProfile } = useAppSelector(state => state.gameProgression);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    questName: '',
    questType: 'activity' as 'activity' | 'diet' | 'stress',
    xpGained: 0,
  });
  // Segregate tasks by category and get latest incomplete task for each
  const categorizedTasks = useMemo(() => {
    const activityTasks = sortTasksByNearestTime(
      tasks.filter(task => task.category === 'activity' && !task.isDone),
    );
    const dietTasks = sortTasksByNearestTime(
      tasks.filter(task => task.category === 'diet' && !task.isDone),
    );
    const stressTasks = sortTasksByNearestTime(
      tasks.filter(task => task.category === 'stress' && !task.isDone),
    );

    return {
      activity: activityTasks[0] || null,
      diet: dietTasks[0] || null,
      stress: stressTasks[0] || null,
      allActivity: activityTasks,
      allDiet: dietTasks,
      allStress: stressTasks,
    };
  }, [tasks]);

  const handleTaskCompleteWithModal = useCallback(
    (task: Omit<Task, 'icon'>) => {
      // Mark task as complete
      try {
        let questType: 'activity' | 'diet' | 'stress' = 'activity';
        if (task.title === 'Diet Quest') questType = 'diet';
        else if (task.title === 'Calm Quest') questType = 'stress';

        // Set completion data and show modal
        setCompletionData({
          questName: task.title || task.title || 'any',
          questType,
          xpGained: task.coins || 20,
        });

        setShowCompletedModal(true);
        try {
          handleTaskPress(task);
        } catch {}
      } catch {}

      // Determine quest type from card title
    },
    [handleTaskPress],
  );

  const handleModalClose = useCallback(() => {
    setShowCompletedModal(false);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View
          style={[
            styles.headerBackground,
            {
              height: HEADER_BASE_HEIGHT,
              backgroundColor: '#1857C1',
              paddingTop: insets.top,
            },
          ]}
        />

        <HomeContent
          {...{
            userData,
            onNotificationPress,
            onProfilePress,
            truncateUsername,
            navigation,
          }}
        />
      </View>
      <TaskTrayCard
        navigation={navigation}
        categorizedTasks={categorizedTasks}
        onTaskComplete={task => handleTaskCompleteWithModal(task)}
        {...{
          userData,
          onNotificationPress,
          onProfilePress,
          truncateUsername,
        }}
      />
      <QuestCompletedModal
        visible={showCompletedModal}
        onClose={handleModalClose}
        questName={completionData.questName}
        questType={completionData.questType}
        xpGained={completionData.xpGained}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mainContent: {
    width: '100%',
    zIndex: 2, // Above background, below expanded tray
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    letterSpacing: -0.5,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeText: {
    color: '#FAFAFA',
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  headerCardsContainer: {
    width: '100%',
    marginBottom: 16,
    zIndex: 2,
  },
  RoadMapButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFEB71',
    borderRadius: 22.5,
    width: 45,
    height: 45,
    justifyContent: 'center',
  },
});

export default HomeHeader;
