'use client';

/**
 * Age Wheel Picker Component
 * Specialized wheel picker for age selection (1-120 years)
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import WheelPicker, { WheelPickerItem } from './WheelPicker';

interface AgeWheelPickerProps {
  selectedAge: number;
  onAgeChange: (age: number) => void;
  minAge?: number;
  maxAge?: number;
  containerStyle?: ViewStyle;
  label?: string;
  showLabel?: boolean;
}

const AgeWheelPicker: React.FC<AgeWheelPickerProps> = ({
  selectedAge,
  onAgeChange,
  minAge = 1,
  maxAge = 120,
  containerStyle,
  label = 'Age',
  showLabel = true,
}) => {
  const ageItems: WheelPickerItem[] = useMemo(() => {
    const items: WheelPickerItem[] = [];
    for (let i = minAge; i <= maxAge; i++) {
      items.push({
        label: `${i}`,
        value: i,
      });
    }
    return items;
  }, [minAge, maxAge]);

  const handleValueChange = (value: string | number) => {
    onAgeChange(Number(value));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pickerContainer}>
        <WheelPicker
          items={ageItems}
          selectedValue={selectedAge}
          onValueChange={handleValueChange}
          itemHeight={50}
          visibleItems={5}
          width={100}
          textStyle={styles.pickerText}
          selectedTextStyle={styles.selectedPickerText}
        />
        <Text style={styles.unitText}>years</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 24,
    color: '#475569',
    fontFamily: 'Nunito-Regular',
  },
  selectedPickerText: {
    fontSize: 28,
    color: '#1857C1',
    fontFamily: 'Nunito-Bold',
  },
  unitText: {
    fontSize: 18,
    color: '#64748B',
    fontFamily: 'Nunito-Regular',
    marginLeft: 8,
  },
});

export default AgeWheelPicker;
