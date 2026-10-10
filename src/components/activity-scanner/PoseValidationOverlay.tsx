'use client';

/**
 * PoseValidationOverlay
 *
 * Overlay component showing pose accuracy, rep count, and form errors
 * Uses standard Animated API (no worklets-core needed)
 */

import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PoseValidationOverlayProps {
  isPoseCorrect: boolean;
  poseAccuracy: number;
  formErrors: string[];
  repsCompleted: number;
  exerciseProgress: number;
  caloriesBurned: number;
  Colors: ColorScheme;
}

const PoseValidationOverlay: React.FC<PoseValidationOverlayProps> = ({
  isPoseCorrect,
  poseAccuracy,
  formErrors,
  repsCompleted,
  exerciseProgress,
  caloriesBurned,
  Colors,
}) => {
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const accuracyGlow = useRef(new Animated.Value(0)).current;
  const repBounce = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  // Glow animation based on accuracy
  useEffect(() => {
    Animated.timing(accuracyGlow, {
      toValue: poseAccuracy > 80 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [poseAccuracy, accuracyGlow]);

  // Bounce animation when rep completes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(repBounce, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(repBounce, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [repsCompleted, repBounce]);

  // Shake animation for errors
  useEffect(() => {
    if (formErrors.length > 0) {
      Animated.sequence([
        Animated.timing(errorShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [formErrors, errorShake]);

  const getAccuracyColor = () => {
    if (poseAccuracy >= 90) return Colors.success;
    if (poseAccuracy >= 70) return Colors.warning;
    return Colors.error;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top stats bar */}
      <View style={styles.topBar}>
        {/* Accuracy indicator */}
        <Animated.View
          style={[
            styles.accuracyContainer,
            { opacity: Animated.add(0.8, Animated.multiply(accuracyGlow, 0.2)) },
          ]}
        >
          <View style={styles.accuracyRing}>
            <View
              style={[
                styles.accuracyFill,
                {
                  backgroundColor: getAccuracyColor(),
                  height: `${poseAccuracy}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.accuracyText}>{Math.round(poseAccuracy)}%</Text>
          <Text style={styles.accuracyLabel}>Accuracy</Text>
        </Animated.View>

        {/* Rep counter */}
        <Animated.View
          style={[styles.repContainer, { transform: [{ scale: repBounce }] }]}
        >
          <Text style={styles.repCount}>{repsCompleted}</Text>
          <Text style={styles.repLabel}>Reps</Text>
        </Animated.View>

        {/* Calories */}
        <View style={styles.caloriesContainer}>
          <Text style={styles.caloriesCount}>{Math.round(caloriesBurned)}</Text>
          <Text style={styles.caloriesLabel}>kcal</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${exerciseProgress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(exerciseProgress)}%</Text>
      </View>

      {/* Form correction feedback */}
      {formErrors.length > 0 && (
        <Animated.View
          style={[
            styles.errorContainer,
            { transform: [{ translateX: errorShake }] },
          ]}
        >
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorTitle}>Form Correction</Text>
            {formErrors.slice(0, 2).map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Pose status indicator */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isPoseCorrect ? Colors.success : Colors.error },
          ]}
        />
        <Text style={styles.statusText}>
          {isPoseCorrect ? 'Good Form!' : 'Adjust Position'}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      paddingHorizontal: 16,
      paddingTop: 100,
      paddingBottom: 120,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    accuracyContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 12,
      borderRadius: 16,
    },
    accuracyRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    accuracyFill: {
      width: '100%',
      borderRadius: 24,
    },
    accuracyText: {
      marginTop: 8,
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    accuracyLabel: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    repContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 16,
      borderRadius: 16,
    },
    repCount: {
      fontSize: 36,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    repLabel: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    caloriesContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 12,
      borderRadius: 16,
    },
    caloriesCount: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    caloriesLabel: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    progressBarContainer: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      width: 40,
    },
    errorContainer: {
      position: 'absolute',
      bottom: 140,
      left: 16,
      right: 16,
      flexDirection: 'row',
      backgroundColor: 'rgba(239, 68, 68, 0.9)',
      padding: 16,
      borderRadius: 16,
      gap: 12,
    },
    errorIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorIconText: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#EF4444',
    },
    errorTextContainer: {
      flex: 1,
    },
    errorTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      marginBottom: 4,
    },
    errorText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: 20,
    },
    statusContainer: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      gap: 8,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: '#FFFFFF',
    },
  });

export default PoseValidationOverlay;
