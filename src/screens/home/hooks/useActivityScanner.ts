/**
 * useActivityScanner Hook
 *
 * Main business logic for activity scanning across all three modes:
 * - Activity (Exercise with pose detection)
 * - Diet (Food photo analysis)
 * - Stress (Mindfulness with breathing guidance)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  BreathingPhase,
  CameraState,
  FoodAnalysis,
  FormError,
  PhotoData,
  PoseData,
  ScanningState,
  ScanningStats,
  TaskData,
  UseActivityScannerReturn,
  VideoState,
} from '../activity-scanner.types';

// Constants
const POSE_CONFIDENCE_THRESHOLD = 0.7;
const FORM_CHECK_INTERVAL = 100; // ms
const REP_DETECTION_FRAMES = 10;
const REP_COOLDOWN = 500; // ms
const BREATHING_CYCLE_DURATION = 12000; // ms (12 seconds total)

interface UseActivityScannerProps {
  task: TaskData;
  onComplete: (stats: ScanningStats) => void;
  onError: (error: Error) => void;
}

export const useActivityScanner = ({
  task,
  onComplete,
  onError,
}: UseActivityScannerProps): UseActivityScannerReturn => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [scanningState, setScanningState] = useState<ScanningState>({
    isScanning: false,
    isPaused: false,
    isComplete: false,
    stats: {
      repsCompleted: 0,
      caloriesBurned: 0,
      exerciseProgress: 0,
      timeElapsed: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      perfectReps: 0,
    },
    currentPose: null,
    validation: null,
  });

  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    hasPermission: false,
    isReady: false,
    facingMode: 'front',
  });

  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    hasError: false,
  });

  const [breathingPhase, setBreathingPhase] =
    useState<BreathingPhase>('inhale');

  // ============================================================================
  // REFS
  // ============================================================================

  const startTimeRef = useRef<number>(0);
  const lastPoseCheckRef = useRef<number>(0);
  const consecutiveCorrectFramesRef = useRef<number>(0);
  const lastRepTimeRef = useRef<number>(0);
  const accuracyHistoryRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ============================================================================
  // ANIMATED VALUES (Reanimated)
  // ============================================================================

  const breathingScale = useSharedValue(1);
  const accuracyGlow = useSharedValue(0);
  const repCountScale = useSharedValue(1);
  const errorShake = useSharedValue(0);

  // ============================================================================
  // APP STATE HANDLING
  // ============================================================================

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background - pause scanning
        if (scanningState.isScanning && !scanningState.isPaused) {
          pauseScanning();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [scanningState.isScanning, scanningState.isPaused]);

  // ============================================================================
  // BREATHING ANIMATION (for Stress/Mindfulness mode)
  // ============================================================================

  useEffect(() => {
    if (task.category !== 'stress' || !scanningState.isScanning) return;

    // Breathing cycle animation
    breathingScale.value = withRepeat(
      withSequence(
        // Inhale (4s)
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        // Hold (4s)
        withTiming(1.3, { duration: 4000 }),
        // Exhale (4s)
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // Infinite
      false,
    );

    // Update breathing phase
    breathingIntervalRef.current = setInterval(() => {
      const cycleTime = Date.now() % BREATHING_CYCLE_DURATION;
      const phase = cycleTime / BREATHING_CYCLE_DURATION;

      if (phase < 0.33) {
        setBreathingPhase('inhale');
      } else if (phase < 0.66) {
        setBreathingPhase('hold');
      } else {
        setBreathingPhase('exhale');
      }
    }, 100);

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [task.category, scanningState.isScanning, breathingScale]);

  // ============================================================================
  // TIMER (for tracking exercise duration)
  // ============================================================================

  useEffect(() => {
    if (!scanningState.isScanning || scanningState.isPaused) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setScanningState(prev => {
        const timeElapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
        const exerciseProgress = task.duration
          ? Math.min((timeElapsed / task.duration) * 100, 100)
          : task.targetReps
          ? Math.min((prev.stats.repsCompleted / task.targetReps) * 100, 100)
          : 0;

        const newStats = {
          ...prev.stats,
          timeElapsed,
          exerciseProgress,
        };

        // Check completion
        if (exerciseProgress >= 100) {
          setTimeout(() => onComplete(newStats), 100);
        }

        return {
          ...prev,
          stats: newStats,
        };
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [scanningState.isScanning, scanningState.isPaused, task, onComplete]);

  // ============================================================================
  // POSE VALIDATION LOGIC
  // ============================================================================

  const validatePoseForm = useCallback(
    (
      poseData: PoseData,
    ): { isCorrect: boolean; accuracy: number; errors: FormError[] } => {
      const errors: FormError[] = [];

      // Check if pose is detected
      if (!poseData || poseData.keypoints.length === 0) {
        return {
          isCorrect: false,
          accuracy: 0,
          errors: [
            {
              id: 'no-pose',
              message: 'Step into frame',
              severity: 'error',
              timestamp: Date.now(),
              correctionTip:
                'Make sure your full body is visible in the camera',
            },
          ],
        };
      }

      // Check confidence
      if (poseData.confidence < POSE_CONFIDENCE_THRESHOLD) {
        errors.push({
          id: 'low-confidence',
          message: 'Improve lighting',
          severity: 'warning',
          timestamp: Date.now(),
          correctionTip: 'Move to a well-lit area for better detection',
        });
      }

      // Exercise-specific validation
      const accuracy = poseData.confidence * 100;

      // Simulate form checking (in production, use actual pose angles)
      const isFormCorrect = accuracy > 75;

      if (!isFormCorrect && task.category === 'activity') {
        errors.push({
          id: 'form-error',
          message: getExerciseSpecificError(task.exerciseType || 'pushup'),
          severity: 'error',
          timestamp: Date.now(),
          correctionTip: getExerciseSpecificTip(task.exerciseType || 'pushup'),
        });
      }

      return {
        isCorrect: isFormCorrect,
        accuracy,
        errors,
      };
    },
    [task],
  );

  const getExerciseSpecificError = (exerciseType: string): string => {
    const errors: Record<string, string> = {
      pushup: 'Lower your body more',
      squat: 'Go deeper - thighs parallel',
      plank: 'Keep back straight',
      lunge: 'Front knee at 90°',
      'jumping-jack': 'Jump higher',
      crunch: 'Curl up more',
    };
    return errors[exerciseType] || 'Check your form';
  };

  const getExerciseSpecificTip = (exerciseType: string): string => {
    const tips: Record<string, string> = {
      pushup: 'Elbows should bend to 90 degrees at the bottom',
      squat: 'Keep your weight on your heels, chest up',
      plank: 'Imagine a straight line from head to heels',
      lunge: 'Keep your front knee over your ankle',
      'jumping-jack': 'Fully extend arms overhead',
      crunch: 'Focus on lifting shoulder blades off the ground',
    };
    return tips[exerciseType] || 'Watch the tutorial video for proper form';
  };

  // ============================================================================
  // REP DETECTION
  // ============================================================================

  const detectRep = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRep = now - lastRepTimeRef.current;

    // Cooldown period to prevent double counting
    if (timeSinceLastRep < REP_COOLDOWN) return false;

    // Need consecutive correct frames
    if (consecutiveCorrectFramesRef.current >= REP_DETECTION_FRAMES) {
      lastRepTimeRef.current = now;
      consecutiveCorrectFramesRef.current = 0;

      // Trigger rep count animation
      repCountScale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 }),
      );

      return true;
    }

    return false;
  }, [repCountScale]);

  // ============================================================================
  // POSE DATA PROCESSING
  // ============================================================================

  const processPoseData = useCallback(
    (poseData: PoseData) => {
      if (!scanningState.isScanning || scanningState.isPaused) return;

      const now = Date.now();
      const timeSinceLastCheck = now - lastPoseCheckRef.current;

      // Throttle checks
      if (timeSinceLastCheck < FORM_CHECK_INTERVAL) return;
      lastPoseCheckRef.current = now;

      // Validate pose
      const validation = validatePoseForm(poseData);

      // Update accuracy history
      accuracyHistoryRef.current.push(validation.accuracy);
      if (accuracyHistoryRef.current.length > 30) {
        accuracyHistoryRef.current.shift();
      }

      const averageAccuracy =
        accuracyHistoryRef.current.reduce((a, b) => a + b, 0) /
        accuracyHistoryRef.current.length;

      // Update consecutive correct frames
      if (validation.isCorrect) {
        consecutiveCorrectFramesRef.current++;
        accuracyGlow.value = withSpring(1, { damping: 10 });
      } else {
        consecutiveCorrectFramesRef.current = 0;
        accuracyGlow.value = withSpring(0, { damping: 10 });

        // Shake animation on error
        errorShake.value = withSequence(
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
      }

      // Detect rep
      if (task.category === 'activity' && validation.isCorrect) {
        const repDetected = detectRep();

        if (repDetected) {
          setScanningState(prev => {
            const newReps = prev.stats.repsCompleted + 1;
            const calories = newReps * (task.caloriesPerUnit || 0.5);
            const isPerfect = validation.accuracy >= 90;

            return {
              ...prev,
              stats: {
                ...prev.stats,
                repsCompleted: newReps,
                caloriesBurned: Math.round(calories * 10) / 10,
                averageAccuracy: Math.round(averageAccuracy),
                bestAccuracy: Math.max(
                  prev.stats.bestAccuracy,
                  validation.accuracy,
                ),
                perfectReps: isPerfect
                  ? prev.stats.perfectReps + 1
                  : prev.stats.perfectReps,
              },
            };
          });
        }
      }

      // Update state
      setScanningState(prev => ({
        ...prev,
        currentPose: poseData,
        validation: {
          isCorrect: validation.isCorrect,
          accuracy: validation.accuracy,
          errors: validation.errors,
          suggestions: [],
        },
      }));
    },
    [
      scanningState.isScanning,
      scanningState.isPaused,
      validatePoseForm,
      detectRep,
      task,
      accuracyGlow,
      errorShake,
    ],
  );

  // ============================================================================
  // FOOD PHOTO ANALYSIS
  // ============================================================================

  const analyzeFoodPhoto = useCallback(
    async (photo: PhotoData): Promise<FoodAnalysis> => {
      try {
        // Simulate AI analysis (in production, use Claude Vision API or similar)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const analysis: FoodAnalysis = {
          detected: true,
          foodType: 'Healthy meal',
          confidence: 0.92,
          portionSize: 'appropriate',
          matchesTask: true,
          nutritionEstimate: {
            calories: 350,
            protein: 25,
            carbs: 40,
            fats: 12,
          },
          suggestions: [
            'Great portion size!',
            'Good balance of nutrients',
            'Consider adding more vegetables',
          ],
        };

        return analysis;
      } catch (error) {
        onError(error as Error);
        throw error;
      }
    },
    [onError],
  );

  // ============================================================================
  // SCANNING CONTROLS
  // ============================================================================

  const startScanning = useCallback(() => {
    startTimeRef.current = Date.now();
    setCameraState(prev => ({ ...prev, isActive: true }));
    setScanningState(prev => ({
      ...prev,
      isScanning: true,
      isPaused: false,
    }));
  }, []);

  const stopScanning = useCallback(() => {
    setCameraState(prev => ({ ...prev, isActive: false }));
    setScanningState(prev => ({
      ...prev,
      isScanning: false,
      isPaused: false,
    }));

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const pauseScanning = useCallback(() => {
    setScanningState(prev => ({
      ...prev,
      isPaused: true,
    }));
    setVideoState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resumeScanning = useCallback(() => {
    setScanningState(prev => ({
      ...prev,
      isPaused: false,
    }));
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const resetScanning = useCallback(() => {
    startTimeRef.current = Date.now();
    lastPoseCheckRef.current = 0;
    consecutiveCorrectFramesRef.current = 0;
    lastRepTimeRef.current = 0;
    accuracyHistoryRef.current = [];

    setScanningState(prev => ({
      ...prev,
      stats: {
        repsCompleted: 0,
        caloriesBurned: 0,
        exerciseProgress: 0,
        timeElapsed: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        perfectReps: 0,
      },
      currentPose: null,
      validation: null,
    }));
  }, []);

  // ============================================================================
  // VIDEO CONTROLS
  // ============================================================================

  const videoControls = {
    play: useCallback(() => {
      setVideoState(prev => ({ ...prev, isPlaying: true }));
    }, []),

    pause: useCallback(() => {
      setVideoState(prev => ({ ...prev, isPlaying: false }));
    }, []),

    seek: useCallback((time: number) => {
      setVideoState(prev => ({ ...prev, currentTime: time }));
    }, []),

    restart: useCallback(() => {
      setVideoState(prev => ({ ...prev, currentTime: 0, isPlaying: true }));
    }, []),

    togglePlayPause: useCallback(() => {
      setVideoState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }, []),

    skip: useCallback((seconds: number) => {
      setVideoState(prev => ({
        ...prev,
        currentTime: Math.max(
          0,
          Math.min(prev.duration, prev.currentTime + seconds),
        ),
      }));
    }, []),
  };

  // ============================================================================
  // CAMERA CONTROLS
  // ============================================================================

  const cameraControls = {
    takePhoto: useCallback(async (): Promise<PhotoData | null> => {
      // Implemented in component with camera ref
      return null;
    }, []),

    switchCamera: useCallback(() => {
      setCameraState(prev => ({
        ...prev,
        facingMode: prev.facingMode === 'front' ? 'back' : 'front',
      }));
    }, []),

    toggleFlash: useCallback(() => {
      // Flash control would be implemented with camera ref
    }, []),
  };

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

  const getProgressPercentage = useCallback((): number => {
    return scanningState.stats.exerciseProgress;
  }, [scanningState.stats.exerciseProgress]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    scanningState,
    cameraState,
    videoState,
    startScanning,
    stopScanning,
    pauseScanning,
    resumeScanning,
    resetScanning,
    videoControls,
    cameraControls,
    processPoseData,
    analyzeFoodPhoto,
    formatTime,
    getProgressPercentage,
  };
};
