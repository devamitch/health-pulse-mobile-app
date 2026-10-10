import { FONT_FAMILIES } from '@/constants/typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogRecordProps {
  timerText: string;
  motivationText: string;
  subText: string;
}

export const LogRecord: React.FC<LogRecordProps> = ({
  timerText,
  motivationText,
  subText,
}) => {
  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{timerText}</Text>
      <Text style={styles.motivationText}>{motivationText}</Text>
      <Text style={styles.motivationSubText}>{subText}</Text>
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
