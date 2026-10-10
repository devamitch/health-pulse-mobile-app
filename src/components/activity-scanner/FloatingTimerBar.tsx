// ============================================================================
// FLOATING TIMER BAR
// ============================================================================
// A small floating bar shown at the bottom of the screen whenever one or more
// timers are active. Shows the most urgent timer (closest to completing).
// Tapping it navigates to the ActivityScanner for that task.
// ============================================================================

import { TaskCategory, TimerState } from '@/lib/types/game-progression.types';
import { useTimerContext } from '@/providers/TimerProvider';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ============================================================================
// HELPERS
// ============================================================================

function formatTimeShort(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getCatIcon(cat: TaskCategory): string {
  switch (cat) {
    case 'diet':
      return '🍽️';
    case 'activity':
      return '🏃';
    case 'stress':
      return '🧘';
    default:
      return '⏱️';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

interface FloatingTimerBarProps {
  /** Called when user taps the bar — navigate to task */
  onPress?: (taskId: string) => void;
  /** Bottom offset (e.g. tab bar height) */
  bottomOffset?: number;
}

export const FloatingTimerBar: React.FC<FloatingTimerBarProps> = ({
  onPress,
  bottomOffset = 90,
}) => {
  const { activeTimers, runningCount, getRemaining, tick } = useTimerContext();
  const theme = useAppSelector(state => state.theme);
  const isDark = theme?.colors?.isDark ?? false;

  // Find the most urgent active timer (closest to finishing)
  const urgentTimer = useMemo(() => {
    const running = Object.values(activeTimers).filter(
      t => t.status === 'active',
    );
    if (running.length === 0) return null;

    // Sort by remaining time ascending
    return running.reduce((best, t) => {
      const remaining = Math.max(0, t.targetSeconds - computeElapsed(t));
      const bestRemaining = Math.max(
        0,
        best.targetSeconds - computeElapsed(best),
      );
      return remaining < bestRemaining ? t : best;
    }, running[0]);
  }, [activeTimers, tick]);

  if (runningCount === 0 || !urgentTimer) return null;

  const remaining = getRemaining(urgentTimer.taskId);
  const progress = Math.min(
    1,
    1 - remaining / Math.max(1, urgentTimer.targetSeconds),
  );

  const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const accentColor = progress > 0.8 ? '#34C759' : '#007AFF';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: bgColor, bottom: bottomOffset },
      ]}
      onPress={() => onPress?.(urgentTimer.taskId)}
      activeOpacity={0.85}
    >
      {/* Progress bar background */}
      <View
        style={[styles.progressBg, { backgroundColor: accentColor + '15' }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: accentColor + '30',
              width: `${Math.round(progress * 100)}%`,
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.icon}>
            {getCatIcon(urgentTimer.taskCategory)}
          </Text>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: textColor }]}
              numberOfLines={1}
            >
              {urgentTimer.taskTitle}
            </Text>
            {runningCount > 1 && (
              <Text style={[styles.subtitle, { color: textColor + '80' }]}>
                +{runningCount - 1} more timer{runningCount > 2 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.time, { color: accentColor }]}>
            {formatTimeShort(remaining)}
          </Text>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// TIMER MATH (same as provider — duplicated for perf to avoid import cycle)
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

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  progressBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  time: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default FloatingTimerBar;
