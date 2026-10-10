// ============================================
// WeightPickerModal - Theme-aware Weight Picker
// ============================================

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '../../../constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';
import PickerBottomSheet from './PickerBottomSheet';

interface WeightPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedWeight: number;
  unit: 'kg' | 'lbs';
  onSave: (weight: number, unit: 'kg' | 'lbs') => void;
}

const WeightPickerModal: React.FC<WeightPickerModalProps> = memo(
  ({ visible, onClose, selectedWeight, unit: initialUnit, onSave }) => {
    const { Colors } = useAppTheme();
    const styles = createStyles(Colors);

    const [tempWeight, setTempWeight] = useState(selectedWeight);
    const [unit, setUnit] = useState<'kg' | 'lbs'>(initialUnit);

    // Generate weight options
    const weightOptions = useMemo(() => {
      if (unit === 'kg') {
        return Array.from({ length: 171 }, (_, i) => 30 + i); // 30kg to 200kg
      } else {
        return Array.from({ length: 371 }, (_, i) => 66 + i); // 66lbs to 436lbs
      }
    }, [unit]);

    const handleUnitChange = useCallback(
      (newUnit: 'kg' | 'lbs') => {
        // Convert weight when unit changes
        if (newUnit === 'lbs' && unit === 'kg') {
          setTempWeight(Math.round(tempWeight * 2.205));
        } else if (newUnit === 'kg' && unit === 'lbs') {
          setTempWeight(Math.round(tempWeight / 2.205));
        }
        setUnit(newUnit);
      },
      [unit, tempWeight],
    );

    const handleSave = useCallback(() => {
      onSave(tempWeight, unit);
    }, [tempWeight, unit, onSave]);

    const getDisplayValue = useCallback(() => {
      return `${tempWeight} ${unit}`;
    }, [tempWeight, unit]);

    return (
      <PickerBottomSheet
        visible={visible}
        onClose={onClose}
        title="Select Weight"
      >
        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === 'kg' && styles.unitButtonActive,
            ]}
            onPress={() => handleUnitChange('kg')}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === 'kg' && styles.unitButtonTextActive,
              ]}
            >
              kg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === 'lbs' && styles.unitButtonActive,
            ]}
            onPress={() => handleUnitChange('lbs')}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === 'lbs' && styles.unitButtonTextActive,
              ]}
            >
              lbs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Value Display */}
        <View style={styles.valueDisplay}>
          <Text style={styles.valueText}>{getDisplayValue()}</Text>
        </View>

        {/* Weight Selector */}
        <ScrollView
          style={styles.pickerContainer}
          contentContainerStyle={styles.pickerContent}
          showsVerticalScrollIndicator={false}
        >
          {weightOptions.map(weight => (
            <TouchableOpacity
              key={weight}
              style={[
                styles.optionItem,
                tempWeight === weight && styles.optionItemActive,
              ]}
              onPress={() => setTempWeight(weight)}
            >
              <Text
                style={[
                  styles.optionText,
                  tempWeight === weight && styles.optionTextActive,
                ]}
              >
                {weight} {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </PickerBottomSheet>
    );
  },
);

WeightPickerModal.displayName = 'WeightPickerModal';

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    unitToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 12,
    },
    unitButton: {
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 20,
      backgroundColor: Colors.surfaceHover,
    },
    unitButtonActive: {
      backgroundColor: '#1857C1',
    },
    unitButtonText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textSecondary,
    },
    unitButtonTextActive: {
      color: 'white',
    },
    valueDisplay: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    valueText: {
      fontSize: 48,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#1857C1',
    },
    pickerContainer: {
      maxHeight: 200,
    },
    pickerContent: {
      paddingHorizontal: 20,
    },
    optionItem: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginVertical: 4,
      borderRadius: 12,
      backgroundColor: Colors.surfaceHover,
      alignItems: 'center',
    },
    optionItemActive: {
      backgroundColor: '#1857C1',
    },
    optionText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
    },
    optionTextActive: {
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: 'white',
    },
    buttonContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    saveButton: {
      backgroundColor: '#1857C1',
      paddingVertical: 16,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#1857C1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    saveButtonText: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: 'white',
    },
  });

export default WeightPickerModal;
