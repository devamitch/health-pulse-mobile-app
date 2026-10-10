import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  logUserTask,
  setGenerationDate,
  setTodaysTasks,
  unlogUserTask,
} from '@/services/mmkv-redux/slices/game_engine_slice';
import { CelebrationEvent, Reward } from '@/systems/gamificationEngine';
import { generateDailyTasksWithClaude } from '@/utils/gamification/game-plan-generator';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlanScreen } from './use-plan-generation';

interface Task {
  title: string;
  icon: string;
  coins: number;
  color: string;
  category: 'activity' | 'diet' | 'stress';
  id: string;
  isDone: boolean;
}

const badgeReward = (value: string, label: string): Reward => ({
  type: 'badge',
  value,
  label,
});

const titleReward = (value: string, label: string): Reward => ({
  type: 'title',
  value,
  label,
});

const animationReward = (value: string, label: string): Reward => ({
  type: 'animation',
  value,
  label,
});

const createCelebration = (event: CelebrationEvent) => event;

const useGameEngine = () => {
  const gameProfile = useAppSelector(state => state.gameProgression);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const tasks = useMemo(() => {
    const todaysTasks = gameProfile.tasks ? [...gameProfile.tasks] : [];
    return todaysTasks;
  }, [gameProfile.tasks]); // More specific dependency

  const date = useMemo(() => moment().format('YYYY-MM-DD'), []);

  const userLevelInfo = useMemo(
    () => [...(gameProfile.levelInfo ?? []), gameProfile.userProfile],
    [gameProfile.levelInfo, gameProfile.userProfile],
  );

  const [quickFeedback, setQuickFeedback] = useState<{
    visible: boolean;
    message: string;
    emoji?: string;
    xpEarned?: number;
  } | null>(null);

  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);

  const {
    loading: isPlanLoading,
    superFoodsList,
    activitesList,
  } = usePlanScreen({});

  const dietProgress = useMemo(() => {
    const done = tasks
      ?.filter(i => i.category === 'diet')
      ?.filter(i => i.isDone)?.length;

    const total = tasks?.filter(i => i.category === 'diet')?.length;
    return total > 0 ? done / total : 0;
  }, [tasks]);

  // const dietProgress = useMemo(() => {
  //   const scored = gameProfile.today.scores.diet;
  //   const overall = gameProfile.today.targets.diet;
  //   return overall > 0 ? scored / overall : 0;
  // }, [gameProfile.today.scores.diet, gameProfile.today.targets.diet]);

  const activityProgress = useMemo(() => {
    const done = tasks
      ?.filter(i => i.category === 'activity')
      ?.filter(i => i.isDone)?.length;

    const total = tasks?.filter(i => i.category === 'activity')?.length;
    return total > 0 ? done / total : 0;
  }, [tasks]);
  // const activityProgress = useMemo(() => {
  //   const scored = gameProfile.today.scores.activity;
  //   const overall = gameProfile.today.targets.activity;
  //   return overall > 0 ? scored / overall : 0;
  // }, [gameProfile.today.scores.activity, gameProfile.today.targets.activity]);

  const stressProgress = useMemo(() => {
    const done = tasks
      ?.filter(i => i.category === 'stress')
      ?.filter(i => i.isDone)?.length;

    const total = tasks?.filter(i => i.category === 'stress')?.length;
    return total > 0 ? done / total : 0;
  }, [tasks]);
  // const stressProgress = useMemo(() => {
  //   const scored = gameProfile.today.scores.stress;
  //   const overall = gameProfile.today.targets.stress;
  //   return overall > 0 ? scored / overall : 0;
  // }, [gameProfile.today.scores.stress, gameProfile.today.targets.stress]);

  const superFoodCount = useMemo(
    () =>
      superFoodsList
        .map(i => i.routine_items.length)
        .reduce((a, b) => a + b, 0),
    [superFoodsList],
  );

  const activityCount = useMemo(
    () =>
      activitesList.map(i => i.routine_items.length).reduce((a, b) => a + b, 0),
    [activitesList],
  );

  const dietTaskCompleted = useMemo(() => {
    let count = 0;
    superFoodsList.forEach(e =>
      e.routine_items.forEach(i => i.checked && count++),
    );
    return count;
  }, [superFoodsList]);

  const activityTaskCompleted = useMemo(() => {
    let count = 0;
    activitesList.forEach(e =>
      e.routine_items.forEach(i => i.checked && count++),
    );
    return count;
  }, [activitesList]);

  const totalTaskCount = useMemo(
    () => superFoodCount + activityCount,
    [superFoodCount, activityCount],
  );

  const totalCompletedTasks = useMemo(
    () => dietTaskCompleted + activityTaskCompleted,
    [dietTaskCompleted, activityTaskCompleted],
  );

  const completedDietTasks = useMemo(
    () =>
      gameProfile.today.logs.filter(
        item => item.category === 'diet' && item.points >= 20,
      ),
    [gameProfile.today.logs],
  );

  const completedActivityTasks = useMemo(
    () =>
      gameProfile.today.logs.filter(
        item => item.category === 'activity' && item.points >= 20,
      ),
    [gameProfile.today.logs],
  );

  const completedStressTasks = useMemo(
    () =>
      gameProfile.today.logs.filter(
        item => item.category === 'stress' && item.points >= 20,
      ),
    [gameProfile.today.logs],
  );

  const handleTaskLongPress = useCallback(
    (id: string) => {
      dispatch(unlogUserTask({ id }));
    },
    [dispatch],
  );

  const handleTaskPress = useCallback(
    (task: Omit<Task, 'icon'>) => {
      const currentPoints =
        gameProfile.today.logs.find(log => log.id === task.id)?.points ?? 0;

      dispatch(unlogUserTask({ id: task.id }));

      dispatch(
        logUserTask({
          ...task,
          id: task.id,
          type: task.title,
          category: task.category,
          points: task.coins + currentPoints,
          isDone: true,
          completed: true,
        }),
      );

      setQuickFeedback({
        visible: true,
        message: 'Task completed!',
        emoji: '🔥',
      });

      setCelebrations(prev => [
        ...prev,
        createCelebration({
          type: 'achievement',
          title: `${task.category} Task Completed!`,
          message: `You completed "${task.title}"`,
          icon: '✅',
          rewards: [badgeReward('task_starter', 'Task Starter')],
          animation: 'sparkles',
          sound: 'success',
        }),
      ]);
    },
    [dispatch, gameProfile.today.logs],
  );

  const prevProgressRef = useRef({
    diet: 0,
    activity: 0,
    stress: 0,
    perfectDay: false,
  });

  // and batch state updates to prevent multiple re-renders
  useEffect(() => {
    const prev = prevProgressRef.current;
    const newCelebrations: CelebrationEvent[] = [];

    // Check diet progress
    if (dietProgress >= 1 && prev.diet < 1) {
      newCelebrations.push(
        createCelebration({
          type: 'milestone',
          title: 'Diet Goal Complete!',
          message: 'All diet tasks completed 🥗',
          icon: '🥗',
          rewards: [badgeReward('diet_master', 'Diet Master')],
          animation: 'confetti',
        }),
      );
    }

    // Check activity progress
    if (activityProgress >= 1 && prev.activity < 1) {
      newCelebrations.push(
        createCelebration({
          type: 'milestone',
          title: 'Activity Goal Complete!',
          message: 'You stayed active today 💪',
          icon: '🏃',
          rewards: [badgeReward('activity_champion', 'Activity Champion')],
          animation: 'fireworks',
        }),
      );
    }

    // Check stress progress
    if (stressProgress >= 1 && prev.stress < 1) {
      newCelebrations.push(
        createCelebration({
          type: 'milestone',
          title: 'Stress Managed!',
          message: 'Calm and consistent 🧘',
          icon: '🧘',
          rewards: [badgeReward('zen_mode', 'Zen Mode')],
          animation: 'stars',
        }),
      );
    }

    // Check perfect day
    const perfectDay =
      dietProgress >= 1 && activityProgress >= 1 && stressProgress >= 1;

    if (perfectDay && !prev.perfectDay) {
      newCelebrations.push(
        createCelebration({
          type: 'perfect_day',
          title: 'Perfect Day!',
          message: 'Every goal achieved today 🌈',
          icon: '🌈',
          rewards: [
            titleReward('Perfect Day Hero', 'New Title Unlocked'),
            animationReward('rainbow', 'Rainbow Celebration'),
          ],
          animation: 'rainbow',
          sound: 'perfect_day',
        }),
      );
    }

    // Single state update with all new celebrations
    if (newCelebrations.length > 0) {
      setCelebrations(prev => [...prev, ...newCelebrations]);
    }

    // Update ref only after processing
    prevProgressRef.current = {
      diet: dietProgress,
      activity: activityProgress,
      stress: stressProgress,
      perfectDay,
    };
  }, [dietProgress, activityProgress, stressProgress]);

  const dismissQuickFeedback = useCallback(() => {
    setQuickFeedback(null);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrations(prev => prev.slice(1));
  }, []);

  const generateTasks = useCallback(async () => {
    try {
      const newTasks = await generateDailyTasksWithClaude(gameProfile);
      dispatch(setTodaysTasks(newTasks));
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  }, [gameProfile, dispatch]);

  useEffect(() => {
    const tasksDate = gameProfile.tasksGeneratedAt;
    if (tasksDate !== date) {
      setLoading(true);
      generateTasks().finally(() => {
        dispatch(setGenerationDate(date));
        setLoading(false);
      });
    }
  }, [gameProfile.tasksGeneratedAt, date, generateTasks, dispatch]);

  return {
    loading: isPlanLoading || loading,

    dietProgress,
    activityProgress,
    stressProgress,

    completedDietTasksCount: completedDietTasks.length,
    completedActivityTasksCount: completedActivityTasks.length,
    completedStressTasksCount: completedStressTasks.length,

    activityTaskCount: activityCount,
    dietTaskCount: superFoodCount,
    activityTaskCompleted,
    dietTaskCompleted,

    totalTaskCount,
    totalCompletedTasks,

    quickFeedback,
    dismissQuickFeedback,

    tasks,
    handleTaskPress,
    handleTaskLongPress,

    celebrations,
    dismissCelebration,

    userLevelInfo,
  };
};

export default useGameEngine;
