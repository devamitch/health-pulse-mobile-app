'use client';

/**
 * Height Wheel Picker Component
 * Specialized wheel picker for height selection with cm/ft'in toggle
 */

import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import WheelPicker, { WheelPickerItem } from './WheelPicker';

type HeightUnit = 'cm' | 'ft';

interface HeightWheelPickerProps {
  selectedHeight: number; // Always stored in cm
  onHeightChange: (height: number, unit: HeightUnit) => void;
  unit?: HeightUnit;
  onUnitChange?: (unit: HeightUnit) => void;
  minHeight?: number; // in cm
  maxHeight?: number; // in cm
  containerStyle?: ViewStyle;
  label?: string;
  showLabel?: boolean;
  onSave?: () => void;
  saveButtonText?: string;
  showSaveButton?: boolean;
}

const HeightWheelPicker: React.FC<HeightWheelPickerProps> = ({
  selectedHeight,
  onHeightChange,
  unit = 'cm',
  onUnitChange,
  minHeight = 100,
  maxHeight = 250,
  containerStyle,
  label = 'Height',
  showLabel = true,
  onSave,
  saveButtonText = 'Save',
  showSaveButton = true,
}) => {
  const [currentUnit, setCurrentUnit] = useState<HeightUnit>(unit);

  // Convert cm to feet and inches
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  // Convert feet and inches to cm
  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.round((feet * 12 + inches) * 2.54);
  };

  // Generate cm items
  const cmItems: WheelPickerItem[] = useMemo(() => {
    const items: WheelPickerItem[] = [];
    for (let i = minHeight; i <= maxHeight; i++) {
      items.push({
        label: `${i}`,
        value: i,
      });
    }
    return items;
  }, [minHeight, maxHeight]);

  // Generate feet items (3-8 feet)
  const feetItems: WheelPickerItem[] = useMemo(() => {
    const items: WheelPickerItem[] = [];
    for (let i = 3; i <= 8; i++) {
      items.push({
        label: `${i}'`,
        value: i,
      });
    }
    return items;
  }, []);

  // Generate inches items (0-11)
  const inchesItems: WheelPickerItem[] = useMemo(() => {
    const items: WheelPickerItem[] = [];
    for (let i = 0; i <= 11; i++) {
      items.push({
        label: `${i}"`,
        value: i,
      });
    }
    return items;
  }, []);

  const { feet, inches } = cmToFeetInches(selectedHeight);

  const handleCmChange = (value: string | number) => {
    onHeightChange(Number(value), currentUnit);
  };

  const handleFeetChange = (value: string | number) => {
    const newHeight = feetInchesToCm(Number(value), inches);
    onHeightChange(newHeight, currentUnit);
  };

  const handleInchesChange = (value: string | number) => {
    const newHeight = feetInchesToCm(feet, Number(value));
    onHeightChange(newHeight, currentUnit);
  };

  const toggleUnit = () => {
    const newUnit: HeightUnit = currentUnit === 'cm' ? 'ft' : 'cm';
    setCurrentUnit(newUnit);
    onUnitChange?.(newUnit);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.pickerContainer}>
        {currentUnit === 'cm' ? (
          // CM picker
          <>
            <WheelPicker
              items={cmItems}
              selectedValue={selectedHeight}
              onValueChange={handleCmChange}
              itemHeight={50}
              visibleItems={5}
              width={100}
              textStyle={styles.pickerText}
              selectedTextStyle={styles.selectedPickerText}
            />
            <Text style={styles.unitLabel}>cm</Text>
          </>
        ) : (
          // Feet and inches picker
          <>
            <WheelPicker
              items={feetItems}
              selectedValue={feet}
              onValueChange={handleFeetChange}
              itemHeight={50}
              visibleItems={5}
              width={70}
              textStyle={styles.pickerText}
              selectedTextStyle={styles.selectedPickerText}
            />
            <WheelPicker
              items={inchesItems}
              selectedValue={inches}
              onValueChange={handleInchesChange}
              itemHeight={50}
              visibleItems={5}
              width={70}
              textStyle={styles.pickerText}
              selectedTextStyle={styles.selectedPickerText}
            />
          </>
        )}

        {/* Unit toggle */}
        <TouchableOpacity style={styles.unitToggle} onPress={toggleUnit}>
          <Text
            style={[styles.unitText, currentUnit === 'cm' && styles.activeUnit]}
          >
            cm
          </Text>
          <Text style={styles.unitDivider}>/</Text>
          <Text
            style={[styles.unitText, currentUnit === 'ft' && styles.activeUnit]}
          >
            ft'in
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      {showSaveButton && onSave && (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>{saveButtonText}</Text>
        </TouchableOpacity>
      )}
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
  unitLabel: {
    fontSize: 18,
    color: '#64748B',
    fontFamily: 'Nunito-Regular',
    marginLeft: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  unitText: {
    fontSize: 16,
    color: '#94A3B8',
    fontFamily: 'Nunito-Regular',
  },
  activeUnit: {
    color: '#1857C1',
    fontFamily: 'Nunito-Bold',
  },
  unitDivider: {
    fontSize: 16,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  saveButton: {
    marginVertical: 24,
    backgroundColor: '#1857C1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 400,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});

export default HeightWheelPicker;
