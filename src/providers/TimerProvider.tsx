// ============================================================================
// TIMER PROVIDER
// ============================================================================
// Wraps the app to manage all concurrent task timers.
//
// Features:
//  - Multiple timers running simultaneously (e.g. "no sugar 3hr" + "walk 10 min")
//  - Persists via Redux (MMKV) — survives app kill
//  - On foreground: detects expired timers, shows reconciliation sheet
//  - Single 1-second tick interval for ALL timers
//  - Any screen can start/pause/resume via context or dispatch
// ============================================================================

import {
  ActiveTimersMap,
  ExpiredTimerAction,
  ExpiredTimerInfo,
  GameTask,
  TaskProof,
  TimerState,
} from '@/lib/types/game-progression.types';
import {
  clearTaskTimer,
  completeTask,
  gameSelectors,
  pauseTaskTimer,
  reconcileExpiredTimer,
  resumeTaskTimer,
  startTaskTimer,
  updateTimersOnForeground,
} from '@/services/mmkv-redux/slices/gameProgressionSlice';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ============================================================================
// CONTEXT TYPE
// ============================================================================

export interface TimerContextType {
  /** Start a timer for a task (can have multiple running) */
  startTimer: (taskId: string, targetSeconds: number) => void;
  /** Pause a specific timer */
  pauseTimer: (taskId: string) => void;
  /** Resume a specific timer */
  resumeTimer: (taskId: string) => void;
  /** Stop and clear a timer without completing */
  cancelTimer: (taskId: string) => void;
  /** Complete a timed task with proof */
  finishTimer: (taskId: string, proof?: TaskProof) => void;
  /** Get state for a specific timer */
  getTimerState: (taskId: string) => TimerState | undefined;
  /** Get elapsed seconds for a timer */
  getElapsed: (taskId: string) => number;
  /** Get remaining seconds for a timer */
  getRemaining: (taskId: string) => number;
  /** All active timers */
  activeTimers: ActiveTimersMap;
  /** Count of running timers */
  runningCount: number;
  /** Expired timers pending user decision */
  expiredTimers: ExpiredTimerInfo[];
  /** Whether reconciliation sheet is visible */
  isReconciling: boolean;
  /** Handle user decision on expired timer */
  handleExpiredDecision: (
    taskId: string,
    decision: ExpiredTimerAction,
    replacementTask?: GameTask,
  ) => void;
  /** Dismiss reconciliation (user dealt with all expired timers) */
  dismissReconciliation: () => void;
  /** Force-tick — recalculate all timer states (for UI refresh) */
  tick: number;
}

const TimerContext = createContext<TimerContextType | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function useTimerContext(): TimerContextType {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimerContext must be used within <TimerProvider>');
  }
  return ctx;
}

/** Convenience hook: get timer info for a specific task */
export function useTaskTimer(taskId: string) {
  const ctx = useTimerContext();
  const timer = ctx.getTimerState(taskId);

  return {
    timer,
    isRunning: timer?.status === 'active',
    isPaused: timer?.status === 'paused',
    isExpired: timer?.status === 'expired',
    isCompleted: timer?.status === 'completed',
    elapsed: ctx.getElapsed(taskId),
    remaining: ctx.getRemaining(taskId),
    start: (seconds: number) => ctx.startTimer(taskId, seconds),
    pause: () => ctx.pauseTimer(taskId),
    resume: () => ctx.resumeTimer(taskId),
    cancel: () => ctx.cancelTimer(taskId),
    finish: (proof?: TaskProof) => ctx.finishTimer(taskId, proof),
  };
}

// ============================================================================
// TIMER MATH (pure functions, no Redux)
// ============================================================================

function computeElapsed(t: TimerState): number {
  if (!t || t.status === 'idle') return 0;
  if (t.status === 'completed' || t.status === 'expired')
    return t.targetSeconds;
  const now = Date.now();
  const pauseExtra = t.status === 'paused' && t.pausedAt ? now - t.pausedAt : 0;
  return Math.max(
    0,
    Math.floor((now - t.startedAt - t.totalPausedTime - pauseExtra) / 1000),
  );
}

function computeRemaining(t: TimerState): number {
  if (!t) return 0;
  return Math.max(0, t.targetSeconds - computeElapsed(t));
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface TimerProviderProps {
  children: React.ReactNode;
  /** Tick interval in ms (default 1000) */
  tickInterval?: number;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  tickInterval = 1000,
}) => {
  const dispatch = useDispatch();

  // Redux state
  const activeTimers: ActiveTimersMap = useSelector(
    gameSelectors.selectActiveTimers,
  );
  const expiredTimersFromRedux: ExpiredTimerInfo[] = useSelector(
    gameSelectors.selectExpiredTimers,
  );

  // Local state
  const [tick, setTick] = useState(0);
  const [isReconciling, setIsReconciling] = useState(false);
  const [pendingExpired, setPendingExpired] = useState<ExpiredTimerInfo[]>([]);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ========================================================================
  // TICK INTERVAL — drives all timer UI updates
  // ========================================================================

  const hasActiveTimers = useMemo(() => {
    return Object.values(activeTimers).some(
      t => t.status === 'active' || t.status === 'paused',
    );
  }, [activeTimers]);

  useEffect(() => {
    if (hasActiveTimers) {
      // Start ticking
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setTick(prev => prev + 1);
          // Update Redux timer states (check for newly expired)
          dispatch(updateTimersOnForeground());
        }, tickInterval);
      }
    } else {
      // No active timers — stop ticking to save battery
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasActiveTimers, tickInterval, dispatch]);

  // ========================================================================
  // APP STATE LISTENER — reconcile on foreground
  // ========================================================================

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          // App came to foreground — check expired timers
          console.log('[TimerProvider] App foregrounded, reconciling timers');
          dispatch(updateTimersOnForeground());
          // Small delay to let Redux update
          setTimeout(() => {
            checkForExpiredTimers();
          }, 200);
        }
        appState.current = nextState;
      },
    );

    return () => subscription.remove();
  }, [dispatch]);

  // ========================================================================
  // EXPIRED TIMER DETECTION
  // ========================================================================

  const checkForExpiredTimers = useCallback(() => {
    // Read fresh from Redux via selector won't work in callback,
    // so we rely on the subscription to expiredTimersFromRedux
  }, []);

  // Watch for newly expired timers from Redux
  useEffect(() => {
    if (expiredTimersFromRedux.length > 0 && !isReconciling) {
      setPendingExpired(expiredTimersFromRedux);
      setIsReconciling(true);
    }
  }, [expiredTimersFromRedux, isReconciling]);

  // ========================================================================
  // ACTIONS
  // ========================================================================

  const startTimerAction = useCallback(
    (taskId: string, targetSeconds: number) => {
      dispatch(startTaskTimer({ taskId, targetSeconds }));
    },
    [dispatch],
  );

  const pauseTimerAction = useCallback(
    (taskId: string) => {
      dispatch(pauseTaskTimer(taskId));
    },
    [dispatch],
  );

  const resumeTimerAction = useCallback(
    (taskId: string) => {
      dispatch(resumeTaskTimer(taskId));
    },
    [dispatch],
  );

  const cancelTimerAction = useCallback(
    (taskId: string) => {
      dispatch(clearTaskTimer(taskId));
    },
    [dispatch],
  );

  const finishTimerAction = useCallback(
    (taskId: string, proof?: TaskProof) => {
      const timer = activeTimers[taskId];
      const finalProof: TaskProof = proof ?? {
        type: 'timer',
        playDuration: timer ? computeElapsed(timer) : 0,
        completionPercentage: timer
          ? Math.min(
              100,
              Math.round((computeElapsed(timer) / timer.targetSeconds) * 100),
            )
          : 100,
        submittedAt: Date.now(),
      };
      dispatch(completeTask({ taskId, proof: finalProof }));
    },
    [dispatch, activeTimers],
  );

  const getTimerState = useCallback(
    (taskId: string): TimerState | undefined => {
      return activeTimers[taskId];
    },
    [activeTimers],
  );

  const getElapsed = useCallback(
    (taskId: string): number => {
      const t = activeTimers[taskId];
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      tick; // Reference tick to trigger re-render
      return t ? computeElapsed(t) : 0;
    },
    [activeTimers, tick],
  );

  const getRemaining = useCallback(
    (taskId: string): number => {
      const t = activeTimers[taskId];
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      tick;
      return t ? computeRemaining(t) : 0;
    },
    [activeTimers, tick],
  );

  const handleExpiredDecision = useCallback(
    (
      taskId: string,
      decision: ExpiredTimerAction,
      replacementTask?: GameTask,
    ) => {
      dispatch(reconcileExpiredTimer({ taskId, decision, replacementTask }));
      // Remove from pending list
      setPendingExpired(prev => prev.filter(e => e.taskId !== taskId));
    },
    [dispatch],
  );

  const dismissReconciliation = useCallback(() => {
    setIsReconciling(false);
    setPendingExpired([]);
  }, []);

  // ========================================================================
  // RUNNING COUNT
  // ========================================================================

  const runningCount = useMemo(() => {
    return Object.values(activeTimers).filter(
      t => t.status === 'active' || t.status === 'paused',
    ).length;
  }, [activeTimers]);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const contextValue = useMemo<TimerContextType>(
    () => ({
      startTimer: startTimerAction,
      pauseTimer: pauseTimerAction,
      resumeTimer: resumeTimerAction,
      cancelTimer: cancelTimerAction,
      finishTimer: finishTimerAction,
      getTimerState,
      getElapsed,
      getRemaining,
      activeTimers,
      runningCount,
      expiredTimers: pendingExpired,
      isReconciling,
      handleExpiredDecision,
      dismissReconciliation,
      tick,
    }),
    [
      startTimerAction,
      pauseTimerAction,
      resumeTimerAction,
      cancelTimerAction,
      finishTimerAction,
      getTimerState,
      getElapsed,
      getRemaining,
      activeTimers,
      runningCount,
      pendingExpired,
      isReconciling,
      handleExpiredDecision,
      dismissReconciliation,
      tick,
    ],
  );

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};

export default TimerProvider;
