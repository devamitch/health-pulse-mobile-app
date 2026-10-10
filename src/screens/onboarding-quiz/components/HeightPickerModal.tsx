// ============================================
// HeightPickerModal - Theme-aware Height Picker
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

interface HeightPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedHeight: number;
  unit: 'cm' | 'ft';
  onSave: (height: number, unit: 'cm' | 'ft') => void;
}

const HeightPickerModal: React.FC<HeightPickerModalProps> = memo(
  ({ visible, onClose, selectedHeight, unit: initialUnit, onSave }) => {
    const { Colors } = useAppTheme();
    const styles = createStyles(Colors);

    const [tempHeight, setTempHeight] = useState(selectedHeight);
    const [unit, setUnit] = useState<'cm' | 'ft'>(initialUnit);

    // Generate height options
    const heightOptions = useMemo(() => {
      if (unit === 'cm') {
        return Array.from({ length: 121 }, (_, i) => 100 + i); // 100cm to 220cm
      } else {
        // Generate feet'inches" format
        const options: { value: number; label: string }[] = [];
        for (let feet = 3; feet <= 7; feet++) {
          for (let inches = 0; inches < 12; inches++) {
            const totalCm = Math.round((feet * 12 + inches) * 2.54);
            options.push({
              value: totalCm,
              label: `${feet}'${inches}"`,
            });
          }
        }
        return options;
      }
    }, [unit]);

    const handleUnitChange = useCallback((newUnit: 'cm' | 'ft') => {
      setUnit(newUnit);
    }, []);

    const handleSave = useCallback(() => {
      onSave(tempHeight, unit);
    }, [tempHeight, unit, onSave]);

    const getDisplayValue = useCallback(() => {
      if (unit === 'ft') {
        const totalInches = tempHeight / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
      }
      return `${tempHeight} cm`;
    }, [tempHeight, unit]);

    return (
      <PickerBottomSheet
        visible={visible}
        onClose={onClose}
        title="Select Height"
      >
        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === 'cm' && styles.unitButtonActive,
            ]}
            onPress={() => handleUnitChange('cm')}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === 'cm' && styles.unitButtonTextActive,
              ]}
            >
              cm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === 'ft' && styles.unitButtonActive,
            ]}
            onPress={() => handleUnitChange('ft')}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === 'ft' && styles.unitButtonTextActive,
              ]}
            >
              ft/in
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Value Display */}
        <View style={styles.valueDisplay}>
          <Text style={styles.valueText}>{getDisplayValue()}</Text>
        </View>

        {/* Height Selector */}
        <ScrollView
          style={styles.pickerContainer}
          contentContainerStyle={styles.pickerContent}
          showsVerticalScrollIndicator={false}
        >
          {unit === 'cm'
            ? // CM options
              heightOptions.map(height => (
                <TouchableOpacity
                  key={height}
                  style={[
                    styles.optionItem,
                    tempHeight === height && styles.optionItemActive,
                  ]}
                  onPress={() => setTempHeight(height as number)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tempHeight === height && styles.optionTextActive,
                    ]}
                  >
                    {height} cm
                  </Text>
                </TouchableOpacity>
              ))
            : // Feet/inches options
              (heightOptions as { value: number; label: string }[]).map(
                option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      tempHeight === option.value && styles.optionItemActive,
                    ]}
                    onPress={() => setTempHeight(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempHeight === option.value && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
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

HeightPickerModal.displayName = 'HeightPickerModal';

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

export default HeightPickerModal;
