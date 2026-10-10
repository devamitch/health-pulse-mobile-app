import { BoosterKey, BoosterTask } from '@/constants/booster-and-special-tasks';
import {
  GamePlan,
  GameProfile,
  PlanMode,
  ScoreHistory,
  TaskInfo,
} from '@/services/mmkv-redux/slices';
import { xpCalculator } from '@/utils/gamification/calculations';
import { SimplifiedTask } from '@/utils/gamification/game-plan-generator';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: GameProfile = {
  userProfile: {
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    name: 'Health Seeker',
  },
  history: [],
  today: {
    date: new Date().toDateString(),
    mode: 'STANDARD',
    scores: { diet: 0, stress: 0, activity: 0 },
    logs: [],
    targets: {
      diet: 35,
      activity: 35,
      stress: 30,
    },
    boosterTaskCompleted: 0,
  },
  streak: 0,
  todayPlan: null,
  levelInfo: [],
  tasks: [],
};

const getLevelMultiplier = (level: number) => 1 + (level - 1) * 0.05;

const calculateDailyTargets = (level: number, mode: PlanMode) => {
  const difficulty = getLevelMultiplier(level);
  const baseMetMinutes = 150;
  const baseCleanEating = 3;
  const baseMindfulness = 10;

  let modeModifier = 1.0;
  if (mode === 'RECOVERY') modeModifier = 0.6;
  if (mode === 'HERO') modeModifier = 1.3;

  return {
    metMinutes: Math.round(baseMetMinutes * difficulty * modeModifier),
    cleanMeals: Math.round(baseCleanEating * difficulty),
    mindfulnessMin: Math.round(baseMindfulness * difficulty),
    diet: 100,
    stress: 100,
    activity: 100,
  };
};

const generateNextDayPlan = (
  lastDay: ScoreHistory,
  history: ScoreHistory[],
): GamePlan => {
  let nextMode: PlanMode = 'STANDARD';
  let message = "Let's keep the momentum going.";
  let focus = 'Balanced Health';

  if (history.length >= 3) {
    const last3Days = history.slice(-3);
    const allHundredPercent = last3Days.every(
      day => day.scores.activity === 100,
    );

    if (allHundredPercent) {
      nextMode = 'HERO';
      message = 'You are on fire! Tomorrow is a Challenge Day.';
      focus = 'High Intensity Interval Training';
      return { mode: nextMode, message: message, focus: focus };
    }
  }

  if (lastDay.scores.activity < 80) {
    nextMode = 'RECOVERY';
    message = 'Time to rest and recharge.';
    focus = 'Sleep & Stretching';
  }

  return {
    mode: nextMode,
    message: message,
    focus: focus,
  };
};

const getMissedDays = (
  todayDateString: string,
  lastLoggedDateString: string | undefined,
): string[] => {
  const missedDates: string[] = [];

  if (!lastLoggedDateString) {
    return missedDates;
  }

  const todayDate = new Date(todayDateString);
  const lastLoggedDate = new Date(lastLoggedDateString);

  const daysDiff = Math.floor(
    (todayDate.getTime() - lastLoggedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (let i = 1; i < daysDiff; i++) {
    const missedDate = new Date(lastLoggedDate);
    missedDate.setDate(missedDate.getDate() + i);
    missedDates.push(missedDate.toDateString());
  }

  return missedDates;
};

const handleLevelUp = (state: GameProfile) => {
  while (state.userProfile.xp >= state.userProfile.xpToNextLevel) {
    state.levelInfo.push({ ...state.userProfile });
    state.userProfile.level++;
    state.userProfile.xp -= state.userProfile.xpToNextLevel;
    state.userProfile.xpToNextLevel =
      xpCalculator(state.userProfile.level) * 100;
  }
};

const gameEngineSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: state => {
      state.today.targets = calculateDailyTargets(
        state.userProfile.level,
        state.today.mode,
      );
    },

    setUserGameProfile: (state, action: PayloadAction<GameProfile>) => {
      // state.userProfile = action.payload.userProfile;
      // state.userProfile.xp = action.payload.userProfile.xp;
      state.userProfile = {
        ...state.userProfile,
        ...action.payload.userProfile,
        xp: action.payload.userProfile.xp,
      };
    },

    logUserTask3: (
      state,
      action: PayloadAction<TaskInfo & Partial<SimplifiedTask>>,
    ) => {
      const task = action.payload;

      // Find if task already exists in logs
      const existingLogIndex = state.today.logs.findIndex(
        log => log.id === task.id,
      );

      // Find if task already exists in tasks array
      const existingTaskIndex = state.tasks.findIndex(t => t.id === task.id);

      // Update or add to logs
      if (existingLogIndex !== -1) {
        // Task already logged - update it
        const oldTask = state.today.logs[existingLogIndex];
        const pointsDifference = task.points - (oldTask.points || 0);

        // Update the log entry
        state.today.logs[existingLogIndex] = {
          ...oldTask,
          ...task,
          points: task.points,
          isDone: true,
        };

        // Only add the difference in points to avoid double-counting
        if (pointsDifference > 0) {
          const current = state.today.scores[task.category];
          state.today.scores[task.category] = Math.min(
            100,
            current + pointsDifference,
          );
          state.userProfile.xp += pointsDifference;
        }
      } else {
        // New task - add to logs
        state.today.logs.push({
          ...task,
          isDone: true,
        });

        // Add points normally
        const current = state.today.scores[task.category];
        state.today.scores[task.category] = Math.min(
          100,
          current + task.points,
        );
        state.userProfile.xp += task.points;
      }

      // Update or add to tasks array
      if (existingTaskIndex !== -1) {
        // Task exists - update it
        state.tasks[existingTaskIndex] = {
          ...state.tasks[existingTaskIndex],
          ...task,
          isDone: true,
        };
      } else {
        // New task - add it
        state.tasks = [...state.tasks, { ...task, isDone: true }];
      }

      // Handle level up
      handleLevelUp(state);
    },

    logUserTask2: (
      state,
      action: PayloadAction<TaskInfo & Partial<SimplifiedTask>>,
    ) => {
      const task = action.payload;

      console.log('[Redux] logUserTask called with:', {
        id: task.id,
        title: task.title,
        category: task.category,
        points: task.points,
      });

      // Find if task already exists in logs
      const existingLogIndex = state.today.logs.findIndex(
        log => log.id === task.id,
      );

      // Find if task already exists in tasks array
      const existingTaskIndex = state.tasks.findIndex(t => t.id === task.id);

      console.log('[Redux] Task status:', {
        existsInLogs: existingLogIndex !== -1,
        existsInTasks: existingTaskIndex !== -1,
        logIndex: existingLogIndex,
        taskIndex: existingTaskIndex,
      });

      // Update or add to logs
      if (existingLogIndex !== -1) {
        // Task already logged - update it
        const oldTask = state.today.logs[existingLogIndex];
        const pointsDifference = task.points - (oldTask.points || 0);

        console.log('[Redux] Updating existing log entry:', {
          oldPoints: oldTask.points || 0,
          newPoints: task.points,
          pointsDifference,
        });

        // Update the log entry
        state.today.logs[existingLogIndex] = {
          ...oldTask,
          ...task,
          points: task.points,
          isDone: true,
        };

        // Only add the difference in points to avoid double-counting
        if (pointsDifference > 0) {
          const current = state.today.scores[task.category];
          const newScore = Math.min(100, current + pointsDifference);

          console.log('[Redux] Updating scores:', {
            category: task.category,
            oldScore: current,
            pointsAdded: pointsDifference,
            newScore,
          });

          state.today.scores[task.category] = newScore;
          state.userProfile.xp += pointsDifference;

          console.log('[Redux] XP updated:', {
            xpAdded: pointsDifference,
            totalXP: state.userProfile.xp,
          });
        } else {
          console.log('[Redux] No points to add (already counted or negative)');
        }
      } else {
        // New task - add to logs
        console.log('[Redux] Adding new task to logs');

        state.today.logs.push({
          ...task,
          isDone: true,
        });

        // Add points normally
        const current = state.today.scores[task.category];
        const newScore = Math.min(100, current + task.points);

        console.log('[Redux] Adding points for new task:', {
          category: task.category,
          oldScore: current,
          pointsAdded: task.points,
          newScore,
        });

        state.today.scores[task.category] = newScore;
        state.userProfile.xp += task.points;

        console.log('[Redux] XP updated:', {
          xpAdded: task.points,
          totalXP: state.userProfile.xp,
        });
      }

      // Update or add to tasks array
      if (existingTaskIndex !== -1) {
        // Task exists - update it
        console.log('[Redux] Updating existing task in tasks array');
        state.tasks[existingTaskIndex] = {
          ...state.tasks[existingTaskIndex],
          ...task,
          isDone: true,
        };
      } else {
        // New task - add it
        console.log('[Redux] Adding new task to tasks array');
        state.tasks = [...state.tasks, { ...task, isDone: true }];
      }

      console.log('[Redux] Final state:', {
        totalLogs: state.today.logs.length,
        totalTasks: state.tasks.length,
        scores: state.today.scores,
        xp: state.userProfile.xp,
      });

      // Handle level up
      handleLevelUp(state);
    },

    logUserTask: (
      state,
      action: PayloadAction<TaskInfo & Partial<SimplifiedTask>>,
    ) => {
      const task = action.payload;

      // Find if task already exists and is completed
      const existingLog = state.today.logs.find(log => log.id === task.id);

      if (existingLog && existingLog.isDone) {
        // Task already completed - don't allow duplicate completion
        console.warn('[Redux] Task already completed, ignoring:', task.id);
        return; // Exit early without making changes
      }

      // Find if task exists in logs (but not completed)
      const existingLogIndex = state.today.logs.findIndex(
        log => log.id === task.id,
      );

      // Find if task exists in tasks array
      const existingTaskIndex = state.tasks.findIndex(t => t.id === task.id);

      // Update or add to logs
      if (existingLogIndex !== -1) {
        // Task exists but not completed - update it
        state.today.logs[existingLogIndex] = {
          ...state.today.logs[existingLogIndex],
          ...task,
          isDone: true,
        };
      } else {
        // New task - add to logs
        state.today.logs.push({
          ...task,
          isDone: true,
        });
      }

      // Add points (only once since we check if task is already completed)
      const current = state.today.scores[task.category];
      state.today.scores[task.category] = Math.min(100, current + task.points);
      state.userProfile.xp += task.points;

      // Update or add to tasks array
      if (existingTaskIndex !== -1) {
        state.tasks[existingTaskIndex] = {
          ...state.tasks[existingTaskIndex],
          ...task,
          isDone: true,
        };
      } else {
        state.tasks = [...state.tasks, { ...task, isDone: true }];
      }

      // Handle level up
      handleLevelUp(state);
    },

    logBooster: (state, action: PayloadAction<BoosterKey>) => {
      const boosterKey = action.payload;
      const booster = BoosterTask[boosterKey];

      state.today.logs.push({
        id: Date.now(),
        type: boosterKey,
        category: booster.category,
        points: booster.points,
      });

      const current = state.today.scores[booster.category];
      state.today.scores[booster.category] = Math.min(
        100,
        current + booster.points,
      );
      state.today.boosterTaskCompleted =
        (state.today.boosterTaskCompleted ?? 0) + 1;

      state.userProfile.xp += booster.points;
      handleLevelUp(state);
    },

    unlogUserTask: (state, action: PayloadAction<{ id: number | string }>) => {
      const { id } = action.payload;
      const index = state.today.logs.findIndex(log => log.id === id);
      if (index === -1) return;

      const task = state.today.logs[index];
      state.today.logs.splice(index, 1);

      if (!task) return;

      const current = state.today.scores[task.category];
      state.today.scores[task.category] = Math.max(0, current - task.points);

      state.userProfile.xp = Math.max(0, state.userProfile.xp - task.points);

      if (task.type) {
        state.today.boosterTaskCompleted = Math.max(
          0,
          (state.today.boosterTaskCompleted ?? 0) - 1,
        );
      }
    },

    completeDay: state => {
      const lastLoggedDate =
        state.history.length > 0
          ? state.history[state.history.length - 1]?.date
          : undefined;

      const missedDays = getMissedDays(state.today.date, lastLoggedDate);

      missedDays.forEach(missedDate => {
        const missedDaySummary: ScoreHistory = {
          date: missedDate,
          average: 0,
          scores: { diet: 0, activity: 0, stress: 0 },
          mode: null,
        };
        state.history.push(missedDaySummary);
      });

      const { diet, activity, stress } = state.today.scores;
      const dayAverage = (diet + activity + stress) / 3;

      if (dayAverage >= 80) {
        state.userProfile.xp += 50;
        handleLevelUp(state);
      }

      const daySummary: ScoreHistory = {
        date: state.today.date,
        average: dayAverage,
        scores: { ...state.today.scores },
        mode: state.today.mode,
      };

      state.history.push(daySummary);

      if (state.history.length > 7) {
        state.history.shift();
      }

      const nextPlan = generateNextDayPlan(daySummary, state.history);
      state.todayPlan = nextPlan;

      state.today = {
        date: new Date().toDateString(),
        mode: nextPlan.mode,
        scores: { diet: 0, activity: 0, stress: 0 },
        logs: [],
        targets: calculateDailyTargets(state.userProfile.level, nextPlan.mode),
        boosterTaskCompleted: 0,
      };
    },

    setMode: (state, action: PayloadAction<PlanMode>) => {
      state.today.mode = action.payload;
      state.today.targets = calculateDailyTargets(
        state.userProfile.level,
        action.payload,
      );
    },

    resetGame: () => initialState,

    setTodaysTasks: (state, action: PayloadAction<SimplifiedTask[]>) => {
      state.tasks = action.payload;
    },

    setGenerationDate: (state, action: PayloadAction<string>) => {
      state.tasksGeneratedAt = action.payload;
    },
  },
});

export const {
  initializeGame,
  logUserTask,
  logBooster,
  completeDay,
  setMode,
  resetGame,
  unlogUserTask,
  setUserGameProfile,
  setTodaysTasks,
  setGenerationDate,
} = gameEngineSlice.actions;

export default gameEngineSlice.reducer;
