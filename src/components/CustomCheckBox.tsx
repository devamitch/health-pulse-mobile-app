import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../hooks/themeHook';

interface CustomCheckboxProps {
  label: string;
  onChange?: (checked: boolean) => void;
  checked: boolean;
  isLastItem?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  onChange,
  checked,
  isLastItem = false,
}) => {
  // Get theme colors from Redux store
  const { Colors } = useAppTheme();

  const capitalizeFirstLetter = (str: string): string => 
    `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: Colors.white }, // Dynamic background color
        (!isLastItem) && { borderBottomWidth: 1, borderBottomColor: Colors.greyColor400 },
      ]} 
      activeOpacity={0.7}
      onPress={() => onChange?.(!checked)}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: Colors.textColor,
            backgroundColor: Colors.greyColor400,
          },
        ]}
      >
        {checked ? (
          <View
            style={[
              styles.blueBullet,
              { backgroundColor: Colors.primaryColor },
            ]}
          />
        ) : (
          <View />
        )}
      </View>
      <Text style={[styles.label, { color: Colors.textColor }]}>{capitalizeFirstLetter(label)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 2,
    borderRadius: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  blueBullet: {
    width: 14,
    height: 14,
    borderRadius: 14,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
  },
});

export default CustomCheckbox;
