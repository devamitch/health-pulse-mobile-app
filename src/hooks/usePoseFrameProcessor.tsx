'use client';

import React from 'react';

/**
 * usePoseFrameProcessor Hook
 *
 * Frame processor for VisionCamera with worklets-core support.
 * This hook handles real-time pose detection using frame processors.
 *
 * REQUIRES: react-native-worklets-core to be properly installed
 *
 * If you're getting worklet errors, ensure:
 * 1. babel.config.js has 'react-native-worklets-core/plugin' BEFORE 'react-native-reanimated/plugin'
 * 2. You've run `cd ios && pod install` after installing worklets-core
 * 3. You've cleared Xcode DerivedData and rebuilt
 */

import { useCallback, useRef, useState } from 'react';
import { runOnJS } from 'react-native-reanimated';

// Type definitions for frame processor
export interface Keypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

export interface PoseResult {
  keypoints: Keypoint[];
  confidence: number;
  timestamp: number;
}

export interface FrameProcessorConfig {
  targetFPS?: number;
  minConfidence?: number;
  enablePoseDetection?: boolean;
}

// Pose keypoint names for reference
export const POSE_KEYPOINTS = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
] as const;

/**
 * Creates a frame processor for pose detection
 *
 * Usage with VisionCamera:
 * ```tsx
 * const { frameProcessor, lastPose } = usePoseFrameProcessor({
 *   onPoseDetected: (pose) => console.log('Pose:', pose),
 *   targetFPS: 15,
 * });
 *
 * <Camera frameProcessor={frameProcessor} />
 * ```
 */
export const usePoseFrameProcessor = (options: {
  onPoseDetected?: (pose: PoseResult) => void;
  onError?: (error: Error) => void;
  config?: FrameProcessorConfig;
}) => {
  const { onPoseDetected, onError, config } = options;
  const [lastPose, setLastPose] = useState<PoseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const targetFPS = config?.targetFPS || 15;
  const frameInterval = 1000 / targetFPS;
  const minConfidence = config?.minConfidence || 0.5;

  // Handler called from worklet via runOnJS
  const handlePoseResult = useCallback(
    (pose: PoseResult) => {
      setLastPose(pose);
      setIsProcessing(false);
      onPoseDetected?.(pose);
    },
    [onPoseDetected],
  );

  const handleError = useCallback(
    (errorMsg: string) => {
      setIsProcessing(false);
      onError?.(new Error(errorMsg));
    },
    [onError],
  );

  /**
   * Frame Processor Worklet
   *
   * This runs on the camera thread using worklets-core.
   * Heavy processing should be offloaded to native modules.
   */
  const frameProcessor = useCallback(
    (frame: any) => {
      'worklet';

      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTimeRef.current;

      // Throttle processing to target FPS
      if (timeSinceLastProcess < frameInterval) {
        return;
      }

      lastProcessTimeRef.current = now;
      frameCountRef.current++;

      try {
        // In a real implementation, you would call a native pose detection module here
        // For example: const poses = poseDetection.detectPoses(frame);

        // Mock pose detection for demonstration
        // Replace this with actual pose detection (MLKit, TensorFlow Lite, etc.)
        const mockPose: PoseResult = {
          keypoints: POSE_KEYPOINTS.map((name, index) => ({
            name,
            x: 0.5 + Math.random() * 0.1 - 0.05, // Normalized 0-1
            y: index / POSE_KEYPOINTS.length + Math.random() * 0.05,
            confidence: 0.8 + Math.random() * 0.2,
          })),
          confidence: 0.85 + Math.random() * 0.1,
          timestamp: now,
        };

        // Only report poses above confidence threshold
        if (mockPose.confidence >= minConfidence) {
          // Use runOnJS to safely call back to JS thread
          runOnJS(handlePoseResult)(mockPose);
        }
      } catch (error: any) {
        runOnJS(handleError)(error?.message || 'Frame processing error');
      }
    },
    [frameInterval, minConfidence, handlePoseResult, handleError],
  );

  return {
    frameProcessor,
    lastPose,
    isProcessing,
    frameCount: frameCountRef.current,
  };
};

/**
 * Alternative: Interval-based pose detection (no worklets required)
 *
 * Use this if you can't get worklets-core working.
 * It captures frames at intervals using takePhoto() instead of frame processors.
 */
export const useIntervalPoseDetection = (options: {
  cameraRef: React.RefObject<any>;
  onPoseDetected?: (pose: PoseResult) => void;
  onError?: (error: Error) => void;
  intervalMs?: number;
  enabled?: boolean;
}) => {
  const {
    cameraRef,
    onPoseDetected,
    onError,
    intervalMs = 200,
    enabled = true,
  } = options;
  const [lastPose, setLastPose] = useState<PoseResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCapturing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (!cameraRef.current || !enabled || isCapturing) return;

      setIsCapturing(true);

      try {
        // Take a snapshot (this is slower than frame processors but doesn't require worklets)
        const photo = await cameraRef.current.takeSnapshot({
          quality: 50,
          skipMetadata: true,
        });

        // Here you would send the photo to your pose detection API/model
        // For demo, we create a mock pose
        const mockPose: PoseResult = {
          keypoints: POSE_KEYPOINTS.map((name, index) => ({
            name,
            x: 0.5 + Math.random() * 0.1 - 0.05,
            y: index / POSE_KEYPOINTS.length + Math.random() * 0.05,
            confidence: 0.8 + Math.random() * 0.2,
          })),
          confidence: 0.85 + Math.random() * 0.1,
          timestamp: Date.now(),
        };

        setLastPose(mockPose);
        onPoseDetected?.(mockPose);
      } catch (error: any) {
        onError?.(error);
      } finally {
        setIsCapturing(false);
      }
    }, intervalMs);
  }, [cameraRef, enabled, intervalMs, isCapturing, onPoseDetected, onError]);

  const stopCapturing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  return {
    startCapturing,
    stopCapturing,
    lastPose,
    isCapturing,
  };
};

export default usePoseFrameProcessor;
