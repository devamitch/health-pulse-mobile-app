import { FONT_FAMILIES } from '@/constants/typography';
import type { TaskAction } from '@/lib/types/game-progression.types';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TimerState = 'idle' | 'active' | 'paused' | 'completed';

interface ActionButtonProps {
  componentType: TaskAction;
  handleComplete: () => void;
  timerState: TimerState;
  handleStart: () => void;
  handlePause: () => void;
  handleContinue: () => void;
  isValidating?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  componentType,
  handleComplete,
  timerState,
  handleStart,
  handlePause,
  handleContinue,
  isValidating = false,
}) => {
  // ──────────────────────────────────────────────
  // capture_photo — validate & complete
  // ──────────────────────────────────────────────
  if (componentType === 'capture_photo') {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, isValidating && styles.disabledButton]}
          onPress={handleComplete}
          disabled={isValidating}
          activeOpacity={0.8}
        >
          {isValidating ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.primaryButtonText}>Validating...</Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>Validate & Complete</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // timer — start / pause / resume / completed
  // ──────────────────────────────────────────────
  if (componentType === 'timer') {
    if (timerState === 'completed') {
      return (
        <View style={styles.buttonContainer}>
          <View style={[styles.primaryButton, styles.completedButton]}>
            <Text style={styles.primaryButtonText}>✓ Completed</Text>
          </View>
        </View>
      );
    }

    if (timerState === 'idle') {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Timer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (timerState === 'active') {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.pauseButton]}
            onPress={handlePause}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Pause</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // paused
    return (
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.halfButton, styles.resumeButton]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.halfButton, styles.finishButton]}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Finish Early</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // log_journal — submit journal
  // ──────────────────────────────────────────────
  if (componentType === 'log_journal') {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Submit Journal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // log_record — log one rep
  // ──────────────────────────────────────────────
  if (componentType === 'log_record') {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Log Completed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // watch_video — handled by video end callback
  // ──────────────────────────────────────────────
  if (componentType === 'watch_video') {
    return null;
  }

  // ──────────────────────────────────────────────
  // Fallback — generic complete
  // ──────────────────────────────────────────────
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Complete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 4,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1857C1',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  resumeButton: {
    backgroundColor: '#1857C1',
  },
  finishButton: {
    backgroundColor: '#10B981',
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  disabledButton: {
    opacity: 0.7,
  },
  halfButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default ActionButton;
