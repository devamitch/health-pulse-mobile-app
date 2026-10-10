'use client';

/**
 * Weight Wheel Picker Component
 * Specialized wheel picker for weight selection with kg/lbs toggle
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

type WeightUnit = 'kg' | 'lbs';

interface WeightWheelPickerProps {
  selectedWeight: number;
  onWeightChange: (weight: number, unit: WeightUnit) => void;
  unit?: WeightUnit;
  onUnitChange?: (unit: WeightUnit) => void;
  minWeight?: number;
  maxWeight?: number;
  containerStyle?: ViewStyle;
  label?: string;
  showLabel?: boolean;
  showDecimal?: boolean;
  onSave?: () => void;
  saveButtonText?: string;
  showSaveButton?: boolean;
}

const WeightWheelPicker: React.FC<WeightWheelPickerProps> = ({
  selectedWeight,
  onWeightChange,
  unit = 'kg',
  onUnitChange,
  minWeight = 20,
  maxWeight = 300,
  containerStyle,
  label = 'Weight',
  showLabel = true,
  showDecimal = true,
  onSave,
  saveButtonText = 'Save',
  showSaveButton = true,
}) => {
  const [currentUnit, setCurrentUnit] = useState<WeightUnit>(unit);

  // Generate whole number items
  const wholeItems: WheelPickerItem[] = useMemo(() => {
    const items: WheelPickerItem[] = [];
    const min =
      currentUnit === 'kg' ? minWeight : Math.round(minWeight * 2.205);
    const max =
      currentUnit === 'kg' ? maxWeight : Math.round(maxWeight * 2.205);

    for (let i = min; i <= max; i++) {
      items.push({
        label: `${i}`,
        value: i,
      });
    }
    return items;
  }, [currentUnit, minWeight, maxWeight]);

  // Generate decimal items (0-9)
  const decimalItems: WheelPickerItem[] = useMemo(() => {
    const items: WheelPickerItem[] = [];
    for (let i = 0; i <= 9; i++) {
      items.push({
        label: `.${i}`,
        value: i,
      });
    }
    return items;
  }, []);

  const wholeValue = Math.floor(selectedWeight);
  const decimalValue = Math.round((selectedWeight - wholeValue) * 10);

  const handleWholeChange = (value: string | number) => {
    const newWeight = Number(value) + decimalValue / 10;
    onWeightChange(newWeight, currentUnit);
  };

  const handleDecimalChange = (value: string | number) => {
    const newWeight = wholeValue + Number(value) / 10;
    onWeightChange(newWeight, currentUnit);
  };

  const toggleUnit = () => {
    const newUnit: WeightUnit = currentUnit === 'kg' ? 'lbs' : 'kg';
    setCurrentUnit(newUnit);

    // Convert weight
    let convertedWeight: number;
    if (newUnit === 'lbs') {
      convertedWeight = selectedWeight * 2.205;
    } else {
      convertedWeight = selectedWeight / 2.205;
    }

    onWeightChange(Math.round(convertedWeight * 10) / 10, newUnit);
    onUnitChange?.(newUnit);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && <Text style={styles.label}>{label}</Text>}

      <View style={styles.pickerContainer}>
        {/* Whole number picker */}
        <WheelPicker
          items={wholeItems}
          selectedValue={wholeValue}
          onValueChange={handleWholeChange}
          itemHeight={50}
          visibleItems={5}
          width={80}
          textStyle={styles.pickerText}
          selectedTextStyle={styles.selectedPickerText}
        />

        {/* Decimal picker */}
        {showDecimal && (
          <WheelPicker
            items={decimalItems}
            selectedValue={decimalValue}
            onValueChange={handleDecimalChange}
            itemHeight={50}
            visibleItems={5}
            width={60}
            textStyle={styles.pickerText}
            selectedTextStyle={styles.selectedPickerText}
          />
        )}

        {/* Unit toggle */}
        <TouchableOpacity style={styles.unitToggle} onPress={toggleUnit}>
          <Text
            style={[styles.unitText, currentUnit === 'kg' && styles.activeUnit]}
          >
            kg
          </Text>
          <Text style={styles.unitDivider}>/</Text>
          <Text
            style={[
              styles.unitText,
              currentUnit === 'lbs' && styles.activeUnit,
            ]}
          >
            lbs
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
    minWidth: 300,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});

export default WeightWheelPicker;
