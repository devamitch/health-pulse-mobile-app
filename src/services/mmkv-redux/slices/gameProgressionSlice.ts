import {
  MODE_MULTIPLIERS,
  SMART_RESET_CONFIG,
  TOKEN_CONFIG,
  XP_CONFIG,
  getAdaptiveDifficulty,
  getLevelTitle,
} from '@/lib/constants/game-constants';
import {
  ActiveTimersMap,
  BehaviorMetrics,
  DayRecord,
  DayScores,
  DayTargets,
  ExpiredTimerAction,
  ExpiredTimerInfo,
  GameMode,
  GamePlan,
  GameProgressionState,
  GameTask,
  MacroData,
  PhotoProofEntry,
  SmartResetInfo,
  TaskCategory,
  TaskLogEntry,
  TaskProof,
  TimerState,
  TokenBudget,
  UserIdentity,
  UserProfile,
  WeeklyReport,
  safeNumber,
} from '@/lib/types/game-progression.types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// ============================================================================
// HELPERS
// ============================================================================

function calculateXPThreshold(level: number): number {
  return (
    XP_CONFIG.BASE_XP_PER_LEVEL + (level - 1) * XP_CONFIG.XP_GROWTH_PER_LEVEL
  );
}

function calculateDailyTargets(level: number, mode: GameMode): DayTargets {
  const difficulty = 1 + (level - 1) * 0.05;
  const modeModifier = MODE_MULTIPLIERS[mode] ?? 1.0;
  return {
    diet: 100,
    activity: 100,
    stress: 100,
    metMinutes: Math.round(150 * difficulty * modeModifier),
    cleanMeals: Math.round(3 * difficulty),
    mindfulnessMin: Math.round(10 * difficulty),
  };
}

function getMissedDays(
  todayStr: string,
  lastActiveStr: string | undefined,
): string[] {
  const missed: string[] = [];
  if (!lastActiveStr) return missed;
  const today = new Date(todayStr);
  const last = new Date(lastActiveStr);
  const diff = Math.floor(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  );
  for (let i = 1; i < diff; i++) {
    const d = new Date(last);
    d.setDate(d.getDate() + i);
    missed.push(d.toISOString().split('T')[0]);
  }
  return missed;
}

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function handleLevelUp(state: GameProgressionState): boolean {
  let leveledUp = false;
  while (state.userProfile.xp >= state.userProfile.xpToNextLevel) {
    state.levelInfo.push({ ...state.userProfile });
    state.userProfile.level++;
    state.userProfile.xp -= state.userProfile.xpToNextLevel;
    state.userProfile.xpToNextLevel = calculateXPThreshold(
      state.userProfile.level,
    );
    state.userProfile.name = getLevelTitle(state.userProfile.level);
    state.userProfile.daysAtCurrentLevel = 0;
    leveledUp = true;
  }
  return leveledUp;
}

function updateBehaviorMetrics(state: GameProgressionState) {
  const last7 = state.history.slice(-7);
  if (last7.length === 0) return;
  const avgDiet =
    last7.reduce((s, d) => s + safeNumber(d?.scores?.diet), 0) / last7.length;
  const avgActivity =
    last7.reduce((s, d) => s + safeNumber(d?.scores?.activity), 0) /
    last7.length;
  const avgStress =
    last7.reduce((s, d) => s + safeNumber(d?.scores?.stress), 0) / last7.length;
  const avgCompletion =
    last7.reduce((s, d) => s + safeNumber(d?.completionRate), 0) / last7.length;
  state.behaviorMetrics.dietCompletionRate = avgDiet;
  state.behaviorMetrics.activityCompletionRate = avgActivity;
  state.behaviorMetrics.stressCompletionRate = avgStress;
  state.behaviorMetrics.overallCompletionRate = avgCompletion;
  state.behaviorMetrics.adaptiveDifficulty =
    getAdaptiveDifficulty(avgCompletion);
  const allTasks = last7.flatMap(d => d?.taskDetails ?? []);
  const completedTitles = allTasks
    .filter(t => t?.status === 'completed')
    .map(t => t?.title)
    .filter(Boolean);
  const freq: Record<string, number> = {};
  completedTitles.forEach(t => {
    freq[t] = (freq[t] ?? 0) + 1;
  });
  state.behaviorMetrics.frequentlyCompletedTasks = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k);
  const photos = last7.reduce((s, d) => s + safeNumber(d?.photosLogged), 0);
  state.behaviorMetrics.photoLogFrequency = photos / Math.max(1, last7.length);
}

function determineNextMode(state: GameProgressionState): GamePlan {
  const last3 = state.history.slice(-3);
  const avgCompletion =
    last3.length > 0
      ? last3.reduce((s, d) => s + safeNumber(d?.completionRate), 0) /
        last3.length
      : 50;
  if (safeNumber(state.today.metadata.recoveryDaysRemaining) > 0) {
    return { mode: 'recovery', reason: 'Recovery period active' };
  }
  if (avgCompletion >= 80)
    return { mode: 'hero', reason: 'Consistent high performance' };
  if (avgCompletion >= 50)
    return { mode: 'standard', reason: 'Building consistency' };
  return { mode: 'recovery', reason: 'Need to rebuild momentum' };
}

function determineSmartReset(
  state: GameProgressionState,
  missedDays: number,
): SmartResetInfo {
  if (missedDays <= 0) return { shouldReset: false, missedDays: 0 };
  if (missedDays >= SMART_RESET_CONFIG.REHAB_THRESHOLD) {
    return {
      shouldReset: true,
      missedDays,
      recoveryPlan: {
        targetMode: 'rehab',
        duration: 5,
        reason: `Missed ${missedDays} days — starting gentle rehab`,
      },
    };
  }
  if (missedDays >= SMART_RESET_CONFIG.RECOVERY_THRESHOLD) {
    return {
      shouldReset: true,
      missedDays,
      recoveryPlan: {
        targetMode: 'recovery',
        duration: 3,
        reason: `Missed ${missedDays} days — recovery mode`,
      },
    };
  }
  return { shouldReset: false, missedDays };
}

function resetTokenBudgetIfNeeded(state: GameProgressionState) {
  const today = getDateString();
  if (state.tokenBudget.lastResetDate !== today) {
    state.tokenBudget = {
      dailyLimit: TOKEN_CONFIG.DAILY_BUDGET,
      usedToday: 0,
      lastResetDate: today,
    };
  }
}

function cleanExpiredCache(state: GameProgressionState) {
  const now = Date.now();
  state.promptCache = state.promptCache.filter(e => e.expiresAt > now);
}

// ============================================================================
// TIMER HELPERS
// ============================================================================

/** Calculate elapsed seconds for a timer, accounting for pauses */
function getTimerElapsed(t: TimerState): number {
  if (t.status === 'completed' || t.status === 'expired')
    return t.targetSeconds;
  if (t.status === 'idle') return 0;
  const now = Date.now();
  const pauseExtra = t.status === 'paused' && t.pausedAt ? now - t.pausedAt : 0;
  return Math.max(
    0,
    Math.floor((now - t.startedAt - t.totalPausedTime - pauseExtra) / 1000),
  );
}

/** Check if a timer has reached its target */
function isTimerExpired(t: TimerState): boolean {
  return getTimerElapsed(t) >= t.targetSeconds;
}

/** Get timers map with safe fallback (handles migration from old single-timer) */
function getTimers(state: GameProgressionState): ActiveTimersMap {
  if (!state.today.metadata.activeTimers) {
    state.today.metadata.activeTimers = {};
  }
  // Migrate old single activeTimer if present
  if (
    state.today.metadata.activeTimer &&
    !state.today.metadata.activeTimers[state.today.metadata.activeTimer.taskId]
  ) {
    const old = state.today.metadata.activeTimer;
    state.today.metadata.activeTimers[old.taskId] = {
      ...old,
      taskTitle: old.taskTitle ?? '',
      taskCategory: old.taskCategory ?? 'activity',
    };
    state.today.metadata.activeTimer = undefined;
  }
  return state.today.metadata.activeTimers;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultBehaviorMetrics: BehaviorMetrics = {
  dietCompletionRate: 0,
  activityCompletionRate: 0,
  stressCompletionRate: 0,
  overallCompletionRate: 0,
  adaptiveDifficulty: 5,
  preferredActions: [],
  frequentlyCompletedTasks: [],
  averageSessionLength: 0,
  photoLogFrequency: 0,
  journalFrequency: 0,
};

function emptyMetadata(): any {
  return {
    missedMorning: false,
    recoveryDaysRemaining: 0,
    activeTimer: undefined,
    activeTimers: {},
    eveningBoosterGenerated: false,
    nextDayTasksPreloaded: false,
  };
}

function emptyToday(): any {
  return {
    date: getDateString(),
    tasks: [],
    scores: { diet: 0, activity: 0, stress: 0 },
    targets: { diet: 100, activity: 100, stress: 100 },
    mode: 'standard' as GameMode,
    logs: [],
    boosterTaskCompleted: 0,
    metadata: emptyMetadata(),
    photoProofs: [],
  };
}

const initialState: GameProgressionState = {
  userProfile: {
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXPThreshold(1),
    name: getLevelTitle(1),
    totalXP: 0,
    totalDaysPlaying: 0,
    daysAtCurrentLevel: 0,
  },
  userIdentity: {},
  today: emptyToday(),
  todayPlan: null,
  history: [],
  streakData: { currentStreak: 0, longestStreak: 0, lastCompleteDay: null },
  behaviorMetrics: { ...defaultBehaviorMetrics },
  weeklyReports: [],
  levelInfo: [],
  onboarding: { currentStep: 'not_started', assessmentCompleted: false },
  smartReset: { shouldReset: false, missedDays: 0 },
  tokenBudget: {
    dailyLimit: TOKEN_CONFIG.DAILY_BUDGET,
    usedToday: 0,
    lastResetDate: getDateString(),
  },
  promptCache: [],
};

// ============================================================================
// SLICE
// ============================================================================

const gameProgressionSlice = createSlice({
  name: 'gameProgression',
  initialState,
  reducers: {
    initializeGame: (
      state,
      action: PayloadAction<Partial<GameProgressionState>>,
    ) => {
      Object.assign(state, action.payload);
      if (!state.today.metadata.activeTimers)
        state.today.metadata.activeTimers = {};
    },
    initializeAfterOnboarding: (
      state,
      action: PayloadAction<{
        level: number;
        mode: GameMode;
        fitnessLevel?: string;
      }>,
    ) => {
      const { level, mode, fitnessLevel } = action.payload;
      state.userProfile.level = level;
      state.userProfile.xpToNextLevel = calculateXPThreshold(level);
      state.userProfile.name = getLevelTitle(level);
      state.today.mode = mode;
      state.today.targets = calculateDailyTargets(level, mode);
      state.onboarding.currentStep = 'completed';
      state.onboarding.assessmentCompleted = true;
      state.onboarding.assessmentLevel = level;
      if (fitnessLevel) state.userIdentity.fitnessLevel = fitnessLevel as any;
    },
    setUserIdentity: (state, action: PayloadAction<Partial<UserIdentity>>) => {
      state.userIdentity = { ...state.userIdentity, ...action.payload };
    },
    setUserGameProfile: (
      state,
      action: PayloadAction<Partial<UserProfile>>,
    ) => {
      Object.assign(state.userProfile, action.payload);
    },
    setDailyTasks: (state, action: PayloadAction<GameTask[]>) => {
      state.today.tasks = action.payload;
    },
    setTodaysTasks: (state, action: PayloadAction<GameTask[]>) => {
      state.today.tasks = action.payload;
      state.tasks = action.payload as any;
    },
    setGenerationDate: (state, action: PayloadAction<string>) => {
      state.today.metadata.tasksGeneratedAt = action.payload;
      state.tasksGeneratedAt = action.payload;
    },
    setTasksGeneratedDate: (state, action: PayloadAction<string>) => {
      state.today.metadata.tasksGeneratedAt = action.payload;
      state.tasksGeneratedAt = action.payload;
    },
    setNextDayTasks: (state, action: PayloadAction<GameTask[]>) => {
      state.nextDayTasks = action.payload;
    },

    completeTask: (
      state,
      action: PayloadAction<{ taskId: string; proof?: TaskProof }>,
    ) => {
      const { taskId, proof } = action.payload;
      const task = state.today.tasks.find(t => t?.id === taskId);
      if (!task || task.isDone) return;
      task.isDone = true;
      task.status = 'completed';
      task.completedAt = Date.now();
      if (proof) task.proof = proof;
      const xp = safeNumber(task.coins, 10);
      state.today.logs.push({
        id: Date.now(),
        type: task.title ?? taskId,
        category: task.category,
        points: xp,
        completedAt: Date.now(),
        taskId,
        proof,
      });
      state.today.scores[task.category] = Math.min(
        100,
        safeNumber(state.today.scores[task.category]) + xp,
      );
      state.userProfile.xp += xp;
      state.userProfile.totalXP = safeNumber(state.userProfile.totalXP) + xp;
      handleLevelUp(state);
      // Clean up timer for this task
      const timers = getTimers(state);
      delete timers[taskId];
      // Store photo proof
      if (proof?.type === 'photo' && proof.uri) {
        state.today.photoProofs.push({
          taskId,
          uri: proof.uri,
          thumbnailUri: proof.thumbnailUri,
          category: task.category,
          aiAnalysis: proof.aiAnalysis,
          macros: proof.macros,
          capturedAt: Date.now(),
          validated: !!proof.aiAnalysis?.isValid,
        });
      }
    },

    logUserTask: (
      state,
      action: PayloadAction<{
        taskType: string;
        category: TaskCategory;
        points: number;
      }>,
    ) => {
      const { taskType, category, points } = action.payload;
      state.today.logs.push({
        id: Date.now(),
        type: taskType,
        category,
        points,
        completedAt: Date.now(),
      });
      state.today.scores[category] = Math.min(
        100,
        safeNumber(state.today.scores[category]) + points,
      );
      state.userProfile.xp += points;
      state.userProfile.totalXP =
        safeNumber(state.userProfile.totalXP) + points;
      handleLevelUp(state);
    },

    failIncompleteTasks: state => {
      state.today.tasks.forEach(t => {
        if (
          t &&
          !t.isDone &&
          t.status !== 'completed' &&
          t.status !== 'failed' &&
          t.status !== 'skipped'
        ) {
          t.status = 'failed';
          t.failedReason = 'Not completed by end of day';
        }
      });
      // Clear all timers at end of day
      state.today.metadata.activeTimers = {};
    },

    injectBoosterTasks: (state, action: PayloadAction<GameTask[]>) => {
      const existing = new Set(state.today.tasks.map(t => t?.id));
      action.payload.forEach(t => {
        if (t && !existing.has(t.id)) state.today.tasks.push(t);
      });
    },

    skipTask: (state, action: PayloadAction<string>) => {
      const task = state.today.tasks.find(t => t?.id === action.payload);
      if (task) {
        task.status = 'skipped';
        task.isDone = false;
      }
      const timers = getTimers(state);
      delete timers[action.payload];
    },

    unlogUserTask: (
      state,
      action: PayloadAction<{
        taskType: string;
        category: TaskCategory;
        points: number;
      }>,
    ) => {
      const { taskType, category, points } = action.payload;
      const idx = state.today.logs.findIndex(
        l => l.type === taskType && l.category === category,
      );
      if (idx !== -1) state.today.logs.splice(idx, 1);
      state.today.scores[category] = Math.max(
        0,
        safeNumber(state.today.scores[category]) - points,
      );
    },

    unlogTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      const task = state.today.tasks.find(t => t?.id === taskId);
      if (!task) return;
      task.isDone = false;
      task.status = 'available';
      task.completedAt = undefined;
      task.proof = undefined;
      const idx = state.today.logs.findIndex(l => l.taskId === taskId);
      if (idx !== -1) {
        const log = state.today.logs[idx];
        state.today.scores[task.category] = Math.max(
          0,
          safeNumber(state.today.scores[task.category]) -
            safeNumber(log?.points),
        );
        state.today.logs.splice(idx, 1);
      }
    },

    logBooster: (
      state,
      action: PayloadAction<
        | { key: string; points: number; category: TaskCategory; label: string }
        | string
      >,
    ) => {
      let key: string, points: number, category: TaskCategory;
      if (typeof action.payload === 'string') {
        key = action.payload;
        points = 10;
        category = 'stress';
      } else ({ key, points, category } = action.payload);
      state.today.logs.push({
        id: Date.now(),
        type: key,
        category,
        points,
        completedAt: Date.now(),
      });
      state.today.scores[category] = Math.min(
        100,
        safeNumber(state.today.scores[category]) + points,
      );
      state.today.boosterTaskCompleted =
        safeNumber(state.today.boosterTaskCompleted) + 1;
      state.userProfile.xp += points;
      state.userProfile.totalXP =
        safeNumber(state.userProfile.totalXP) + points;
      handleLevelUp(state);
    },

    // ========================================================================
    // MULTI-TIMER ACTIONS
    // ========================================================================

    /** Start a timer for a specific task (multiple can run concurrently) */
    startTaskTimer: (
      state,
      action: PayloadAction<{ taskId: string; targetSeconds: number }>,
    ) => {
      const { taskId, targetSeconds } = action.payload;
      const task = state.today.tasks.find(t => t?.id === taskId);
      if (!task) return;
      const now = Date.now();
      task.status = 'in_progress';
      task.startedAt = now;
      const timers = getTimers(state);
      timers[taskId] = {
        taskId,
        taskTitle: task.title ?? '',
        taskCategory: task.category,
        startedAt: now,
        targetSeconds: targetSeconds || task.seconds || 600,
        status: 'active',
        totalPausedTime: 0,
        lastForegroundAt: now,
      };
    },

    /** Pause a specific timer by taskId */
    pauseTaskTimer: (state, action: PayloadAction<string>) => {
      const timers = getTimers(state);
      const t = timers[action.payload];
      if (!t || t.status !== 'active') return;
      t.status = 'paused';
      t.pausedAt = Date.now();
    },

    /** Resume a specific timer by taskId */
    resumeTaskTimer: (state, action: PayloadAction<string>) => {
      const timers = getTimers(state);
      const t = timers[action.payload];
      if (!t || t.status !== 'paused' || !t.pausedAt) return;
      const now = Date.now();
      t.totalPausedTime += now - t.pausedAt;
      t.status = 'active';
      t.pausedAt = undefined;
      t.lastForegroundAt = now;
    },

    /** Clear a specific timer by taskId */
    clearTaskTimer: (state, action: PayloadAction<string>) => {
      const timers = getTimers(state);
      delete timers[action.payload];
    },

    /** Update ALL timers on foreground — marks expired ones */
    updateTimersOnForeground: state => {
      const timers = getTimers(state);
      const now = Date.now();
      Object.values(timers).forEach(t => {
        if (t.status !== 'active') return;
        t.lastForegroundAt = now;
        const elapsed = (now - t.startedAt - t.totalPausedTime) / 1000;
        if (elapsed >= t.targetSeconds) {
          t.status = 'expired'; // Not 'completed' — user needs to confirm
          const task = state.today.tasks.find(tk => tk?.id === t.taskId);
          if (task && task.status === 'in_progress') {
            task.status = 'waiting_completion';
          }
        }
      });
    },

    /** Handle user's decision on an expired timer */
    reconcileExpiredTimer: (
      state,
      action: PayloadAction<{
        taskId: string;
        decision: ExpiredTimerAction;
        replacementTask?: GameTask;
      }>,
    ) => {
      const { taskId, decision, replacementTask } = action.payload;
      const timers = getTimers(state);
      const timer = timers[taskId];
      const task = state.today.tasks.find(t => t?.id === taskId);

      switch (decision) {
        case 'mark_done': {
          // User confirms they did it — complete the task
          if (task && !task.isDone) {
            task.isDone = true;
            task.status = 'completed';
            task.completedAt = Date.now();
            task.proof = {
              type: 'timer',
              playDuration: timer?.targetSeconds ?? task.seconds ?? 0,
              completionPercentage: 100,
              submittedAt: Date.now(),
            };
            const xp = safeNumber(task.coins, 10);
            state.today.logs.push({
              id: Date.now(),
              type: task.title ?? taskId,
              category: task.category,
              points: xp,
              completedAt: Date.now(),
              taskId,
            });
            state.today.scores[task.category] = Math.min(
              100,
              safeNumber(state.today.scores[task.category]) + xp,
            );
            state.userProfile.xp += xp;
            state.userProfile.totalXP =
              safeNumber(state.userProfile.totalXP) + xp;
            handleLevelUp(state);
          }
          delete timers[taskId];
          break;
        }
        case 'restart': {
          // Restart the timer from scratch
          if (task) {
            task.status = 'in_progress';
            task.startedAt = Date.now();
          }
          const now = Date.now();
          timers[taskId] = {
            taskId,
            taskTitle: timer?.taskTitle ?? task?.title ?? '',
            taskCategory: timer?.taskCategory ?? task?.category ?? 'activity',
            startedAt: now,
            targetSeconds: timer?.targetSeconds ?? task?.seconds ?? 600,
            status: 'active',
            totalPausedTime: 0,
            lastForegroundAt: now,
          };
          break;
        }
        case 'replace': {
          // Mark old task as skipped, inject replacement
          if (task) {
            task.status = 'skipped';
            task.failedReason = 'Replaced with evening task';
          }
          delete timers[taskId];
          if (replacementTask) {
            const exists = state.today.tasks.some(
              t => t?.id === replacementTask.id,
            );
            if (!exists) state.today.tasks.push(replacementTask);
          }
          break;
        }
        case 'skip': {
          if (task) {
            task.status = 'skipped';
            task.failedReason = 'Skipped after timer expired';
          }
          delete timers[taskId];
          break;
        }
      }
    },

    // ========================================================================
    // BACKWARD-COMPAT: old single-timer actions (no-op if using multi-timer)
    // ========================================================================
    /** @deprecated — use updateTimersOnForeground */
    updateTimerOnForeground: state => {
      // Delegate to multi-timer version
      const timers = getTimers(state);
      const now = Date.now();
      Object.values(timers).forEach(t => {
        if (t.status !== 'active') return;
        t.lastForegroundAt = now;
        const elapsed = (now - t.startedAt - t.totalPausedTime) / 1000;
        if (elapsed >= t.targetSeconds) {
          t.status = 'expired';
          const task = state.today.tasks.find(tk => tk?.id === t.taskId);
          if (task && task.status === 'in_progress')
            task.status = 'waiting_completion';
        }
      });
    },

    // ========================================================================
    // DAY MANAGEMENT
    // ========================================================================

    completeDay: state => {
      const lastLoggedDate =
        state.history.length > 0
          ? state.history[state.history.length - 1]?.date
          : undefined;
      getMissedDays(state.today.date, lastLoggedDate).forEach(missedDate => {
        state.history.push({
          date: missedDate,
          mode: null,
          tasksGenerated: 0,
          tasksCompleted: 0,
          completionRate: 0,
          scores: { diet: 0, activity: 0, stress: 0 },
          totalXPEarned: 0,
          streak: 0,
          photosLogged: 0,
        });
      });
      const { diet, activity, stress } = state.today.scores;
      const dayAverage =
        (safeNumber(diet) + safeNumber(activity) + safeNumber(stress)) / 3;
      const completed = state.today.tasks.filter(
        t => t?.isDone || t?.status === 'completed',
      ).length;
      const total = state.today.tasks.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      if (dayAverage >= 80) {
        state.userProfile.xp += XP_CONFIG.PERFECT_DAY_BONUS;
        state.userProfile.totalXP =
          safeNumber(state.userProfile.totalXP) + XP_CONFIG.PERFECT_DAY_BONUS;
        handleLevelUp(state);
      }
      const photosLogged = (state.today.photoProofs ?? []).length;
      const macroProofs = (state.today.photoProofs ?? []).filter(
        p => p?.macros,
      );
      const totalMacros: MacroData | undefined =
        macroProofs.length > 0
          ? {
              calories: macroProofs.reduce(
                (s, p) => s + safeNumber(p.macros?.calories),
                0,
              ),
              protein: macroProofs.reduce(
                (s, p) => s + safeNumber(p.macros?.protein),
                0,
              ),
              carbs: macroProofs.reduce(
                (s, p) => s + safeNumber(p.macros?.carbs),
                0,
              ),
              fats: macroProofs.reduce(
                (s, p) => s + safeNumber(p.macros?.fats),
                0,
              ),
            }
          : undefined;
      const totalXPEarned = state.today.logs.reduce(
        (s, l) => s + safeNumber(l?.points),
        0,
      );
      const taskDetails = state.today.tasks.map(t => ({
        id: t.id,
        title: t.title ?? '',
        category: t.category,
        status: (t.status ?? (t.isDone ? 'completed' : 'available')) as any,
        completedAt: t.completedAt,
        failedReason: t.failedReason,
        proof: t.proof,
      }));
      state.history.push({
        date: state.today.date,
        mode: state.today.mode,
        tasksGenerated: total,
        tasksCompleted: completed,
        completionRate,
        scores: { ...state.today.scores },
        totalXPEarned,
        streak: completionRate >= 80 ? state.streakData.currentStreak + 1 : 0,
        photosLogged,
        totalMacros,
        average: dayAverage,
        photoProofs: state.today.photoProofs?.length
          ? [...state.today.photoProofs]
          : undefined,
        taskDetails,
      });
      if (state.history.length > 30) state.history.shift();
      if (completionRate >= 80) {
        state.streakData.currentStreak++;
        state.streakData.longestStreak = Math.max(
          state.streakData.longestStreak,
          state.streakData.currentStreak,
        );
        state.streakData.lastCompleteDay = state.today.date;
      } else if (completionRate < 60) {
        state.streakData.currentStreak = 0;
      }
      if (state.streak !== undefined)
        state.streak = state.streakData.currentStreak;
      updateBehaviorMetrics(state);
      const nextPlan = determineNextMode(state);
      state.todayPlan = nextPlan;
      state.userProfile.daysAtCurrentLevel =
        safeNumber(state.userProfile.daysAtCurrentLevel) + 1;
      state.userProfile.totalDaysPlaying =
        safeNumber(state.userProfile.totalDaysPlaying) + 1;
      state.userIdentity.lastActiveAt = new Date().toISOString();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const preloadedTasks = state.nextDayTasks?.length
        ? state.nextDayTasks
        : [];
      state.today = {
        date: tomorrowStr,
        tasks: preloadedTasks,
        scores: { diet: 0, activity: 0, stress: 0 },
        targets: calculateDailyTargets(state.userProfile.level, nextPlan.mode),
        mode: nextPlan.mode,
        logs: [],
        boosterTaskCompleted: 0,
        metadata: {
          ...emptyMetadata(),
          recoveryDaysRemaining: Math.max(
            0,
            safeNumber(state.today.metadata.recoveryDaysRemaining) - 1,
          ),
          nextDayTasksPreloaded: preloadedTasks.length > 0,
          tasksGeneratedAt: preloadedTasks.length > 0 ? tomorrowStr : undefined,
        },
        photoProofs: [],
      };
      state.tasks = preloadedTasks as any;
      state.tasksGeneratedAt =
        preloadedTasks.length > 0 ? tomorrowStr : undefined;
      state.nextDayTasks = undefined;
    },

    setMode: (state, action: PayloadAction<GameMode>) => {
      state.today.mode = action.payload;
      state.today.targets = calculateDailyTargets(
        state.userProfile.level,
        action.payload,
      );
    },
    activateRecoveryMode: (
      state,
      action: PayloadAction<{ missedDays: number }>,
    ) => {
      const { missedDays } = action.payload;
      if (missedDays >= 7) {
        state.today.mode = 'rehab';
        state.today.metadata.recoveryDaysRemaining = 5;
      } else if (missedDays >= 1) {
        state.today.mode = 'recovery';
        state.today.metadata.recoveryDaysRemaining = 3;
      }
    },
    markMorningMissed: state => {
      state.today.metadata.missedMorning = true;
    },
    markEveningBoosterGenerated: state => {
      state.today.metadata.eveningBoosterGenerated = true;
    },
    addWeeklyReport: (state, action: PayloadAction<WeeklyReport>) => {
      state.weeklyReports.unshift(action.payload);
      if (state.weeklyReports.length > 12) state.weeklyReports.pop();
    },
    resetGame: () => initialState,
    updateBehaviorMetricsAction: (
      state,
      action: PayloadAction<Partial<BehaviorMetrics>>,
    ) => {
      state.behaviorMetrics = { ...state.behaviorMetrics, ...action.payload };
    },
    recordTokenUsage: (
      state,
      action: PayloadAction<{ tokens: number; type: string }>,
    ) => {
      resetTokenBudgetIfNeeded(state);
      state.tokenBudget.usedToday += action.payload.tokens;
    },
    cachePromptResponse: (
      state,
      action: PayloadAction<{
        key: string;
        response: string;
        tokensSaved: number;
      }>,
    ) => {
      const { key, response, tokensSaved } = action.payload;
      const now = Date.now();
      cleanExpiredCache(state);
      state.promptCache = state.promptCache.filter(e => e.key !== key);
      state.promptCache.push({
        key,
        response,
        tokensSaved,
        createdAt: now,
        expiresAt: now + TOKEN_CONFIG.CACHE_TTL_HOURS * 60 * 60 * 1000,
      });
      if (state.promptCache.length > 50) state.promptCache.shift();
    },

    ensureTodayIsCurrent: state => {
      const today = getDateString();
      if (state.today.date === today) return;
      const missedCount = getMissedDays(today, state.today.date).length;
      if (state.today.logs.length > 0) {
        const completed = state.today.tasks.filter(
          t => t?.isDone || t?.status === 'completed',
        ).length;
        const total = state.today.tasks.length;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        const { diet, activity, stress } = state.today.scores;
        const dayAvg =
          (safeNumber(diet) + safeNumber(activity) + safeNumber(stress)) / 3;
        const taskDetails = state.today.tasks.map(t => ({
          id: t.id,
          title: t.title ?? '',
          category: t.category,
          status: (t.status ?? (t.isDone ? 'completed' : 'available')) as any,
          completedAt: t.completedAt,
          failedReason: t.failedReason,
          proof: t.proof,
        }));
        state.history.push({
          date: state.today.date,
          mode: state.today.mode,
          tasksGenerated: total,
          tasksCompleted: completed,
          completionRate: rate,
          scores: { ...state.today.scores },
          totalXPEarned: state.today.logs.reduce(
            (s, l) => s + safeNumber(l?.points),
            0,
          ),
          streak: rate >= 80 ? state.streakData.currentStreak + 1 : 0,
          photosLogged: (state.today.photoProofs ?? []).length,
          average: dayAvg,
          taskDetails,
          photoProofs: state.today.photoProofs?.length
            ? [...state.today.photoProofs]
            : undefined,
        });
        if (state.history.length > 30) state.history.shift();
        if (rate >= 80) {
          state.streakData.currentStreak++;
          state.streakData.longestStreak = Math.max(
            state.streakData.longestStreak,
            state.streakData.currentStreak,
          );
        } else if (rate < 60) {
          state.streakData.currentStreak = 0;
        }
        updateBehaviorMetrics(state);
      }
      const resetInfo = determineSmartReset(state, missedCount);
      state.smartReset = resetInfo;
      let newMode: GameMode = resetInfo.recoveryPlan?.targetMode ?? 'standard';
      if (missedCount === 0) newMode = state.todayPlan?.mode ?? 'standard';
      const preloadedTasks = state.nextDayTasks?.length
        ? state.nextDayTasks
        : [];
      state.today = {
        date: today,
        tasks: preloadedTasks,
        scores: { diet: 0, activity: 0, stress: 0 },
        targets: calculateDailyTargets(state.userProfile.level, newMode),
        mode: newMode,
        logs: [],
        boosterTaskCompleted: 0,
        metadata: {
          ...emptyMetadata(),
          recoveryDaysRemaining:
            resetInfo.recoveryPlan?.duration ??
            (newMode === 'rehab' ? 5 : newMode === 'recovery' ? 3 : 0),
          nextDayTasksPreloaded: preloadedTasks.length > 0,
          tasksGeneratedAt: preloadedTasks.length > 0 ? today : undefined,
        },
        photoProofs: [],
      };
      state.tasks = preloadedTasks as any;
      state.tasksGeneratedAt = preloadedTasks.length > 0 ? today : undefined;
      state.nextDayTasks = undefined;
      resetTokenBudgetIfNeeded(state);
      cleanExpiredCache(state);
      state.userIdentity.lastActiveAt = new Date().toISOString();
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  initializeGame,
  initializeAfterOnboarding,
  setUserIdentity,
  setUserGameProfile,
  setDailyTasks,
  setTodaysTasks,
  setGenerationDate,
  setTasksGeneratedDate,
  setNextDayTasks,
  completeTask,
  logUserTask,
  failIncompleteTasks,
  injectBoosterTasks,
  skipTask,
  unlogUserTask,
  unlogTask,
  logBooster,
  startTaskTimer,
  pauseTaskTimer,
  resumeTaskTimer,
  updateTimersOnForeground,
  updateTimerOnForeground,
  clearTaskTimer,
  reconcileExpiredTimer,
  completeDay,
  setMode,
  activateRecoveryMode,
  markMorningMissed,
  markEveningBoosterGenerated,
  addWeeklyReport,
  resetGame,
  updateBehaviorMetricsAction,
  ensureTodayIsCurrent,
  recordTokenUsage,
  cachePromptResponse,
} = gameProgressionSlice.actions;

export default gameProgressionSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

export const gameSelectors = {
  selectUserProfile: (state: any): UserProfile =>
    state?.game?.userProfile ?? initialState.userProfile,
  selectUserIdentity: (state: any): UserIdentity =>
    state?.game?.userIdentity ?? initialState.userIdentity,
  selectTodaysTasks: (state: any): GameTask[] =>
    state?.game?.today?.tasks ?? [],
  selectTodaysScores: (state: any): DayScores =>
    state?.game?.today?.scores ?? { diet: 0, activity: 0, stress: 0 },
  selectTodaysMode: (state: any): GameMode =>
    state?.game?.today?.mode ?? 'standard',
  selectTodaysLogs: (state: any): TaskLogEntry[] =>
    state?.game?.today?.logs ?? [],
  selectStreakData: (state: any) =>
    state?.game?.streakData ?? initialState.streakData,
  selectBehaviorMetrics: (state: any): BehaviorMetrics =>
    state?.game?.behaviorMetrics ?? defaultBehaviorMetrics,
  selectHistory: (state: any): DayRecord[] => state?.game?.history ?? [],
  selectWeeklyReports: (state: any): WeeklyReport[] =>
    state?.game?.weeklyReports ?? [],
  selectLevelInfo: (state: any): UserProfile[] => state?.game?.levelInfo ?? [],
  selectTodayPlan: (state: any) => state?.game?.todayPlan,
  selectTasksGeneratedDate: (state: any) =>
    state?.game?.today?.metadata?.tasksGeneratedAt ??
    state?.game?.tasksGeneratedAt,
  selectBoosterCompleted: (state: any) =>
    state?.game?.today?.boosterTaskCompleted ?? 0,
  selectOnboarding: (state: any) =>
    state?.game?.onboarding ?? initialState.onboarding,
  selectTodayMetadata: (state: any) =>
    state?.game?.today?.metadata ?? initialState.today.metadata,
  selectNextDayTasks: (state: any) => state?.game?.nextDayTasks,
  selectStreak: (state: any) => state?.game?.streakData?.currentStreak ?? 0,
  selectLegacyTasks: (state: any): GameTask[] =>
    state?.game?.tasks ?? state?.game?.today?.tasks ?? [],
  selectSmartReset: (state: any): SmartResetInfo =>
    state?.game?.smartReset ?? initialState.smartReset,
  selectTokenBudget: (state: any): TokenBudget =>
    state?.game?.tokenBudget ?? initialState.tokenBudget,
  selectPhotoProofs: (state: any): PhotoProofEntry[] =>
    state?.game?.today?.photoProofs ?? [],
  selectTodayMacroTotals: (state: any): MacroData => {
    const proofs: PhotoProofEntry[] = state?.game?.today?.photoProofs ?? [];
    const w = proofs.filter(p => p?.macros);
    if (w.length === 0) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return {
      calories: w.reduce((s, p) => s + safeNumber(p.macros?.calories), 0),
      protein: w.reduce((s, p) => s + safeNumber(p.macros?.protein), 0),
      carbs: w.reduce((s, p) => s + safeNumber(p.macros?.carbs), 0),
      fats: w.reduce((s, p) => s + safeNumber(p.macros?.fats), 0),
    };
  },
  selectCompletionRate: (state: any) => {
    const tasks: GameTask[] = state?.game?.today?.tasks ?? [];
    const active = tasks.filter(t => t?.status !== 'failed');
    const completed = active.filter(
      t => t?.isDone || t?.status === 'completed',
    ).length;
    return active.length > 0 ? completed / active.length : 0;
  },

  // ======== MULTI-TIMER SELECTORS ========

  /** Get ALL active timers map */
  selectActiveTimers: (state: any): ActiveTimersMap => {
    return state?.game?.today?.metadata?.activeTimers ?? {};
  },

  /** Get timer for a specific task */
  selectTimerForTask: (state: any, taskId: string): TimerState | undefined => {
    return state?.game?.today?.metadata?.activeTimers?.[taskId];
  },

  /** Get count of running timers */
  selectRunningTimerCount: (state: any): number => {
    const timers: ActiveTimersMap =
      state?.game?.today?.metadata?.activeTimers ?? {};
    return Object.values(timers).filter(
      t => t.status === 'active' || t.status === 'paused',
    ).length;
  },

  /** Get all expired timers (need user reconciliation) */
  selectExpiredTimers: (state: any): ExpiredTimerInfo[] => {
    const timers: ActiveTimersMap =
      state?.game?.today?.metadata?.activeTimers ?? {};
    return Object.values(timers)
      .filter(t => t.status === 'expired')
      .map(t => ({
        taskId: t.taskId,
        taskTitle: t.taskTitle,
        taskCategory: t.taskCategory,
        targetSeconds: t.targetSeconds,
        elapsedSeconds: getTimerElapsed(t),
        expiredAt: t.startedAt + t.targetSeconds * 1000 + t.totalPausedTime,
      }));
  },

  /** Get elapsed seconds for a specific timer */
  selectTimerElapsed: (state: any, taskId?: string): number => {
    if (taskId) {
      const t: TimerState | undefined =
        state?.game?.today?.metadata?.activeTimers?.[taskId];
      if (!t) return 0;
      return getTimerElapsed(t);
    }
    // Backward compat: return first active timer's elapsed
    const timers: ActiveTimersMap =
      state?.game?.today?.metadata?.activeTimers ?? {};
    const first = Object.values(timers).find(t => t.status === 'active');
    return first ? getTimerElapsed(first) : 0;
  },

  /** Get remaining seconds for a specific timer */
  selectTimerRemaining: (state: any, taskId?: string): number => {
    if (taskId) {
      const t: TimerState | undefined =
        state?.game?.today?.metadata?.activeTimers?.[taskId];
      if (!t) return 0;
      return Math.max(0, t.targetSeconds - getTimerElapsed(t));
    }
    const timers: ActiveTimersMap =
      state?.game?.today?.metadata?.activeTimers ?? {};
    const first = Object.values(timers).find(t => t.status === 'active');
    return first
      ? Math.max(0, first.targetSeconds - getTimerElapsed(first))
      : 0;
  },

  /** Backward compat: select first active timer */
  selectActiveTimer: (state: any): TimerState | undefined => {
    const timers: ActiveTimersMap =
      state?.game?.today?.metadata?.activeTimers ?? {};
    return Object.values(timers).find(
      t => t.status === 'active' || t.status === 'paused',
    );
  },

  selectRemainingTokenBudget: (state: any): number => {
    const b: TokenBudget = state?.game?.tokenBudget ?? initialState.tokenBudget;
    return Math.max(0, b.dailyLimit - b.usedToday);
  },
};
