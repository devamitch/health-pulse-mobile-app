import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme } from '../../constants/theme';
import BaseModal from './base-modal';

interface HapticModalProps {
  visible: boolean;
  currentLevel: number;
  onClose: () => void;
  onSelect: (level: number) => void;
  Colors: ColorScheme;
}

const HapticModal: React.FC<HapticModalProps> = ({
  visible,
  currentLevel,
  onClose,
  onSelect,
  Colors,
}) => {
  const hapticOptions = [
    { label: 'Light', value: 10 },
    { label: 'Medium', value: 20 },
    { label: 'Heavy', value: 40 },
    { label: 'Off', value: 0 },
  ];

  return (
    <BaseModal
      isVisible={visible}
      onClose={onClose}
      title="Haptic Feedback"
      showBackButton={false}
      animationType="slide"
    >
      <View style={styles.optionsContainer}>
        {hapticOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.modalItem,
              {
                borderBottomColor: Colors.greyColor200,
                borderBottomWidth: index < hapticOptions.length - 1 ? 1 : 0,
              },
            ]}
          >
            <Text style={[styles.modalItemText, { color: Colors.textColor }]}>
              {option.label}
            </Text>
            {currentLevel === option.value && (
              <Ionicons name="checkmark" size={24} color={Colors.primaryColor} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    marginVertical: -8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  modalItemText: {
    fontSize: 17,
    fontFamily: 'Nunito-Medium',
  },
});

export default HapticModal;
