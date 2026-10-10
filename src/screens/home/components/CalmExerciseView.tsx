'use client';

/**
 * CalmExerciseView
 *
 * Component for mindfulness/meditation exercises with breathing animations
 * Uses standard Animated API (no worklets-core needed)
 */

import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CalmExerciseViewProps {
  videoUrl: string;
  duration: number;
  currentTime: number;
  isPaused: boolean;
  onComplete: () => void;
  onProgress: (data: { currentTime: number }) => void;
  onPause: () => void;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATHING_CYCLE = {
  inhale: 4000,
  hold: 4000,
  exhale: 4000,
  rest: 2000,
};

const CalmExerciseView: React.FC<CalmExerciseViewProps> = ({
  videoUrl,
  duration,
  currentTime,
  isPaused,
  onComplete,
  onProgress,
  onPause,
  Colors,
  DEffect,
}) => {
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const videoRef = useRef<Video>(null);
  const breathingScale = useRef(new Animated.Value(1)).current;
  const breathingOpacity = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);

  // Breathing animation cycle
  useEffect(() => {
    if (isPaused) return;

    const runBreathingCycle = () => {
      // Inhale - expand
      setBreathingPhase('inhale');
      Animated.parallel([
        Animated.timing(breathingScale, {
          toValue: 1.4,
          duration: BREATHING_CYCLE.inhale,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathingOpacity, {
          toValue: 1,
          duration: BREATHING_CYCLE.inhale,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.5,
          duration: BREATHING_CYCLE.inhale,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hold
        setBreathingPhase('hold');
        setTimeout(() => {
          // Exhale - contract
          setBreathingPhase('exhale');
          Animated.parallel([
            Animated.timing(breathingScale, {
              toValue: 1,
              duration: BREATHING_CYCLE.exhale,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(breathingOpacity, {
              toValue: 0.6,
              duration: BREATHING_CYCLE.exhale,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0,
              duration: BREATHING_CYCLE.exhale,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Rest
            setBreathingPhase('rest');
            setTimeout(() => {
              setCycleCount(prev => prev + 1);
            }, BREATHING_CYCLE.rest);
          });
        }, BREATHING_CYCLE.hold);
      });
    };

    runBreathingCycle();
  }, [cycleCount, isPaused, breathingScale, breathingOpacity, glowOpacity]);

  const getBreathingInstruction = useCallback(() => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'rest':
        return 'Rest';
      default:
        return 'Breathe';
    }
  }, [breathingPhase]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Background video */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.backgroundVideo}
        resizeMode="cover"
        repeat={true}
        paused={isPaused}
        onProgress={onProgress}
        onEnd={onComplete}
        muted={false}
        volume={0.5}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Breathing circle */}
        <View style={styles.breathingContainer}>
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowCircle,
              {
                opacity: glowOpacity,
                transform: [{ scale: breathingScale }],
              },
            ]}
          />

          {/* Main breathing circle */}
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                opacity: breathingOpacity,
                transform: [{ scale: breathingScale }],
              },
            ]}
          >
            <Text style={styles.breathingText}>{getBreathingInstruction()}</Text>
          </Animated.View>
        </View>

        {/* Timer and controls */}
        <View style={styles.bottomSection}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Play/Pause button */}
          <TouchableOpacity style={styles.controlButton} onPress={onPause}>
            <View style={styles.controlIcon}>
              {isPaused ? (
                <View style={styles.playIcon} />
              ) : (
                <View style={styles.pauseIcon}>
                  <View style={styles.pauseBar} />
                  <View style={styles.pauseBar} />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Session info */}
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionLabel}>Breathing Cycles</Text>
            <Text style={styles.sessionValue}>{cycleCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    backgroundVideo: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'space-between',
      paddingVertical: 60,
    },
    breathingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    glowCircle: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: Colors.primaryColor,
    },
    breathingCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    breathingText: {
      fontSize: 24,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    bottomSection: {
      paddingHorizontal: 24,
      gap: 20,
    },
    progressContainer: {
      gap: 8,
    },
    progressBar: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 2,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    controlButton: {
      alignSelf: 'center',
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIcon: {
      width: 0,
      height: 0,
      marginLeft: 4,
      borderLeftWidth: 18,
      borderTopWidth: 12,
      borderBottomWidth: 12,
      borderLeftColor: Colors.primaryColor,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    pauseIcon: {
      flexDirection: 'row',
      gap: 6,
    },
    pauseBar: {
      width: 6,
      height: 22,
      backgroundColor: Colors.primaryColor,
      borderRadius: 2,
    },
    sessionInfo: {
      alignItems: 'center',
      gap: 4,
    },
    sessionLabel: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    sessionValue: {
      fontSize: 32,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
  });

export default CalmExerciseView;
