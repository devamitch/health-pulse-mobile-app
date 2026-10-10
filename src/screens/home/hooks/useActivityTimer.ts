/**
 * useActivityTimer Hook
 *
 * Simple timer hook for activity scanning
 * NO worklets-core required
 * Uses react-native-reanimated ONLY for smooth animations
 */

import { TaskData } from '@/navigation/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

console.log('[useActivityTimer] Hook module loaded');

// ============================================================================
// TYPES
// ============================================================================

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  isComplete: boolean;
  timeRemaining: number;
  timeElapsed: number;
  progress: number; // 0-100
}

export interface UseActivityTimerReturn {
  // State
  timerState: TimerState;

  // Controls
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;

  // Animated values (for smooth UI)
  timerPulse: Animated.SharedValue<number>;
  progressAnim: Animated.SharedValue<number>;

  // Animated styles
  timerPulseStyle: any;
  progressAnimStyle: any;

  // Utilities
  formatTime: (seconds: number) => string;
}

// ============================================================================
// HOOK
// ============================================================================

interface UseActivityTimerProps {
  task: TaskData;
  duration: number; // in seconds
  onComplete: () => void;
  onTick?: (timeRemaining: number) => void;
}

export const useActivityTimer = ({
  task,
  duration,
  onComplete,
  onTick,
}: UseActivityTimerProps): UseActivityTimerReturn => {
  console.log('[useActivityTimer] Hook initialized for task:', task.title);
  console.log('[useActivityTimer] Duration:', duration);

  // ============================================================================
  // STATE
  // ============================================================================

  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    isComplete: false,
    timeRemaining: duration,
    timeElapsed: 0,
    progress: 0,
  });

  // ============================================================================
  // REFS
  // ============================================================================

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ============================================================================
  // ANIMATED VALUES (Reanimated)
  // ============================================================================

  const timerPulse = useSharedValue(1);
  const progressAnim = useSharedValue(0);

  // ============================================================================
  // ANIMATED STYLES
  // ============================================================================

  const timerPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerPulse.value }],
  }));

  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  // ============================================================================
  // APP STATE HANDLING (auto-pause on background)
  // ============================================================================

  useEffect(() => {
    console.log('[useActivityTimer] Setting up app state listener');

    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log(
        '[useActivityTimer] App state changed:',
        appStateRef.current,
        '->',
        nextAppState,
      );

      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background
        if (timerState.isActive && !timerState.isPaused) {
          console.log(
            '[useActivityTimer] App backgrounded - auto-pausing timer',
          );
          pauseTimer();
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      console.log('[useActivityTimer] Removing app state listener');
      subscription.remove();
    };
  }, [timerState.isActive, timerState.isPaused]);

  // ============================================================================
  // TIMER LOGIC
  // ============================================================================

  useEffect(() => {
    console.log(
      '[useActivityTimer] Timer effect - isActive:',
      timerState.isActive,
      'isPaused:',
      timerState.isPaused,
    );

    if (timerState.isActive && !timerState.isPaused && !timerState.isComplete) {
      console.log('[useActivityTimer] Starting timer interval');

      // Pulse animation when active
      timerPulse.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );

      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          const newTimeElapsed = prev.timeElapsed + 1;
          const newProgress = (newTimeElapsed / duration) * 100;

          console.log(
            '[useActivityTimer] Tick - remaining:',
            newTimeRemaining,
            'elapsed:',
            newTimeElapsed,
          );

          // Update progress animation
          progressAnim.value = withSpring(newProgress, {
            damping: 15,
            stiffness: 100,
          });

          // Call onTick callback
          onTick?.(newTimeRemaining);

          // Check completion
          if (newTimeRemaining <= 0) {
            console.log('[useActivityTimer] Timer completed!');

            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }

            // Stop pulse animation
            timerPulse.value = withSpring(1);

            // Call completion callback
            setTimeout(() => onComplete(), 100);

            return {
              ...prev,
              timeRemaining: 0,
              timeElapsed: duration,
              progress: 100,
              isComplete: true,
              isActive: false,
            };
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            timeElapsed: newTimeElapsed,
            progress: newProgress,
          };
        });
      }, 1000);
    } else {
      // Stop pulse when paused/inactive
      timerPulse.value = withSpring(1);
    }

    return () => {
      if (timerIntervalRef.current) {
        console.log('[useActivityTimer] Clearing timer interval');
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [
    timerState.isActive,
    timerState.isPaused,
    timerState.isComplete,
    duration,
    onComplete,
    onTick,
  ]);

  // ============================================================================
  // CONTROLS
  // ============================================================================

  const startTimer = useCallback(() => {
    console.log('[useActivityTimer] startTimer called');

    startTimeRef.current = Date.now();

    setTimerState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    console.log('[useActivityTimer] pauseTimer called');

    pausedTimeRef.current = Date.now();

    setTimerState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    console.log('[useActivityTimer] resumeTimer called');

    setTimerState(prev => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    console.log('[useActivityTimer] stopTimer called');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    console.log('[useActivityTimer] resetTimer called');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    startTimeRef.current = 0;
    pausedTimeRef.current = 0;

    progressAnim.value = withSpring(0);
    timerPulse.value = withSpring(1);

    setTimerState({
      isActive: false,
      isPaused: false,
      isComplete: false,
      timeRemaining: duration,
      timeElapsed: 0,
      progress: 0,
    });
  }, [duration]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      console.log('[useActivityTimer] Cleanup - clearing interval');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    timerPulse,
    progressAnim,
    timerPulseStyle,
    progressAnimStyle,
    formatTime,
  };
};

export default useActivityTimer;
