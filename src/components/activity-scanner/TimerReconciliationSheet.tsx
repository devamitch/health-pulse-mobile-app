// ============================================================================
// TIMER RECONCILIATION SHEET
// ============================================================================
// Shows when the user returns to the app and timers have expired.
// For each expired timer, the user can:
//   ✅ Mark Done — "Yes, I did it!"
//   🔄 Restart  — "Let me try again"
//   🔀 Replace  — "Give me a quick alternative"
//   ⏭ Skip     — "Not doable right now"
// ============================================================================

import {
  ExpiredTimerAction,
  ExpiredTimerInfo,
  GameTask,
  TaskCategory,
} from '@/lib/types/game-progression.types';
import { useTimerContext } from '@/providers/TimerProvider';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import React, { useCallback } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// QUICK REPLACEMENT TASKS
// ============================================================================
// When user picks "Replace", we give them a 1-minute task for that category

function getQuickReplacement(category: TaskCategory): GameTask {
  const now = Date.now();
  const hour = new Date().getHours();
  const timing = `${String(hour).padStart(2, '0')}:00`;

  const replacements: Record<TaskCategory, GameTask> = {
    diet: {
      title: 'Log 1 glass of water',
      coins: 5,
      category: 'diet',
      id: `replace-diet-${now}`,
      isDone: false,
      timings: [timing],
      action: 'log_record',
      generationReason: 'replacement',
      scheduledFor: 'evening',
    },
    activity: {
      title: 'Stretch for 1 minute',
      coins: 5,
      category: 'activity',
      id: `replace-activity-${now}`,
      isDone: false,
      timings: [timing],
      action: 'timer',
      seconds: 60,
      generationReason: 'replacement',
      scheduledFor: 'evening',
    },
    stress: {
      title: 'Take 3 slow breaths',
      coins: 5,
      category: 'stress',
      id: `replace-stress-${now}`,
      isDone: false,
      timings: [timing],
      action: 'timer',
      seconds: 45,
      generationReason: 'replacement',
      scheduledFor: 'evening',
    },
  };

  return replacements[category];
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getCategoryEmoji(cat: TaskCategory): string {
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

function getCategoryColor(cat: TaskCategory): string {
  switch (cat) {
    case 'diet':
      return '#FF9500';
    case 'activity':
      return '#34C759';
    case 'stress':
      return '#5856D6';
    default:
      return '#8E8E93';
  }
}

function getTimeAgo(expiredAt: number): string {
  const diff = Math.floor((Date.now() - expiredAt) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return 'yesterday';
}

// ============================================================================
// EXPIRED TIMER CARD
// ============================================================================

interface TimerCardProps {
  timer: ExpiredTimerInfo;
  onAction: (
    taskId: string,
    action: ExpiredTimerAction,
    replacement?: GameTask,
  ) => void;
  isDarkMode: boolean;
}

const ExpiredTimerCard: React.FC<TimerCardProps> = ({
  timer,
  onAction,
  isDarkMode,
}) => {
  const catColor = getCategoryColor(timer.taskCategory);
  const catEmoji = getCategoryEmoji(timer.taskCategory);
  const bgColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1A1A1A';
  const subtextColor = isDarkMode ? '#8E8E93' : '#6B7280';

  const handleReplace = useCallback(() => {
    const replacement = getQuickReplacement(timer.taskCategory);
    onAction(timer.taskId, 'replace', replacement);
  }, [timer, onAction]);

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View
          style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}
        >
          <Text style={styles.categoryEmoji}>{catEmoji}</Text>
          <Text style={[styles.categoryText, { color: catColor }]}>
            {timer.taskCategory}
          </Text>
        </View>
        <Text style={[styles.timeAgo, { color: subtextColor }]}>
          {getTimeAgo(timer.expiredAt)}
        </Text>
      </View>

      {/* Task title */}
      <Text style={[styles.taskTitle, { color: textColor }]} numberOfLines={2}>
        {timer.taskTitle}
      </Text>

      {/* Duration info */}
      <Text style={[styles.durationText, { color: subtextColor }]}>
        Timer: {formatDuration(timer.targetSeconds)} — completed in background
      </Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.doneBtn]}
          onPress={() => onAction(timer.taskId, 'mark_done')}
          activeOpacity={0.7}
        >
          <Text style={styles.doneBtnText}>✅ Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.restartBtn]}
          onPress={() => onAction(timer.taskId, 'restart')}
          activeOpacity={0.7}
        >
          <Text style={styles.restartBtnText}>🔄 Restart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.replaceBtn]}
          onPress={handleReplace}
          activeOpacity={0.7}
        >
          <Text style={styles.replaceBtnText}>🔀 Quick Alt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn]}
          onPress={() => onAction(timer.taskId, 'skip')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SHEET COMPONENT
// ============================================================================

export const TimerReconciliationSheet: React.FC = () => {
  const {
    expiredTimers,
    isReconciling,
    handleExpiredDecision,
    dismissReconciliation,
  } = useTimerContext();

  const theme = useAppSelector(state => state.theme);
  const isDarkMode = theme?.colors?.isDark ?? false;

  const bgColor = isDarkMode ? '#000000' : '#F2F2F7';
  const headerColor = isDarkMode ? '#FFFFFF' : '#1A1A1A';

  const onAction = useCallback(
    (taskId: string, action: ExpiredTimerAction, replacement?: GameTask) => {
      handleExpiredDecision(taskId, action, replacement);
    },
    [handleExpiredDecision],
  );

  // Mark all as done at once
  const markAllDone = useCallback(() => {
    expiredTimers.forEach(t => {
      handleExpiredDecision(t.taskId, 'mark_done');
    });
    dismissReconciliation();
  }, [expiredTimers, handleExpiredDecision, dismissReconciliation]);

  // Auto-dismiss when no more expired timers
  const remaining = expiredTimers.length;
  const visible = isReconciling && remaining > 0;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={dismissReconciliation}
    >
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>⏰</Text>
            <View>
              <Text style={[styles.headerTitle, { color: headerColor }]}>
                Timers Completed
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: headerColor + '80' }]}
              >
                {remaining} task{remaining > 1 ? 's' : ''} finished while you
                were away
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={dismissReconciliation}
            activeOpacity={0.7}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Quick action — mark all done */}
        {remaining > 1 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllDone}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>✅ Mark All as Done</Text>
          </TouchableOpacity>
        )}

        {/* Expired timer cards */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {expiredTimers.map(timer => (
            <ExpiredTimerCard
              key={timer.taskId}
              timer={timer}
              onAction={onAction}
              isDarkMode={isDarkMode}
            />
          ))}

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(128,128,128,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  markAllBtn: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#34C75920',
    alignItems: 'center',
  },
  markAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeAgo: {
    fontSize: 12,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 13,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtn: {
    backgroundColor: '#34C75920',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  restartBtn: {
    backgroundColor: '#007AFF15',
  },
  restartBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  replaceBtn: {
    backgroundColor: '#FF950015',
  },
  replaceBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
  },
  skipBtn: {
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
});

export default TimerReconciliationSheet;
