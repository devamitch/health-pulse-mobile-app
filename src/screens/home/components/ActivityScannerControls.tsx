'use client';

/**
 * ActivityScannerControls
 *
 * Bottom control bar for activity scanner screen
 * Contains play/pause, reset, and fullscreen controls
 */

import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { TaskCategory } from '@/navigation/types';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActivityScannerControlsProps {
  taskType: TaskCategory;
  taskName: string;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  isFullScreen: boolean;
  onBack: () => void;
  onPause: () => void;
  onReset: () => void;
  onFullScreen: () => void;
  isPremium: boolean;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

const ActivityScannerControls: React.FC<ActivityScannerControlsProps> = ({
  taskType,
  taskName,
  currentTime,
  duration,
  isPaused,
  isFullScreen,
  onBack,
  onPause,
  onReset,
  onFullScreen,
  isPremium,
  Colors,
  DEffect,
}) => {
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );
  const insets = useSafeAreaInsets();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.taskNameText}>{taskName}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Control buttons */}
      <View style={styles.controlsRow}>
        {/* Reset button */}
        <TouchableOpacity style={styles.secondaryButton} onPress={onReset}>
          <View style={styles.resetIcon}>
            <Text style={styles.resetIconText}>R</Text>
          </View>
        </TouchableOpacity>

        {/* Play/Pause button */}
        <TouchableOpacity style={styles.primaryButton} onPress={onPause}>
          <View style={styles.primaryButtonInner}>
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

        {/* Fullscreen button (Premium only) */}
        <TouchableOpacity
          style={[styles.secondaryButton, !isPremium && styles.disabledButton]}
          onPress={onFullScreen}
        >
          <View style={styles.fullscreenIcon}>
            <Text
              style={[
                styles.fullscreenIconText,
                !isPremium && styles.disabledText,
              ]}
            >
              {isFullScreen ? 'M' : 'F'}
            </Text>
          </View>
          {
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 20,
      ...DEffect,
    },
    progressSection: {
      marginBottom: 20,
    },
    progressBar: {
      height: 4,
      backgroundColor: Colors.greyColor200,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: Colors.primaryColor,
      borderRadius: 2,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    timeText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textSecondary,
      width: 50,
    },
    taskNameText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      textAlign: 'center',
      flex: 1,
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
    },
    secondaryButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Colors.greyColor100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.5,
    },
    resetIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: Colors.textSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resetIconText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textSecondary,
    },
    primaryButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: Colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      ...DEffect,
    },
    primaryButtonInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: Colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIcon: {
      width: 0,
      height: 0,
      marginLeft: 4,
      borderLeftWidth: 20,
      borderTopWidth: 14,
      borderBottomWidth: 14,
      borderLeftColor: '#FFFFFF',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    pauseIcon: {
      flexDirection: 'row',
      gap: 6,
    },
    pauseBar: {
      width: 6,
      height: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
    },
    fullscreenIcon: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: Colors.textSecondary,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenIconText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textSecondary,
    },
    disabledText: {
      color: Colors.greyColor300,
    },
    premiumBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: Colors.premium || '#FFD700',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    premiumBadgeText: {
      fontSize: 8,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#000000',
    },
  });

export default ActivityScannerControls;
