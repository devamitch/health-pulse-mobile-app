import {
  GameMode,
  GameTask,
  TaskProof,
} from '@/lib/types/game-progression.types';
import { TaskCategory } from '@/navigation/types';
import AIValidationService from '@/services/AIValidationService';
import { completeDay, setMode } from '@/services/mmkv-redux/slices';
import {
  initializeGame,
  logBooster,
  logUserTask,
  resetGame,
} from '@/services/mmkv-redux/slices/game_engine_slice';
import {
  addWeeklyReport,
  clearTaskTimer,
  completeTask,
  ensureTodayIsCurrent,
  gameSelectors,
  initializeAfterOnboarding,
  pauseTaskTimer,
  resumeTaskTimer,
  setDailyTasks,
  skipTask,
  startTaskTimer,
  unlogTask,
  updateTimerOnForeground,
} from '@/services/mmkv-redux/slices/gameProgressionSlice';
import ReportGenerationService from '@/services/ReportGenerationService';
import TaskGenerationService from '@/services/TaskGenerationService';
import { useCallback, useEffect, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export const useGameProgression = () => {
  const dispatch = useDispatch();

  const userProfile = useSelector(gameSelectors.selectUserProfile);
  const todaysTasks = useSelector(gameSelectors.selectTodaysTasks);
  const todaysScores = useSelector(gameSelectors.selectTodaysScores);
  const todaysMode = useSelector(gameSelectors.selectTodaysMode);
  const todaysLogs = useSelector(gameSelectors.selectTodaysLogs);
  const activeTimer = useSelector(gameSelectors.selectActiveTimer);
  const timerElapsed = useSelector(gameSelectors.selectTimerElapsed);
  const timerRemaining = useSelector(gameSelectors.selectTimerRemaining);
  const streakData = useSelector(gameSelectors.selectStreakData);
  const behaviorMetrics = useSelector(gameSelectors.selectBehaviorMetrics);
  const history = useSelector(gameSelectors.selectHistory);
  const weeklyReports = useSelector(gameSelectors.selectWeeklyReports);
  const levelInfo = useSelector(gameSelectors.selectLevelInfo);
  const todayPlan = useSelector(gameSelectors.selectTodayPlan);
  const tasksGeneratedDate = useSelector(
    gameSelectors.selectTasksGeneratedDate,
  );
  const boosterCompleted = useSelector(gameSelectors.selectBoosterCompleted);

  // Computed
  const completionRate = useSelector(gameSelectors.selectCompletionRate);
  const dietProgress = useSelector(gameSelectors.selectDietProgress);
  const activityProgress = useSelector(gameSelectors.selectActivityProgress);
  const stressProgress = useSelector(gameSelectors.selectStressProgress);

  // ========================================================================
  // HELPER FUNCTIONS - TIME-BASED TASK GENERATION
  // ========================================================================

  /**
   * Get the current hour (0-23)
   */
  const getCurrentHour = useCallback(() => {
    return new Date().getHours();
  }, []);

  /**
   * Get today's date string (YYYY-MM-DD format)
   */
  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  /**
   * Get current time period
   */
  const getCurrentTimePeriod = useCallback(():
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'night' => {
    const hour = getCurrentHour();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, [getCurrentHour]);

  /**
   * Check if all tasks in a category are completed
   */
  const hasCategoryCompleted = useCallback(
    (category: TaskCategory): boolean => {
      const categoryTasks = todaysTasks.filter(t => t.category === category);
      if (categoryTasks.length === 0) return false;
      return categoryTasks.every(t => t.isDone || t.status === 'completed');
    },
    [todaysTasks],
  );

  /**
   * Get all categories that have incomplete tasks
   */
  const getIncompleteCategories = useCallback((): TaskCategory[] => {
    const categories: TaskCategory[] = ['diet', 'activity', 'stress'];
    return categories.filter(cat => !hasCategoryCompleted(cat));
  }, [hasCategoryCompleted]);

  /**
   * Check if tasks for specific time period were already generated today
   */
  const isTasksGeneratedForPeriod = useCallback(
    (period: string): boolean => {
      const lastGeneration = localStorage.getItem(
        `lastTaskGeneration_${period}`,
      );
      const today = getTodayString();
      return lastGeneration === today;
    },
    [getTodayString],
  );

  /**
   * Check if specific time period tasks need to be generated
   */
  const shouldGenerateTasksForPeriod = useCallback(
    (period: 'morning' | 'afternoon' | 'evening' | 'night'): boolean => {
      // Check if already generated today
      if (isTasksGeneratedForPeriod(period)) {
        return false;
      }

      const currentHour = getCurrentHour();

      // Time window checks
      switch (period) {
        case 'morning':
          return currentHour >= 7 && currentHour < 12;
        case 'afternoon':
          return currentHour >= 12 && currentHour < 17;
        case 'evening':
          return currentHour >= 17 && currentHour < 22;
        case 'night':
          return currentHour >= 22 || currentHour < 5;
        default:
          return false;
      }
    },
    [getCurrentHour, isTasksGeneratedForPeriod],
  );

  // ========================================================================
  // GENERATE TASKS ACTION
  // ========================================================================

  const generateTasks = useCallback(
    async (timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night') => {
      try {
        const output = await TaskGenerationService.generate({
          userProfile,
          behaviorMetrics,
          history,
          mode: todaysMode,
          timeOfDay,
        });

        dispatch(setDailyTasks(output.tasks));
        return output;
      } catch (error) {
        console.error('[useGameProgression] Task generation failed:', error);
        return null;
      }
    },
    [dispatch, userProfile, behaviorMetrics, history, todaysMode],
  );

  // ========================================================================
  // SMART TIME-BASED TASK GENERATION LOGIC - UPDATED
  // ========================================================================

  /**
   * Main function to check and generate tasks based on current time
   *
   * MORNING (7:00 AM - 11:59 AM):
   *   - Generate all tasks for all categories (diet, activity, stress)
   *   - Only once per day
   *
   * AFTERNOON (12:00 PM - 4:59 PM):
   *   - Check which categories have incomplete morning tasks
   *   - Generate tasks ONLY for those incomplete categories
   *
   * EVENING (5:00 PM - 9:59 PM):
   *   - Check which categories still have incomplete tasks
   *   - Generate tasks ONLY for those incomplete categories
   *
   * NIGHT (10:00 PM - 4:59 AM):
   *   - Check which categories still have incomplete tasks
   *   - Generate tasks ONLY for those incomplete categories
   */
  const checkAndGenerateTasksByTime = useCallback(async () => {
    const today = getTodayString();
    const currentPeriod = getCurrentTimePeriod();
    const incompleteCategories = getIncompleteCategories();

    console.log(
      `[useGameProgression] Time-based task check: Period: ${currentPeriod}, Date: ${today}, Incomplete Categories: ${incompleteCategories.join(
        ', ',
      )}`,
    );

    // Skip if no incomplete categories
    if (incompleteCategories.length === 0) {
      console.log(
        '[useGameProgression] All tasks are completed, skipping generation',
      );
      return;
    }

    // Check if we should generate tasks for current period
    if (shouldGenerateTasksForPeriod(currentPeriod)) {
      console.log(
        `[useGameProgression] Generating ${currentPeriod.toUpperCase()} tasks for incomplete categories...`,
      );

      // Generate tasks for the current period
      const output = await TaskGenerationService.generate({
        userProfile,
        behaviorMetrics,
        history,
        mode: todaysMode,
        timeOfDay: currentPeriod,
      });

      if (output && output.tasks.length > 0) {
        // Filter to only include tasks for incomplete categories
        const filteredTasks = output.tasks.filter(task =>
          incompleteCategories.includes(task.category),
        );

        if (filteredTasks.length > 0) {
          // Create new tasks with proper scheduling
          const newTasks = filteredTasks.map(task => ({
            ...task,
            scheduledFor: currentPeriod,
            metadata: {
              ...task.metadata,
              generationReason: `Generated in ${currentPeriod} for incomplete ${task.category} tasks`,
              generatedAtPeriod: currentPeriod,
            },
          }));

          // Combine existing tasks with new tasks
          // Don't remove or modify existing tasks
          const combinedTasks = [...todaysTasks, ...newTasks];
          dispatch(setDailyTasks(combinedTasks));

          // Mark this period as generated
          localStorage.setItem(`lastTaskGeneration_${currentPeriod}`, today);

          console.log(
            `[useGameProgression] ${currentPeriod} tasks generated: ${
              newTasks.length
            } tasks for categories: ${incompleteCategories.join(', ')}`,
          );
        } else {
          console.log(
            `[useGameProgression] No tasks generated for ${currentPeriod} - no tasks match incomplete categories`,
          );
        }
      }
    } else {
      console.log(
        `[useGameProgression] ${currentPeriod.toUpperCase()} tasks already generated or not in time window`,
      );
    }
  }, [
    getTodayString,
    getCurrentTimePeriod,
    getIncompleteCategories,
    shouldGenerateTasksForPeriod,
    userProfile,
    behaviorMetrics,
    history,
    todaysMode,
    todaysTasks,
    dispatch,
  ]);

  /**
   * Alternative: Generate tasks for specific incomplete categories
   */
  const generateTasksForIncompleteCategories = useCallback(
    async (period: 'morning' | 'afternoon' | 'evening' | 'night') => {
      const incompleteCategories = getIncompleteCategories();

      if (incompleteCategories.length === 0) {
        console.log(
          '[useGameProgression] All categories completed, skipping generation',
        );
        return null;
      }

      console.log(
        `[useGameProgression] Generating ${period} tasks for incomplete categories: ${incompleteCategories.join(
          ', ',
        )}`,
      );

      const output = await TaskGenerationService.generate({
        userProfile,
        behaviorMetrics,
        history,
        mode: todaysMode,
        timeOfDay: period,
      });

      if (output && output.tasks.length > 0) {
        // Filter tasks for incomplete categories
        const filteredTasks = output.tasks.filter(task =>
          incompleteCategories.includes(task.category),
        );

        if (filteredTasks.length > 0) {
          // Mark tasks with period
          const periodTasks = filteredTasks.map(task => ({
            ...task,
            scheduledFor: period,
            metadata: {
              ...task.metadata,
              generationReason: `Supplemental ${period} task for incomplete ${task.category}`,
            },
          }));

          // Add to existing tasks
          const combinedTasks = [...todaysTasks, ...periodTasks];
          dispatch(setDailyTasks(combinedTasks));

          console.log(
            `[useGameProgression] Added ${periodTasks.length} ${period} tasks for incomplete categories`,
          );
          return periodTasks;
        }
      }
      return null;
    },
    [
      getIncompleteCategories,
      userProfile,
      behaviorMetrics,
      history,
      todaysMode,
      todaysTasks,
      dispatch,
    ],
  );

  // ========================================================================
  // BACKGROUND / FOREGROUND HANDLING
  // ========================================================================

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        console.log('[useGameProgression] App came to foreground');
        // Update timer if one is running
        dispatch(updateTimerOnForeground());
        // Check if date has changed
        dispatch(ensureTodayIsCurrent());
        // Check and generate tasks based on time
        checkAndGenerateTasksByTime();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Also check on mount
    console.log('[useGameProgression] Hook mounted, checking date...');
    dispatch(ensureTodayIsCurrent());
    checkAndGenerateTasksByTime();

    return () => {
      subscription.remove();
    };
  }, [dispatch, checkAndGenerateTasksByTime]);

  /**
   * Set up periodic check for automatic task generation
   * Check every 30 minutes if we need to generate tasks
   */
  useEffect(() => {
    console.log(
      '[useGameProgression] Setting up periodic task generation check',
    );

    // Check immediately
    checkAndGenerateTasksByTime();

    // Then check every 30 minutes
    const checkInterval = setInterval(() => {
      console.log('[useGameProgression] Periodic task generation check...');
      checkAndGenerateTasksByTime();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds

    return () => {
      clearInterval(checkInterval);
      console.log('[useGameProgression] Clearing periodic check interval');
    };
  }, [checkAndGenerateTasksByTime]);

  /**
   * Set up hourly cleanup check to remove old unscheduled tasks
   */
  useEffect(() => {
    const cleanupOldTasks = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Clean up tasks that are from previous periods and not completed
      const updatedTasks = todaysTasks.filter(task => {
        // Keep all completed tasks
        if (task.isDone || task.status === 'completed') return true;

        // Keep tasks scheduled for current or future periods
        const taskPeriod = task.scheduledFor;
        if (!taskPeriod) return true; // Keep unscheduled tasks

        // Define period priority for cleanup
        const periodPriority = {
          morning: 1,
          afternoon: 2,
          evening: 3,
          night: 4,
        };

        const currentPeriod = getCurrentTimePeriod();
        const taskPriority =
          periodPriority[taskPeriod as keyof typeof periodPriority] || 0;
        const currentPriority = periodPriority[currentPeriod] || 0;

        // Keep tasks from current or future periods
        return taskPriority >= currentPriority;
      });

      if (updatedTasks.length !== todaysTasks.length) {
        dispatch(setDailyTasks(updatedTasks));
        console.log(
          `[useGameProgression] Cleaned up ${
            todaysTasks.length - updatedTasks.length
          } old tasks`,
        );
      }
    };

    // Cleanup hourly
    const cleanupInterval = setInterval(cleanupOldTasks, 60 * 60 * 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [todaysTasks, dispatch, getCurrentTimePeriod]);

  // ========================================================================
  // TIMER ACTIONS
  // ========================================================================

  const startTask = useCallback(
    (taskId: string, targetSeconds: number) => {
      dispatch(startTaskTimer({ taskId, targetSeconds }));
    },
    [dispatch],
  );

  const pauseTimer = useCallback(() => {
    dispatch(pauseTaskTimer());
  }, [dispatch]);

  const resumeTimer = useCallback(() => {
    dispatch(resumeTaskTimer());
  }, [dispatch]);

  const cancelTimer = useCallback(() => {
    dispatch(clearTaskTimer());
  }, [dispatch]);

  // ========================================================================
  // MANUAL TASK GENERATION (can be called from UI if needed)
  // ========================================================================

  const manualGenerateTasks = useCallback(
    async (period?: 'morning' | 'afternoon' | 'evening' | 'night') => {
      console.log(
        '[useGameProgression] Manual task generation triggered for:',
        period || 'current period',
      );

      if (period) {
        return generateTasksForIncompleteCategories(period);
      } else {
        return checkAndGenerateTasksByTime();
      }
    },
    [generateTasksForIncompleteCategories, checkAndGenerateTasksByTime],
  );

  // ========================================================================
  // TASK COMPLETION
  // ========================================================================

  const finishTask = useCallback(
    (taskId: string, proof?: TaskProof) => {
      dispatch(completeTask({ taskId, proof }));
    },
    [dispatch],
  );

  /**
   * Legacy compatibility: log a task using the old format.
   */
  const logTask = useCallback(
    (payload: {
      id: string | number;
      type?: string;
      category: TaskCategory;
      points: number;
      title?: string;
      isDone?: boolean;
      action?: string;
      coins?: number;
    }) => {
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

  // ========================================================================
  // PHOTO VALIDATION
  // ========================================================================

  const validatePhoto = useCallback(
    async (
      taskId: string,
      uri: string,
      task: GameTask,
    ): Promise<{ success: boolean; result?: any }> => {
      try {
        const result = await AIValidationService.validatePhoto({
          uri,
          expectedCategory: task.category,
          taskDescription: task.description || '',
          taskName: task.title,
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
      } catch (error) {
        console.error('[useGameProgression] Photo validation failed:', error);
        // Still complete the task on error (graceful fallback)
        dispatch(
          completeTask({
            taskId,
            proof: {
              type: 'photo',
              uri,
              submittedAt: Date.now(),
            },
          }),
        );
        return { success: true };
      }
    },
    [dispatch],
  );

  // ========================================================================
  // BOOSTER TASKS
  // ========================================================================

  const logBoosterTask = useCallback(
    (key: string, points: number, category: TaskCategory, label: string) => {
      dispatch(logBooster({ key, points, category, label }));
    },
    [dispatch],
  );

  // ========================================================================
  // DAILY ACTIONS
  // ========================================================================

  const endDay = useCallback(() => {
    dispatch(completeDay());
  }, [dispatch]);

  // ========================================================================
  // WEEKLY REPORT
  // ========================================================================

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
      console.error('[useGameProgression] Report generation failed:', error);
      return null;
    }
  }, [dispatch, history, behaviorMetrics, userProfile]);

  // ========================================================================
  // MODE & INITIALIZATION
  // ========================================================================

  const changeMode = useCallback(
    (mode: GameMode) => {
      dispatch(setMode(mode));
    },
    [dispatch],
  );

  const initialize = useCallback(() => {
    dispatch(initializeGame());
  }, [dispatch]);

  const initAfterOnboarding = useCallback(
    (
      determinedLevel: number,
      questionnaireAnswers: Record<string, any>,
      initialXP?: number,
    ) => {
      dispatch(
        initializeAfterOnboarding({
          determinedLevel,
          questionnaireAnswers,
          initialXP,
        }),
      );
    },
    [dispatch],
  );

  const reset = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  // ========================================================================
  // DERIVED DATA
  // ========================================================================

  const tasksByCategory = useMemo(() => {
    return {
      diet: todaysTasks.filter(t => t.category === 'diet'),
      activity: todaysTasks.filter(t => t.category === 'activity'),
      stress: todaysTasks.filter(t => t.category === 'stress'),
    };
  }, [todaysTasks]);

  const tasksByPeriod = useMemo(() => {
    return {
      morning: todaysTasks.filter(t => t.scheduledFor === 'morning'),
      afternoon: todaysTasks.filter(t => t.scheduledFor === 'afternoon'),
      evening: todaysTasks.filter(t => t.scheduledFor === 'evening'),
      night: todaysTasks.filter(t => t.scheduledFor === 'night'),
      anytime: todaysTasks.filter(
        t => !t.scheduledFor || t.scheduledFor === 'anytime',
      ),
    };
  }, [todaysTasks]);

  const completedTasksCount = useMemo(() => {
    return todaysTasks.filter(t => t.isDone || t.status === 'completed').length;
  }, [todaysTasks]);

  const pendingTasksCount = useMemo(() => {
    return todaysTasks.filter(
      t => !t.isDone && t.status !== 'completed' && t.status !== 'failed',
    ).length;
  }, [todaysTasks]);

  const isTimerActive = useMemo(() => {
    return activeTimer?.status === 'active';
  }, [activeTimer]);

  const isTimerPaused = useMemo(() => {
    return activeTimer?.status === 'paused';
  }, [activeTimer]);

  const isTimerCompleted = useMemo(() => {
    return activeTimer?.status === 'completed';
  }, [activeTimer]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Profile
    userProfile,
    levelInfo,

    // Today
    todaysTasks,
    todaysScores,
    todaysMode,
    todaysLogs,
    todayPlan,
    tasksGeneratedDate,
    boosterCompleted,

    // Progress
    completionRate,
    dietProgress,
    activityProgress,
    stressProgress,

    // Timer
    activeTimer,
    timerElapsed,
    timerRemaining,
    isTimerActive,
    isTimerPaused,
    isTimerCompleted,

    // Streak & History
    streakData,
    behaviorMetrics,
    history,
    weeklyReports,

    // Derived
    tasksByCategory,
    tasksByPeriod,
    completedTasksCount,
    pendingTasksCount,

    // Timer Actions
    startTask,
    pauseTimer,
    resumeTimer,
    cancelTimer,

    // Task Actions
    finishTask,
    logTask,
    skipTask: skipTaskAction,
    undoTask,

    // Photo Validation
    validatePhoto,

    // Booster
    logBoosterTask,

    // Daily Actions
    generateTasks,
    manualGenerateTasks,
    generateTasksForIncompleteCategories,
    endDay,

    // Weekly Report
    generateWeeklyReport,

    // Mode & Init
    changeMode,
    initialize,
    initAfterOnboarding,
    reset,

    // Time-based generation helpers (exposed for debugging/UI)
    checkAndGenerateTasksByTime,
    getCurrentTimePeriod,
    hasCategoryCompleted,
    getIncompleteCategories,
    shouldGenerateTasksForPeriod,
    getCurrentHour,
    getTodayString,
  };
};

export default useGameProgression;
