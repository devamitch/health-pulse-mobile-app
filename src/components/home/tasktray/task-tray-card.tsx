import { HomeStackParamList, TaskCategory, TaskData } from '@/navigation/types';
import { logButtonTap } from '@/services/analyticsService';
import { SimplifiedTask as Task } from '@/utils/gamification/game-plan-generator';
import { Toast } from '@/utils/toast';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { TaskCardData } from '../types';
import TaskTray from './tray';

interface CategorizedTasks {
  activity: Task | null;
  diet: Task | null;
  stress: Task | null;
  allActivity: Task[];
  allDiet: Task[];
  allStress: Task[];
}

interface TaskTrayCardProps {
  navigation?: any;
  categorizedTasks?: CategorizedTasks;
  onTaskComplete?: (task: Omit<Task, 'icon'>) => void;
  userData: any;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  truncateUsername: (name: string) => string;
}

// Category to TaskType mapping
export const CATEGORY_TO_TASK_TYPE: Record<string, TaskCategory> = {
  'Activity Quest': 'activity',
  'Diet Quest': 'diet',
  'Calm Quest': 'stress',
};

// Default video URLs for each task type

// Navigation configuration that maps to ActivityScanner
export const getActivityScannerParams = (
  card: TaskCardData,
  taskType: TaskCategory,
): HomeStackParamList['ActivityScanner'] => {
  const task = card.task;

  return {
    ...task,
    taskId: task?.id || card.id,
    taskType: taskType,
    taskName: task?.title || card.title,
    duration: task?.duration || 60,
    videoUrl: task?.videoUrl,
    targetPose: task?.targetPose || undefined,
    isPremium: task?.isPremium || false,
    task: task
      ? ({
          ...task,
          id: task.id,
          title: task.title,
          category: taskType,
          description: task.description,
          duration: task.duration,
          videoUrl: task.videoUrl,
          points: task.coins || 20,
          isPremium: task.isPremium,
          coins: task.coins,
        } as TaskData)
      : undefined,
  };
};
interface CompletionData {
  questName: string;
  questType: 'diet' | 'activity' | 'stress';
  xpGained: number;
}

const TaskTrayCard: React.FC<TaskTrayCardProps> = ({
  categorizedTasks,
  onTaskComplete,
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
}) => {
  console.log('[v0] TaskTrayCard mounted');
  console.log('[v0] categorizedTasks:', categorizedTasks);

  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completionData, setCompletionData] = useState<CompletionData>({
    questName: '',
    questType: 'activity',
    xpGained: 0,
  });
  // Convert tasks to quest card format
  const questCardsData: TaskCardData[] = useMemo(() => {
    // Safety check for categorizedTasks
    if (!categorizedTasks) {
      return [];
    }

    const cards: TaskCardData[] = [];

    // Active Quest (activity category)
    const activityTask = categorizedTasks.activity;
    const allActivityDone = categorizedTasks.allActivity.length === 0;

    cards.push({
      ...activityTask,
      id: activityTask?.id || 'activity-completed',
      title: 'Activity Quest',
      subtitle: 'Ignite your energy with a short burst of movement',
      duration: allActivityDone
        ? 'All tasks completed'
        : activityTask?.title || 'No tasks available',
      buttonText: allActivityDone
        ? 'Completed!'
        : `Earn ${activityTask?.coins || 0}+ XP`,
      image: require('@/assets/images/activity-quest.png'),
      accentColor: '#C63F2C',
      category: 'power',
      task: activityTask,
      completed: allActivityDone,
    });

    // Diet Quest (diet category)
    const dietTask = categorizedTasks.diet;
    const allDietDone = categorizedTasks.allDiet.length === 0;

    cards.push({
      ...dietTask,

      id: dietTask?.id || 'diet-completed',
      title: 'Diet Quest',
      subtitle: 'Prime your system with a clean, mindful intake',
      duration: allDietDone
        ? 'All tasks completed'
        : dietTask?.title || 'No tasks available',
      buttonText: allDietDone
        ? 'Completed!'
        : `Earn ${dietTask?.coins || 0}+ XP`,
      image: require('@/assets/images/diet-quest.png'),
      accentColor: '#1E8F57',
      category: 'fuel',
      task: dietTask,
      completed: allDietDone,
    });

    // Mind Quest (stress category)
    const stressTask = categorizedTasks.stress;
    const allStressDone = categorizedTasks.allStress.length === 0;

    cards.push({
      id: stressTask?.id || 'stress-completed',
      title: 'Calm Quest',
      subtitle: 'Calm your breath for a short focus reset',
      duration: allStressDone
        ? 'All tasks completed'
        : stressTask?.title || 'No tasks available',
      buttonText: allStressDone
        ? 'Completed!'
        : `Earn ${stressTask?.coins || 0}+ XP`,
      image: require('@/assets/images/calm-quest.png'),
      accentColor: '#7C60C8',
      category: 'calm',
      task: stressTask,
      completed: allStressDone,
    });

    return cards;
  }, [categorizedTasks]);

  const handleQuestCardPress = useCallback(
    async (card: TaskCardData, index: number) => {
      console.log('[v0] Quest card pressed:', card.title);
      console.log('[v0] Card data:', card);
      console.log('[v0] Card index:', index);

      await logButtonTap(`Quest Card Pressed: ${card.title}`);

      // Skip if task is completed
      if (card.completed) {
        Toast('All tasks in this category are completed!');
        return;
      }

      // Skip if no task available
      if (!card.task) {
        Toast('No task available for this category');
        return;
      }

      // Get the task type from the card title
      const taskType = CATEGORY_TO_TASK_TYPE[card.title];

      if (!taskType) {
        console.error('Unknown card title:', card.title);
        return;
      }

      // Get navigation params for ActivityScanner
      const params = getActivityScannerParams(card, taskType);

      // Navigate to ActivityScanner with proper params
      console.log('[v0] Navigating to ActivityScanner with params:', params);

      if (navigation?.navigate) {
        navigation.navigate('ActivityScanner', params);
      } else {
        console.error('[v0] Navigation object not available');
      }
    },
    [navigation],
  );

  const handleTaskSwipe = useCallback(
    (card: TaskCardData) => {
      if (card.task && onTaskComplete) {
        onTaskComplete(card.task);

        const questType =
          card.title === 'Activity Quest'
            ? 'activity'
            : card.title === 'Diet Quest'
            ? 'diet'
            : 'stress';

        const xpGained = card.task.coins || 20;

        setCompletionData({
          questName: card.task.title || card.title,
          questType: questType,
          xpGained: xpGained,
        });

        // Show the modal
        setShowCompletedModal(true);

        // Toast.confetti(`${card.task?.title} Task marked as complete!`);
      }
    },
    [onTaskComplete],
  );

  const handleModalClose = useCallback(() => {
    setShowCompletedModal(false);
    // Optionally reset completion data
    setCompletionData({
      questName: '',
      questType: 'activity',
      xpGained: 0,
    });
  }, []);

  if (questCardsData.length === 0) {
    return null;
  }

  return (
    <>
      <TaskTray
        data={questCardsData}
        onCardPress={handleQuestCardPress}
        onTaskSwipe={handleTaskSwipe}
        {...{
          userData,
          onNotificationPress,
          onProfilePress,
          truncateUsername,
        }}
      />

      {/* <QuestCompletedModal
        visible={showCompletedModal}
        onClose={handleModalClose}
        questName={completionData.questName}
        questType={completionData.questType}
        xpGained={completionData.xpGained}
      /> */}
    </>
  );
};

export default React.memo(TaskTrayCard);
