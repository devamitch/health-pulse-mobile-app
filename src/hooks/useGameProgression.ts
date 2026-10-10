import { usePlanScreen } from '@/hooks/use-plan-generation';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import {
  addWeeklyReport,
  clearTaskTimer,
  completeDay,
  completeTask,
  ensureTodayIsCurrent,
  failIncompleteTasks,
  gameSelectors,
  initializeAfterOnboarding,
  initializeGame,
  injectBoosterTasks,
  logBooster,
  logUserTask,
  markEveningBoosterGenerated,
  pauseTaskTimer,
  resetGame,
  resumeTaskTimer,
  setDailyTasks,
  setGenerationDate,
  setMode,
  setNextDayTasks,
  skipTask,
  startTaskTimer,
  unlogTask,
  unlogUserTask,
  updateTimerOnForeground,
} from '@/services/mmkv-redux/slices/gameProgressionSlice';

import {
  CelebrationEvent,
  GameMode,
  GameTask,
  TaskCategory,
  TaskProof,
} from '@/lib/types/game-progression.types';

import { SMART_SYSTEM } from '@/lib/constants/game-constants';
import AIValidationService from '@/services/AIValidationService';
import ReportGenerationService from '@/services/ReportGenerationService';
import TaskGenerationService from '@/services/TaskGenerationService';

// ============================================================================
// HELPER FUNCTIONS (moved outside component to prevent recreation)
// ============================================================================

const badgeReward = (value: string, label: string) => ({
  type: 'badge',
  value,
  label,
});

const titleReward = (value: string, label: string) => ({
  type: 'title',
  value,
  label,
});

const animationReward = (value: string, label: string) => ({
  type: 'animation',
  value,
  label,
});

// ============================================================================
// MAIN HOOK
// ============================================================================

const useGameProgression = () => {
  const dispatch = useAppDispatch();

  // ========== REDUX SELECTORS (memoized by Redux) ==========
  const gameProfile = useAppSelector(state => state.gameProgression);

  // Use selectors directly - they're already memoized
  const userProfile = useMemo(
    () => gameSelectors.selectUserProfile({ game: gameProfile }),
    [gameProfile],
  );

  const todaysTasks = useMemo(
    () => gameSelectors.selectTodaysTasks({ game: gameProfile }),
    [gameProfile],
  );

  const todaysScores = useMemo(
    () => gameSelectors.selectTodaysScores({ game: gameProfile }),
    [gameProfile],
  );

  const todaysMode = useMemo(
    () => gameSelectors.selectTodaysMode({ game: gameProfile }),
    [gameProfile],
  );

  const todaysLogs = useMemo(
    () => gameSelectors.selectTodaysLogs({ game: gameProfile }),
    [gameProfile],
  );

  const activeTimer = useMemo(
    () => gameSelectors.selectActiveTimer({ game: gameProfile }),
    [gameProfile],
  );

  const streakData = useMemo(
    () => gameSelectors.selectStreakData({ game: gameProfile }),
    [gameProfile],
  );

  const behaviorMetrics = useMemo(
    () => gameSelectors.selectBehaviorMetrics({ game: gameProfile }),
    [gameProfile],
  );

  const history = useMemo(
    () => gameSelectors.selectHistory({ game: gameProfile }),
    [gameProfile],
  );

  const weeklyReports = useMemo(
    () => gameSelectors.selectWeeklyReports({ game: gameProfile }),
    [gameProfile],
  );

  const levelInfo = useMemo(
    () => gameSelectors.selectLevelInfo({ game: gameProfile }),
    [gameProfile],
  );

  const todayPlan = useMemo(
    () => gameSelectors.selectTodayPlan({ game: gameProfile }),
    [gameProfile],
  );

  const tasksGeneratedDate = useMemo(
    () => gameSelectors.selectTasksGeneratedDate({ game: gameProfile }),
    [gameProfile],
  );

  const boosterCompleted = useMemo(
    () => gameSelectors.selectBoosterCompleted({ game: gameProfile }),
    [gameProfile],
  );

  const onboarding = useMemo(
    () => gameSelectors.selectOnboarding({ game: gameProfile }),
    [gameProfile],
  );

  const todayMetadata = useMemo(
    () => gameSelectors.selectTodayMetadata({ game: gameProfile }),
    [gameProfile],
  );

  // ========== LOCAL STATE ==========
  const [loading, setLoading] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<{
    visible: boolean;
    message: string;
    emoji?: string;
    xpEarned?: number;
  } | null>(null);
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);

  // ========== REFS (prevent re-creation) ==========
  const abortControllerRef = useRef<AbortController | null>(null);
  const taskGenerationInProgressRef = useRef(false);
  const prevProgressRef = useRef({
    diet: 0,
    activity: 0,
    stress: 0,
    perfectDay: false,
  });

  // ========== MEMOIZED CURRENT DATE ==========
  const date = useMemo(() => moment().format('YYYY-MM-DD'), []);

  // ========== PLAN SCREEN (with optimization) ==========
  const {
    loading: isPlanLoading,
    superFoodsList,
    activitesList,
  } = usePlanScreen({});

  // ========== MEMOIZED COMPUTED VALUES ==========

  const tasks = useMemo(() => {
    return todaysTasks.length > 0 ? todaysTasks : gameProfile.tasks || [];
  }, [todaysTasks, gameProfile.tasks]);

  const userLevelInfo = useMemo(
    () => [...(levelInfo ?? []), userProfile],
    [levelInfo, userProfile],
  );

  const dietProgress = useMemo(() => {
    const active = tasks.filter(
      i => i.category === 'diet' && (i as any).status !== 'failed',
    );
    const done = active.filter(i => i.isDone).length;
    return active.length > 0 ? done / active.length : 0;
  }, [tasks]);

  const activityProgress = useMemo(() => {
    const active = tasks.filter(
      i => i.category === 'activity' && (i as any).status !== 'failed',
    );
    const done = active.filter(i => i.isDone).length;
    return active.length > 0 ? done / active.length : 0;
  }, [tasks]);

  const stressProgress = useMemo(() => {
    const active = tasks.filter(
      i => i.category === 'stress' && (i as any).status !== 'failed',
    );
    const done = active.filter(i => i.isDone).length;
    return active.length > 0 ? done / active.length : 0;
  }, [tasks]);

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
      todaysLogs.filter(item => item.category === 'diet' && item.points >= 20),
    [todaysLogs],
  );

  const completedActivityTasks = useMemo(
    () =>
      todaysLogs.filter(
        item => item.category === 'activity' && item.points >= 20,
      ),
    [todaysLogs],
  );

  const completedStressTasks = useMemo(
    () =>
      todaysLogs.filter(
        item => item.category === 'stress' && item.points >= 20,
      ),
    [todaysLogs],
  );

  const completedTasksCount = useMemo(() => {
    return tasks.filter(t => t.isDone && (t as any).status !== 'failed').length;
  }, [tasks]);

  const pendingTasksCount = useMemo(() => {
    return tasks.filter(
      t =>
        !t.isDone &&
        (t as any).status !== 'completed' &&
        (t as any).status !== 'failed',
    ).length;
  }, [tasks]);

  const tasksByCategory = useMemo(
    () => ({
      diet: tasks.filter(
        t => t.category === 'diet' && (t as any).status !== 'failed',
      ),
      activity: tasks.filter(
        t => t.category === 'activity' && (t as any).status !== 'failed',
      ),
      stress: tasks.filter(
        t => t.category === 'stress' && (t as any).status !== 'failed',
      ),
    }),
    [tasks],
  );

  const isTimerActive = useMemo(
    () => activeTimer?.status === 'active',
    [activeTimer?.status],
  );

  const isTimerPaused = useMemo(
    () => activeTimer?.status === 'paused',
    [activeTimer?.status],
  );

  const isTimerCompleted = useMemo(
    () => activeTimer?.status === 'completed',
    [activeTimer?.status],
  );

  const timerElapsed = useMemo(() => {
    if (!activeTimer || activeTimer.status === 'idle') return 0;
    if (activeTimer.status === 'completed') return activeTimer.targetSeconds;
    const now = Date.now();
    const pauseTime =
      activeTimer.status === 'paused' && activeTimer.pausedAt
        ? now - activeTimer.pausedAt
        : 0;
    return Math.floor(
      (now - activeTimer.startedAt - activeTimer.totalPausedTime - pauseTime) /
        1000,
    );
  }, [activeTimer]);

  const timerRemaining = useMemo(() => {
    if (!activeTimer) return 0;
    return Math.max(0, activeTimer.targetSeconds - timerElapsed);
  }, [activeTimer, timerElapsed]);

  const completionRate = useMemo(() => {
    return dietProgress + activityProgress + stressProgress > 0
      ? (dietProgress + activityProgress + stressProgress) / 3
      : 0;
  }, [dietProgress, activityProgress, stressProgress]);

  // ========== STABLE CALLBACK FUNCTIONS ==========

  const handleTaskLongPress = useCallback(
    (id: string) => {
      dispatch(unlogUserTask({ id }));
    },
    [dispatch],
  );

  const handleTaskPress = useCallback(
    (task: any) => {
      if (!task) return;
      const taskId = String(task.id);
      const existingLog = todaysLogs.find(
        log => String(log.id) === taskId && log.isDone,
      );
      if (existingLog) return;

      dispatch(unlogUserTask({ id: task.id }));

      const currentPoints =
        todaysLogs.find(log => String(log.id) === taskId)?.points ?? 0;

      dispatch(
        logUserTask({
          ...task,
          id: task.id,
          type: task.title,
          category: task.category,
          points: (task.coins || task.points || 10) + currentPoints,
          isDone: true,
          completed: true,
        }),
      );

      setQuickFeedback({
        visible: true,
        message: 'Task completed!',
        emoji: '🔥',
        xpEarned: task.coins || task.points || 10,
      });

      setCelebrations(prev => [
        ...prev,
        {
          type: 'achievement',
          title: `${task.category} Task Completed!`,
          message: `You completed "${task.title}"`,
          icon: '✅',
          taskId: task.id,
          timestamp: Date.now(),
          rewards: [badgeReward('task_starter', 'Task Starter')],
          animation: 'sparkles',
          sound: 'success',
        },
      ]);
    },
    [dispatch, todaysLogs],
  );

  const finishTask = useCallback(
    (taskId: string, proof?: TaskProof) => {
      dispatch(completeTask({ taskId, proof }));
    },
    [dispatch],
  );

  const logTask = useCallback(
    (payload: any) => {
      dispatch(logUserTask(payload));
    },
    [dispatch],
  );

  const skipTaskAction = useCallback(
    (taskId: string) => {
      dispatch(skipTask(taskId));
    },
    [dispatch],
  );

  const undoTask = useCallback(
    (taskId: string | number) => {
      dispatch(unlogTask({ id: taskId }));
    },
    [dispatch],
  );

  const startTask = useCallback(
    (taskId: string, targetSeconds: number) => {
      dispatch(startTaskTimer({ taskId, targetSeconds }));
    },
    [dispatch],
  );

  const pauseTimerAction = useCallback(
    () => dispatch(pauseTaskTimer()),
    [dispatch],
  );

  const resumeTimerAction = useCallback(
    () => dispatch(resumeTaskTimer()),
    [dispatch],
  );

  const cancelTimer = useCallback(() => dispatch(clearTaskTimer()), [dispatch]);

  const validatePhoto = useCallback(
    async (taskId: string, uri: string, task: GameTask) => {
      // Create abort controller for this validation
      const abortController = new AbortController();

      try {
        const result = await AIValidationService.validatePhoto({
          uri,
          expectedCategory: task.category,
          taskDescription: task.description || '',
          taskName: task.title,
          signal: abortController.signal,
        });

        if (result.isValid) {
          dispatch(
            completeTask({
              taskId,
              proof: {
                type: 'photo',
                uri,
                aiAnalysis: result,
                submittedAt: Date.now(),
              },
            }),
          );
        }
        return { success: result.isValid, result };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Photo validation aborted');
          return { success: false, aborted: true };
        }

        // Fallback on error
        dispatch(
          completeTask({
            taskId,
            proof: { type: 'photo', uri, submittedAt: Date.now() },
          }),
        );
        return { success: true };
      } finally {
        abortController.abort();
      }
    },
    [dispatch],
  );

  const logBoosterTask = useCallback(
    (key: string, points: number, category: TaskCategory, label: string) => {
      dispatch(logBooster({ key, points, category, label }));
    },
    [dispatch],
  );

  const generateTasks = useCallback(
    async (timeOfDay?: 'morning' | 'evening') => {
      // Prevent concurrent task generation
      if (taskGenerationInProgressRef.current) {
        console.log('[TaskGen] Already in progress, skipping');
        return null;
      }

      // Abort any previous generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      taskGenerationInProgressRef.current = true;

      try {
        setLoading(true);
        const output = await TaskGenerationService.generate(
          {
            userProfile,
            behaviorMetrics,
            history,
            mode: todaysMode,
            timeOfDay,
            todaysScores,
          },
          abortControllerRef.current.signal,
        );

        dispatch(setDailyTasks(output.tasks));
        dispatch(setGenerationDate(date));
        return output;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('[TaskGen] Generation aborted');
          return null;
        }
        console.error('[TaskGen] Error:', error);
        return null;
      } finally {
        setLoading(false);
        taskGenerationInProgressRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [
      dispatch,
      userProfile,
      behaviorMetrics,
      history,
      todaysMode,
      todaysScores,
      date,
    ],
  );

  const checkAndGenerateTasksByTime = useCallback(async () => {
    // Prevent concurrent execution
    if (taskGenerationInProgressRef.current) {
      return;
    }

    const hour = new Date().getHours();
    const hasTasks = tasks.length > 0;
    const tasksGenToday = tasksGeneratedDate === date;

    if (hour >= SMART_SYSTEM.MORNING_START && hour < SMART_SYSTEM.MORNING_END) {
      if (!tasksGenToday || !hasTasks) {
        await generateTasks('morning');
      }
      return;
    }

    if (hour >= SMART_SYSTEM.EVENING_START && hour < SMART_SYSTEM.EVENING_END) {
      if (!hasTasks && !tasksGenToday) {
        await generateTasks('morning');
        return;
      }

      if (todayMetadata?.eveningBoosterGenerated) return;

      const incompleteCategories: TaskCategory[] = [];
      if (todaysScores.diet < 100) incompleteCategories.push('diet');
      if (todaysScores.activity < 100) incompleteCategories.push('activity');
      if (todaysScores.stress < 100) incompleteCategories.push('stress');

      if (incompleteCategories.length === 0) {
        await preloadNextDay();
        return;
      }

      dispatch(failIncompleteTasks({ categories: incompleteCategories }));

      try {
        const boosters = await TaskGenerationService.generateEveningBoosters({
          missingCategories: incompleteCategories,
          currentScores: todaysScores,
          userLevel: userProfile.level,
        });
        dispatch(injectBoosterTasks(boosters));
        dispatch(markEveningBoosterGenerated());
      } catch (error) {
        console.error('[Booster] Error:', error);
      }

      return;
    }

    if (!tasksGenToday && !hasTasks) {
      await generateTasks('morning');
    }
  }, [
    tasks.length,
    tasksGeneratedDate,
    date,
    todaysScores,
    todayMetadata?.eveningBoosterGenerated,
    userProfile.level,
    dispatch,
    generateTasks,
  ]);

  const preloadNextDay = useCallback(async () => {
    try {
      const allDone =
        tasks.length > 0 &&
        tasks.every(
          t =>
            t.isDone ||
            (t as any).status === 'completed' ||
            (t as any).status === 'failed',
        );
      if (!allDone) return;
      if (todayMetadata?.nextDayTasksPreloaded) return;

      const output = await TaskGenerationService.generate({
        userProfile,
        behaviorMetrics,
        history,
        mode: todaysMode,
        timeOfDay: 'morning',
      });
      dispatch(setNextDayTasks(output.tasks));
    } catch (error) {
      console.error('[PreloadNextDay] Error:', error);
    }
  }, [
    tasks,
    todayMetadata?.nextDayTasksPreloaded,
    userProfile,
    behaviorMetrics,
    history,
    todaysMode,
    dispatch,
  ]);

  const endDay = useCallback(() => {
    dispatch(completeDay());
  }, [dispatch]);

  const generateWeeklyReport = useCallback(async () => {
    try {
      const report = await ReportGenerationService.generate({
        history,
        behaviorMetrics,
        userProfile,
      });
      dispatch(addWeeklyReport(report));
      return report;
    } catch (error) {
      console.error('[WeeklyReport] Error:', error);
      return null;
    }
  }, [dispatch, history, behaviorMetrics, userProfile]);

  const changeMode = useCallback(
    (mode: GameMode) => dispatch(setMode(mode)),
    [dispatch],
  );

  const initialize = useCallback(() => dispatch(initializeGame()), [dispatch]);

  const initAfterOnboarding = useCallback(
    (
      determinedLevel: number,
      questionnaireAnswers: Record<string, any>,
      initialXP?: number,
      assessmentScores?: any,
    ) => {
      dispatch(
        initializeAfterOnboarding({
          determinedLevel,
          questionnaireAnswers,
          initialXP,
          assessmentScores,
        }),
      );
    },
    [dispatch],
  );

  const reset = useCallback(() => dispatch(resetGame()), [dispatch]);

  const dismissQuickFeedback = useCallback(() => setQuickFeedback(null), []);

  const dismissCelebration = useCallback(
    () => setCelebrations(prev => prev.slice(1)),
    [],
  );

  // ========== EFFECTS ==========

  // Progress tracking for celebrations
  useEffect(() => {
    const prev = prevProgressRef.current;
    const newCelebrations: CelebrationEvent[] = [];

    if (dietProgress >= 1 && prev.diet < 1) {
      newCelebrations.push({
        type: 'milestone',
        title: 'Diet Goal Complete!',
        message: 'All diet tasks completed 🥗',
        icon: '🥗',
        rewards: [badgeReward('diet_master', 'Diet Master')],
        animation: 'confetti',
      });
    }

    if (activityProgress >= 1 && prev.activity < 1) {
      newCelebrations.push({
        type: 'milestone',
        title: 'Activity Goal Complete!',
        message: 'You stayed active today 💪',
        icon: '🏃',
        rewards: [badgeReward('activity_champion', 'Activity Champion')],
        animation: 'fireworks',
      });
    }

    if (stressProgress >= 1 && prev.stress < 1) {
      newCelebrations.push({
        type: 'milestone',
        title: 'Stress Managed!',
        message: 'Calm and consistent 🧘',
        icon: '🧘',
        rewards: [badgeReward('zen_mode', 'Zen Mode')],
        animation: 'stars',
      });
    }

    const perfectDay =
      dietProgress >= 1 && activityProgress >= 1 && stressProgress >= 1;
    if (perfectDay && !prev.perfectDay) {
      newCelebrations.push({
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
      });
      preloadNextDay();
    }

    if (newCelebrations.length > 0) {
      setCelebrations(prev => [...prev, ...newCelebrations]);
    }

    prevProgressRef.current = {
      diet: dietProgress,
      activity: activityProgress,
      stress: stressProgress,
      perfectDay,
    };
  }, [dietProgress, activityProgress, stressProgress, preloadNextDay]);

  // App state monitoring
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        dispatch(updateTimerOnForeground());
        dispatch(ensureTodayIsCurrent());
        checkAndGenerateTasksByTime();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    dispatch(ensureTodayIsCurrent());

    return () => {
      sub.remove();
      // Cleanup abort controller on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch, checkAndGenerateTasksByTime]);

  // Task generation date monitoring
  useEffect(() => {
    if (tasksGeneratedDate !== date) {
      checkAndGenerateTasksByTime();
    }
  }, [tasksGeneratedDate, date, checkAndGenerateTasksByTime]);

  // ========== RETURN ==========

  return {
    loading: isPlanLoading || loading,

    // Progress metrics
    dietProgress,
    activityProgress,
    stressProgress,

    // Task counts
    completedDietTasksCount: completedDietTasks.length,
    completedActivityTasksCount: completedActivityTasks.length,
    completedStressTasksCount: completedStressTasks.length,
    activityTaskCount: activityCount,
    dietTaskCount: superFoodCount,
    activityTaskCompleted,
    dietTaskCompleted,
    totalTaskCount,
    totalCompletedTasks,

    // UI state
    quickFeedback,
    dismissQuickFeedback,
    celebrations,
    dismissCelebration,

    // Tasks
    tasks,
    handleTaskPress,
    handleTaskLongPress,

    // User data
    userLevelInfo,
    userProfile,
    levelInfo,
    todaysTasks: tasks,
    todaysScores,
    todaysMode,
    todaysLogs,
    todayPlan,
    tasksGeneratedDate,
    boosterCompleted,

    // Completion rate
    completionRate,

    // Timer
    activeTimer,
    timerElapsed,
    timerRemaining,
    isTimerActive,
    isTimerPaused,
    isTimerCompleted,

    // Behavior data
    streakData,
    behaviorMetrics,
    history,
    weeklyReports,

    // Task categorization
    tasksByCategory,
    completedTasksCount,
    pendingTasksCount,

    // Timer actions
    startTask,
    pauseTimer: pauseTimerAction,
    resumeTimer: resumeTimerAction,
    cancelTimer,

    // Task actions
    finishTask,
    logTask,
    skipTask: skipTaskAction,
    undoTask,

    // Validation
    validatePhoto,
    logBoosterTask,

    // Generation
    generateTasks,
    checkAndGenerateTasksByTime,
    endDay,
    preloadNextDay,
    generateWeeklyReport,

    // Game management
    changeMode,
    initialize,
    initAfterOnboarding,
    reset,
  };
};

export { useGameProgression };
export default useGameProgression;
