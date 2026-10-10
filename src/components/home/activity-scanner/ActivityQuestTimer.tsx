import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';

interface ActivityQuestTimerProps {
  repCount: number;
  totalReps: number;
}

const RepCounter: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => {
  return (
    <View style={styles.repCounterContainer}>
      <Text style={styles.repCounterText}>
        {current} / {total}
      </Text>
    </View>
  );
};

export const ActivityQuestTimer: React.FC<ActivityQuestTimerProps> = ({
  repCount,
  totalReps,
}) => {
  const {Colors} = useAppTheme();
  return (
    <View style={[styles.timerContainer, { backgroundColor: Colors.white }]}>
      <RepCounter current={repCount} total={totalReps} />
      <Text style={styles.motivationText}>
        {`You've completed ${repCount} of ${totalReps} push-ups`}
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
  repCounterContainer: {
    marginBottom: 8,
  },
  repCounterText: {
    fontSize: 48,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  motivationSubText: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#666',
    textAlign: 'center',
  },
});
