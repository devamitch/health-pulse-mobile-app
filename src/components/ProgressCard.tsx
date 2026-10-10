import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import CircularProgress from './CircularProgress';

// Constants for consistent styling and behavior
const COMPLETION_THRESHOLD = 1;
const DECIMAL_PLACES = 0;

// Enhanced ProgressItem interface with better type safety
export interface ProgressItem {
  readonly label: string;
  readonly progress: number; // 0-2 (supports overflow)
  readonly color: string;
  readonly overflowColor?: string; // Color when progress > 1.0
  readonly icon?: string;
  readonly earnedPoints?: number; // Points earned
  readonly targetPoints?: number; // Target points
  readonly displayPoints?: boolean; // Show points instead of percentage
}

// Enhanced Props interface with better documentation and defaults
export interface ProgressCardProps {
  /** Array of progress items to display */
  items: ProgressItem[];
  /** Theme colors */
  Colors: ColorScheme;
  /** Shadow/elevation effects */
  DEffect: ElevationScheme;
  /** Whether to use compact mode */
  compact?: boolean;
  /** Optional accessibility label */
  accessibilityLabel?: string;
  /** Custom container styles */
  style?: ViewStyle;
}

// Internal type for progress statistics
interface ProgressStats {
  completed: number;
  inProgress: number;
  notStarted: number;
}

// Utility functions for better organization
const clampProgress = (progress: number): number =>
  Math.max(0, Math.min(2, progress)); // Allow overflow up to 200%

const calculateOverallProgress = (items: ProgressItem[]): number => {
  if (items.length === 0) return 0;
  const totalProgress = items.reduce(
    (sum, item) => sum + Math.min(clampProgress(item.progress), 1), // Cap at 1 for overall
    0,
  );
  return totalProgress / items.length;
};

const calculateProgressStats = (items: ProgressItem[]): ProgressStats => ({
  completed: items.filter(item => item.progress >= COMPLETION_THRESHOLD).length,
  inProgress: items.filter(
    item => item.progress > 0 && item.progress < COMPLETION_THRESHOLD,
  ).length,
  notStarted: items.filter(item => item.progress === 0).length,
});

// Memoized sub-components for better performance
const ProgressItemComponent = React.memo<{
  item: ProgressItem;
  colors: ColorScheme;
  compact: boolean;
  colorsTheme: ColorScheme;
}>(({ item, colors: _colors, compact, colorsTheme }) => {
  const clampedProgress = clampProgress(item.progress);
  const percentage = Math.round(clampedProgress * 100);
  const isCompleted = item.progress >= COMPLETION_THRESHOLD;
  const hasOverflow = item.progress > COMPLETION_THRESHOLD;

  const styles = useMemo(
    () => createStyles(colorsTheme, {} as ElevationScheme, compact),
    [colorsTheme, compact],
  );

  // Determine display text
  const displayText =
    item.displayPoints &&
    item.earnedPoints !== undefined &&
    item.targetPoints !== undefined
      ? `${Math.round(item.earnedPoints)}/${item.targetPoints}`
      : undefined;

  return (
    <View style={styles.progressItem}>
      {/* Label and Points/Percentage */}
      <View style={styles.labelContainer}>
        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          {item.label}
        </Text>
        {item.displayPoints &&
        item.earnedPoints !== undefined &&
        item.targetPoints !== undefined ? (
          <Text style={styles.pointsText}>
            {Math.round(item.earnedPoints)}/{item.targetPoints} pts
          </Text>
        ) : (
          <Text style={styles.percentage}>{percentage}%</Text>
        )}
      </View>

      {/* Circular Progress */}
      <View style={styles.circularProgressContainer}>
        <CircularProgress
          progress={clampedProgress}
          color={item.color}
          backgroundColor={
            colorsTheme.isDark ? colorsTheme.greyColor : '#f0f0f0'
          }
          overflowColor={item.overflowColor || item.color}
          size={compact ? 40 : 48}
          strokeWidth={compact ? 4 : 5}
          showText={false}
          textColor={colorsTheme.textColor}
          {...(displayText && { displayText })}
          showPercentage={!item.displayPoints}
        />
      </View>

      {/* Achievement Badge */}
      {isCompleted && !hasOverflow && (
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>✓</Text>
        </View>
      )}
      {hasOverflow && (
        <View style={[styles.completionBadge, styles.overflowBadge]}>
          <Text style={styles.completionText}>★</Text>
        </View>
      )}
    </View>
  );
});

const ProgressStatsComponent = React.memo<{
  stats: ProgressStats;
  colors: ColorScheme;
  compact: boolean;
}>(({ stats, colors, compact }) => {
  const styles = useMemo(
    () => createStyles(colors, {} as ElevationScheme, compact),
    [colors, compact],
  );

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Completed</Text>
        <Text style={styles.statValue}>{stats.completed}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>In Progress</Text>
        <Text style={styles.statValue}>{stats.inProgress}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Not Started</Text>
        <Text style={styles.statValue}>{stats.notStarted}</Text>
      </View>
    </View>
  );
});

/**
 * ProgressCard Component
 *
 * A professional, performant progress display component that shows multiple progress metrics
 * in a clean card layout with statistics.
 *
 * @param items - Array of progress items to display
 * @param Colors - Theme color scheme
 * @param DEffect - Elevation/shadow effects
 * @param compact - Whether to use compact mode
 * @param accessibilityLabel - Optional accessibility label for screen readers
 * @param style - Optional custom container styles
 */
const ProgressCard: React.FC<ProgressCardProps> = React.memo(
  ({
    items,
    Colors,
    DEffect,
    compact = false,
    accessibilityLabel = "Progress card showing today's progress metrics",
    style,
  }) => {
    // Memoized calculations for better performance
    const validItems = useMemo(
      () => items.filter(item => item.progress > 0 || !compact),
      [items, compact],
    );

    const overallPercentage = useMemo(
      () => Math.round(calculateOverallProgress(validItems) * 100),
      [validItems],
    );

    const stats = useMemo(
      () => calculateProgressStats(validItems),
      [validItems],
    );

    const styles = useMemo(
      () => createStyles(Colors, DEffect, compact),
      [Colors, DEffect, compact],
    );

    // Early return for empty state
    if (validItems.length === 0) {
      return null;
    }

    const combinedStyles = style
      ? [styles.cardContainer, style]
      : styles.cardContainer;

    return (
      <View
        style={combinedStyles}
        accessibilityLabel={accessibilityLabel}
        accessible={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Progress</Text>
          <Text style={styles.headerSubtitle}>{overallPercentage}%</Text>
        </View>

        {/* Progress Items */}
        <View style={styles.itemsContainer}>
          {validItems.map((item, index) => (
            <ProgressItemComponent
              key={`${item.label}-${index}`}
              item={item}
              colors={Colors}
              compact={compact}
              colorsTheme={Colors}
            />
          ))}
        </View>

        {/* Footer Stats */}
        <ProgressStatsComponent
          stats={stats}
          colors={Colors}
          compact={compact}
        />
      </View>
    );
  },
);

const createStyles = (
  Colors: ColorScheme,
  DEffect: ElevationScheme,
  compact: boolean,
) =>
  StyleSheet.create({
    cardContainer: {
      alignSelf: 'center',
      width: '90%',
      backgroundColor: Colors.white,
      marginHorizontal: 0,
      marginVertical: 12,
      paddingVertical: compact ? 12 : 16,
      paddingHorizontal: 16,
      borderRadius: 20,
      ...DEffect,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.primaryColor,
    },
    itemsContainer: {
      gap: compact ? 10 : 14,
      marginBottom: compact ? 8 : 12,
    },
    progressItem: {
      position: 'relative',
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    label: {
      fontSize: 13,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
      flex: 1,
    },
    percentage: {
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      color: Colors.primaryColor,
      minWidth: 35,
      textAlign: 'right',
    },
    pointsText: {
      fontSize: 11,
      fontFamily: 'Nunito-Bold',
      color: Colors.primaryColor,
      textAlign: 'right',
    },
    circularProgressContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    completionBadge: {
      position: 'absolute',
      top: compact ? 2 : 6, // Position near top of circular progress
      right: compact ? 2 : 6, // Position near right of circular progress
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overflowBadge: {
      backgroundColor: '#FFD700', // Gold for overflow
    },
    completionText: {
      fontSize: 11,
      fontFamily: 'Nunito-Bold',
      color: Colors.white,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: compact ? 8 : 12,
      borderTopWidth: 1,
      borderTopColor: Colors.isDark ? Colors.greyColor : '#e0e0e0',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      fontSize: 10,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 14,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    divider: {
      width: 1,
      height: 20,
      backgroundColor: Colors.isDark ? Colors.greyColor : '#e0e0e0',
    },
  });

export default ProgressCard;
