'use client';

import React from 'react';

/**
 * useActivityScanner Hook
 *
 * Main business logic for activity scanning across all three modes:
 * - Activity (Exercise with pose detection)
 * - Diet (Food photo analysis)
 * - Stress (Mindfulness with breathing guidance)
 *
 * IMPORTANT: This hook does NOT use worklets-core.
 * It uses standard Animated API and interval-based photo capture.
 * Only react-native-reanimated is used for animations (no worklets required).
 */

import { TaskData } from '@/navigation/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  Linking,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

// ============================================================================
// TYPES
// ============================================================================

export type BreathingPhase = 'inhale' | 'hold' | 'exhale';

export interface FormError {
  id: string;
  message: string;
  severity: 'warning' | 'error';
  timestamp: number;
  correctionTip?: string;
}

export interface PoseData {
  keypoints: Array<{
    name: string;
    x: number;
    y: number;
    confidence: number;
  }>;
  confidence: number;
}

export interface PhotoData {
  uri: string;
  width: number;
  height: number;
  timestamp: number;
}

export interface FoodAnalysis {
  detected: boolean;
  foodType: string;
  confidence: number;
  portionSize: string;
  matchesTask: boolean;
  nutritionEstimate?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  suggestions?: string[];
}

export interface ScanningStats {
  repsCompleted: number;
  caloriesBurned: number;
  exerciseProgress: number;
  timeElapsed: number;
  averageAccuracy: number;
  bestAccuracy: number;
  perfectReps: number;
}

export interface ScanningState {
  isScanning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  stats: ScanningStats;
  currentPose: PoseData | null;
  validation: {
    isCorrect: boolean;
    accuracy: number;
    errors: FormError[];
    suggestions: string[];
  } | null;
}

export interface CameraState {
  isActive: boolean;
  hasPermission: boolean;
  isReady: boolean;
  facingMode: 'front' | 'back';
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  hasError: boolean;
}

export interface UseActivityScannerReturn {
  // States
  scanningState: ScanningState;
  cameraState: CameraState;
  videoState: VideoState;
  breathingPhase: BreathingPhase;
  poseAccuracy: number;
  // Camera refs and device
  cameraRef: React.RefObject<Camera | null>;
  device: ReturnType<typeof useCameraDevice>;
  // Animated values (standard Animated API - NO WORKLETS)
  breathingScale: Animated.Value;
  accuracyGlow: Animated.Value;
  repCountScale: Animated.Value;
  errorShake: Animated.Value;
  pulseAnim: Animated.Value;
  // Controls
  startScanning: () => void;
  stopScanning: () => void;
  pauseScanning: () => void;
  resumeScanning: () => void;
  resetScanning: () => void;
  togglePause: () => void;
  // Video controls
  videoControls: {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    restart: () => void;
    togglePlayPause: () => void;
    skip: (seconds: number) => void;
    updateProgress: (currentTime: number, duration: number) => void;
  };
  // Camera controls
  cameraControls: {
    requestPermission: () => Promise<boolean>;
    setCameraReady: (ready: boolean) => void;
    takePhoto: () => Promise<PhotoData | null>;
    switchCamera: () => void;
    toggleFlash: () => void;
  };
  // Processing
  processPoseData: (poseData: PoseData) => void;
  analyzeFoodPhoto: (photo: PhotoData) => Promise<FoodAnalysis>;
  // Utilities
  formatTime: (seconds: number) => string;
  getProgressPercentage: () => number;
  getBreathingText: () => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const POSE_CONFIDENCE_THRESHOLD = 0.7;
const FORM_CHECK_INTERVAL = 100;
const REP_DETECTION_FRAMES = 10;
const REP_COOLDOWN = 500;
const BREATHING_CYCLE_DURATION = 12000;
const POSE_DETECTION_INTERVAL = 500; // Check pose every 500ms (interval-based, no worklets)

// ============================================================================
// HOOK
// ============================================================================

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
  // CAMERA (No Frame Processor - No Worklets Required)
  // ============================================================================

  const cameraRef = useRef<Camera | null>(null);
  const device = useCameraDevice('front');

  // ============================================================================
  // STATE
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
    duration: task.duration || 60,
    isBuffering: false,
    hasError: false,
  });

  const [breathingPhase, setBreathingPhase] =
    useState<BreathingPhase>('inhale');
  const [poseAccuracy, setPoseAccuracy] = useState(85);

  // ============================================================================
  // REFS
  // ============================================================================

  const startTimeRef = useRef<number>(0);
  const lastPoseCheckRef = useRef<number>(0);
  const consecutiveCorrectFramesRef = useRef<number>(0);
  const lastRepTimeRef = useRef<number>(0);
  const accuracyHistoryRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const poseDetectionIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ============================================================================
  // ANIMATED VALUES (Standard Animated API - NO WORKLETS)
  // ============================================================================

  const breathingScale = useRef(new Animated.Value(1)).current;
  const accuracyGlow = useRef(new Animated.Value(0)).current;
  const repCountScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ============================================================================
  // PERMISSION HANDLING (VisionCamera v4 compatible - NO worklets)
  // ============================================================================

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Use VisionCamera's static method for permission
      const cameraPermission = await Camera.getCameraPermissionStatus();

      if (cameraPermission === 'granted') {
        setCameraState(prev => ({ ...prev, hasPermission: true }));
        return true;
      }

      if (cameraPermission === 'not-determined') {
        // Request permission using VisionCamera's static method
        const newPermission = await Camera.requestCameraPermission();
        const hasPermissionNow = newPermission === 'granted';
        setCameraState(prev => ({ ...prev, hasPermission: hasPermissionNow }));
        return hasPermissionNow;
      }

      if (cameraPermission === 'denied') {
        // Permission was denied, show alert to go to settings
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        setCameraState(prev => ({ ...prev, hasPermission: false }));
        return false;
      }

      // For 'restricted' or other cases
      setCameraState(prev => ({ ...prev, hasPermission: false }));
      return false;
    } catch (error) {
      console.log('[v0] Camera permission error:', error);
      onError(new Error('Failed to request camera permission'));
      return false;
    }
  }, [onError]);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await Camera.getCameraPermissionStatus();
        setCameraState(prev => ({
          ...prev,
          hasPermission: status === 'granted',
        }));
      } catch (error) {
        console.log('[v0] Error checking camera permission:', error);
      }
    };
    checkPermission();
  }, []);

  // ============================================================================
  // APP STATE HANDLING
  // ============================================================================

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        if (scanningState.isScanning && !scanningState.isPaused) {
          pauseScanning();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [scanningState.isScanning, scanningState.isPaused]);

  // ============================================================================
  // INTERVAL-BASED POSE DETECTION (NO WORKLETS - NO FRAME PROCESSOR)
  // ============================================================================

  const runPoseDetection = useCallback(async () => {
    if (
      !cameraState.isReady ||
      scanningState.isPaused ||
      !scanningState.isScanning
    ) {
      return;
    }

    try {
      // Simulate pose detection (replace with actual ML inference)
      // In production, you would:
      // 1. Take a snapshot: const photo = await cameraRef.current?.takeSnapshot();
      // 2. Send to ML model for pose detection
      // 3. Process results

      const simulatedAccuracy = 70 + Math.random() * 25;
      const isCorrect = simulatedAccuracy >= 80;

      setPoseAccuracy(Math.round(simulatedAccuracy));

      // Update accuracy history
      accuracyHistoryRef.current.push(simulatedAccuracy);
      if (accuracyHistoryRef.current.length > 30) {
        accuracyHistoryRef.current.shift();
      }

      const averageAccuracy =
        accuracyHistoryRef.current.reduce((a, b) => a + b, 0) /
        accuracyHistoryRef.current.length;

      // Generate feedback
      let feedback = 'Keep going!';
      if (simulatedAccuracy >= 90) {
        feedback = 'Perfect form!';
      } else if (simulatedAccuracy >= 80) {
        feedback = 'Good form!';
      } else if (simulatedAccuracy >= 70) {
        feedback = 'Adjust your posture';
      }

      // Update validation state
      setScanningState(prev => ({
        ...prev,
        validation: {
          isCorrect,
          accuracy: Math.round(simulatedAccuracy),
          errors: isCorrect
            ? []
            : [
                {
                  id: 'form-check',
                  message: feedback,
                  severity: 'warning',
                  timestamp: Date.now(),
                },
              ],
          suggestions: [],
        },
        stats: {
          ...prev.stats,
          averageAccuracy: Math.round(averageAccuracy),
          bestAccuracy: Math.max(prev.stats.bestAccuracy, simulatedAccuracy),
        },
      }));

      // Accuracy glow animation
      if (isCorrect) {
        Animated.timing(accuracyGlow, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        consecutiveCorrectFramesRef.current++;
      } else {
        Animated.timing(accuracyGlow, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        consecutiveCorrectFramesRef.current = 0;
      }

      // Rep detection
      const now = Date.now();
      if (
        isCorrect &&
        simulatedAccuracy > 85 &&
        consecutiveCorrectFramesRef.current >= REP_DETECTION_FRAMES &&
        now - lastRepTimeRef.current > REP_COOLDOWN
      ) {
        lastRepTimeRef.current = now;
        consecutiveCorrectFramesRef.current = 0;

        // Rep count animation
        Animated.sequence([
          Animated.timing(repCountScale, {
            toValue: 1.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(repCountScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        setScanningState(prev => {
          const newReps = prev.stats.repsCompleted + 1;
          const calories = newReps * (task.caloriesPerUnit || 2.5);
          const isPerfect = simulatedAccuracy >= 90;
          const exerciseProgress = task.targetReps
            ? Math.min((newReps / task.targetReps) * 100, 100)
            : prev.stats.exerciseProgress;

          const newStats = {
            ...prev.stats,
            repsCompleted: newReps,
            caloriesBurned: Math.round(calories * 10) / 10,
            perfectReps: isPerfect
              ? prev.stats.perfectReps + 1
              : prev.stats.perfectReps,
            exerciseProgress,
          };

          // Check completion
          if (task.targetReps && newReps >= task.targetReps) {
            setTimeout(() => onComplete(newStats), 100);
            return { ...prev, stats: newStats, isComplete: true };
          }

          return { ...prev, stats: newStats };
        });
      }
    } catch (error) {
      // Silently handle errors
    }
  }, [
    cameraState.isReady,
    scanningState.isPaused,
    scanningState.isScanning,
    task,
    accuracyGlow,
    repCountScale,
    onComplete,
  ]);

  // Start/stop pose detection interval
  useEffect(() => {
    if (
      task.category === 'activity' &&
      scanningState.isScanning &&
      !scanningState.isPaused &&
      cameraState.isReady
    ) {
      poseDetectionIntervalRef.current = setInterval(
        runPoseDetection,
        POSE_DETECTION_INTERVAL,
      );
    } else {
      if (poseDetectionIntervalRef.current) {
        clearInterval(poseDetectionIntervalRef.current);
        poseDetectionIntervalRef.current = null;
      }
    }

    return () => {
      if (poseDetectionIntervalRef.current) {
        clearInterval(poseDetectionIntervalRef.current);
      }
    };
  }, [
    task.category,
    scanningState.isScanning,
    scanningState.isPaused,
    cameraState.isReady,
    runPoseDetection,
  ]);

  // ============================================================================
  // BREATHING ANIMATION (Standard Animated API - NO WORKLETS)
  // ============================================================================

  useEffect(() => {
    if (
      task.category !== 'stress' ||
      !scanningState.isScanning ||
      scanningState.isPaused
    ) {
      return;
    }

    // Breathing cycle animation
    const breathingCycle = Animated.loop(
      Animated.sequence([
        // Inhale (4s)
        Animated.timing(breathingScale, {
          toValue: 1.4,
          duration: 4000,
          useNativeDriver: true,
        }),
        // Hold (4s)
        Animated.timing(breathingScale, {
          toValue: 1.4,
          duration: 4000,
          useNativeDriver: true,
        }),
        // Exhale (4s)
        Animated.timing(breathingScale, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    );

    breathingCycle.start();

    // Update breathing phase text
    breathingIntervalRef.current = setInterval(() => {
      const cycleTime = Date.now() % BREATHING_CYCLE_DURATION;
      if (cycleTime < 4000) {
        setBreathingPhase('inhale');
      } else if (cycleTime < 8000) {
        setBreathingPhase('hold');
      } else {
        setBreathingPhase('exhale');
      }
    }, 100);

    return () => {
      breathingCycle.stop();
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [
    task.category,
    scanningState.isScanning,
    scanningState.isPaused,
    breathingScale,
  ]);

  // ============================================================================
  // PULSE ANIMATION FOR PAUSED STATE
  // ============================================================================

  useEffect(() => {
    if (scanningState.isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanningState.isPaused, pulseAnim]);

  // ============================================================================
  // TIMER
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
          ? prev.stats.exerciseProgress
          : 0;

        const newStats = {
          ...prev.stats,
          timeElapsed,
          exerciseProgress: Math.max(
            prev.stats.exerciseProgress,
            exerciseProgress,
          ),
        };

        // Check time-based completion
        if (task.duration && timeElapsed >= task.duration) {
          setTimeout(() => onComplete(newStats), 100);
          return { ...prev, stats: newStats, isComplete: true };
        }

        return { ...prev, stats: newStats };
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [scanningState.isScanning, scanningState.isPaused, task, onComplete]);

  // ============================================================================
  // POSE VALIDATION
  // ============================================================================

  const processPoseData = useCallback(
    (poseData: PoseData) => {
      if (!scanningState.isScanning || scanningState.isPaused) return;

      const now = Date.now();
      if (now - lastPoseCheckRef.current < FORM_CHECK_INTERVAL) return;
      lastPoseCheckRef.current = now;

      // Process pose data...
      setScanningState(prev => ({
        ...prev,
        currentPose: poseData,
      }));
    },
    [scanningState.isScanning, scanningState.isPaused],
  );

  // ============================================================================
  // FOOD PHOTO ANALYSIS
  // ============================================================================

  const analyzeFoodPhoto = useCallback(
    async (photo: PhotoData): Promise<FoodAnalysis> => {
      try {
        // Simulate API call
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
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const stopScanning = useCallback(() => {
    setCameraState(prev => ({ ...prev, isActive: false }));
    setScanningState(prev => ({
      ...prev,
      isScanning: false,
      isPaused: false,
    }));
    setVideoState(prev => ({ ...prev, isPlaying: false }));

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (poseDetectionIntervalRef.current)
      clearInterval(poseDetectionIntervalRef.current);
  }, []);

  const pauseScanning = useCallback(() => {
    setScanningState(prev => ({ ...prev, isPaused: true }));
    setVideoState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resumeScanning = useCallback(() => {
    setScanningState(prev => ({ ...prev, isPaused: false }));
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const togglePause = useCallback(() => {
    if (scanningState.isPaused) {
      resumeScanning();
    } else {
      pauseScanning();
    }
  }, [scanningState.isPaused, pauseScanning, resumeScanning]);

  const resetScanning = useCallback(() => {
    startTimeRef.current = Date.now();
    lastPoseCheckRef.current = 0;
    consecutiveCorrectFramesRef.current = 0;
    lastRepTimeRef.current = 0;
    accuracyHistoryRef.current = [];

    setScanningState(prev => ({
      ...prev,
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
    }));

    setVideoState(prev => ({ ...prev, currentTime: 0 }));
  }, []);

  // ============================================================================
  // VIDEO CONTROLS
  // ============================================================================

  const videoControls = {
    play: useCallback(() => {
      setVideoState(prev => ({ ...prev, isPlaying: true }));
      if (!scanningState.isScanning) startScanning();
    }, [scanningState.isScanning, startScanning]),

    pause: useCallback(() => {
      setVideoState(prev => ({ ...prev, isPlaying: false }));
      pauseScanning();
    }, [pauseScanning]),

    seek: useCallback((time: number) => {
      setVideoState(prev => ({ ...prev, currentTime: time }));
    }, []),

    restart: useCallback(() => {
      resetScanning();
      setVideoState(prev => ({ ...prev, currentTime: 0, isPlaying: true }));
      startScanning();
    }, [resetScanning, startScanning]),

    togglePlayPause: useCallback(() => {
      setVideoState(prev => {
        const newIsPlaying = !prev.isPlaying;
        if (newIsPlaying) {
          resumeScanning();
        } else {
          pauseScanning();
        }
        return { ...prev, isPlaying: newIsPlaying };
      });
    }, [pauseScanning, resumeScanning]),

    skip: useCallback((seconds: number) => {
      setVideoState(prev => ({
        ...prev,
        currentTime: Math.max(
          0,
          Math.min(prev.duration, prev.currentTime + seconds),
        ),
      }));
    }, []),

    updateProgress: useCallback((currentTime: number, duration: number) => {
      setVideoState(prev => ({ ...prev, currentTime, duration }));
    }, []),
  };

  // ============================================================================
  // CAMERA CONTROLS
  // ============================================================================

  const cameraControls = {
    requestPermission: requestCameraPermission,

    setCameraReady: useCallback((ready: boolean) => {
      setCameraState(prev => ({ ...prev, isReady: ready }));
    }, []),

    takePhoto: useCallback(async (): Promise<PhotoData | null> => {
      if (!cameraRef.current || !cameraState.isReady) {
        return null;
      }

      try {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'balanced',
          flash: 'off',
        });

        return {
          uri: `file://${photo.path}`,
          width: photo.width,
          height: photo.height,
          timestamp: Date.now(),
        };
      } catch (error) {
        onError(new Error('Failed to take photo'));
        return null;
      }
    }, [cameraState.isReady, onError]),

    switchCamera: useCallback(() => {
      setCameraState(prev => ({
        ...prev,
        facingMode: prev.facingMode === 'front' ? 'back' : 'front',
      }));
    }, []),

    toggleFlash: useCallback(() => {
      // Flash toggle implementation
    }, []),
  };

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const getProgressPercentage = useCallback((): number => {
    return scanningState.stats.exerciseProgress;
  }, [scanningState.stats.exerciseProgress]);

  const getBreathingText = useCallback((): string => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Breathe';
    }
  }, [breathingPhase]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (breathingIntervalRef.current)
        clearInterval(breathingIntervalRef.current);
      if (poseDetectionIntervalRef.current)
        clearInterval(poseDetectionIntervalRef.current);
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    scanningState,
    cameraState,
    videoState,
    breathingPhase,
    poseAccuracy,
    cameraRef,
    device,
    breathingScale,
    accuracyGlow,
    repCountScale,
    errorShake,
    pulseAnim,
    startScanning,
    stopScanning,
    pauseScanning,
    resumeScanning,
    resetScanning,
    togglePause,
    videoControls,
    cameraControls,
    processPoseData,
    analyzeFoodPhoto,
    formatTime,
    getProgressPercentage,
    getBreathingText,
  };
};

export default useActivityScanner;
