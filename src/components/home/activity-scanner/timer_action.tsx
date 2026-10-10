import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimerActionProps {
  timeRemaining: number;
  progressPercent: number;
}

export const TimerAction: React.FC<TimerActionProps> = ({
  timeRemaining,
  progressPercent,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const { Colors } = useAppTheme();

  const getMessage = (): string => {
    if (progressPercent >= 100) return 'You Completed the Quest!';
    if (progressPercent >= 75) return 'Almost done! Final push!';
    if (progressPercent >= 50) return 'Halfway there! Stay strong!';
    if (progressPercent >= 25) return "Good progress! You're doing great!";
    return 'Getting started! Keep it up!';
  };

  return (
    <View style={[styles.timerContainer, { backgroundColor: Colors.white }]}>
      <Text
        style={[
          styles.timerText,
          { color: Colors.isDark ? Colors.textColor : '#1A1A1A' },
        ]}
      >
        {formatTime(timeRemaining)}
      </Text>
      <Text style={[styles.motivationText, { color: Colors.textColor }]}>
        {getMessage()}
      </Text>
      <Text style={styles.motivationSubText}>
        {'Keep going your healthy streak \nis growing 💪'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 254,
    borderRadius: 18,
    gap: 12,
  },
  timerText: {
    fontSize: 48,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'center',
  },
  motivationSubText: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#666',
    textAlign: 'center',
  },
});
