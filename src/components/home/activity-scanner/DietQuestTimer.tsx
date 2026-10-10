import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WaterDroplet } from '@/icons/droplets';
import { FONT_FAMILIES } from '@/constants/typography';

interface DietQuestTimerProps {
  waterCount: number;
}

export const DietQuestTimer: React.FC<DietQuestTimerProps> = ({ waterCount }) => {
  return (
    <View style={styles.timerContainer}>
      <View style={styles.waterDropletContainer}>
        <WaterDroplet filled={waterCount >= 1} size={40} />
        <WaterDroplet filled={waterCount >= 2} size={40} />
        <WaterDroplet filled={waterCount >= 3} size={40} />
      </View>
      <Text style={styles.motivationText}>
        {waterCount === 0 && 'Nice! Time to hydrate!'}
        {waterCount === 1 && 'Nice! 2 reminders completed'}
        {waterCount === 2 && 'Nice! 1 reminders completed'}
        {waterCount === 3 && 'You are doing great!'}
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
      backgroundColor: 'rgba(244, 244, 244, 1)',
  },
  waterDropletContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
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
