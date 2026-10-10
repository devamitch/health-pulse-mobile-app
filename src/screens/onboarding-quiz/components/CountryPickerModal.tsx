// ============================================
// CountryPickerModal - Theme-aware Country Picker
// ============================================

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '../../../constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';
import {
  countriesData,
  Country,
  getFlagEmoji,
} from '../../../utils/countryUtils';
import PickerBottomSheet from './PickerBottomSheet';

interface CountryPickerModalProps {
  visible: boolean;
  selectedCountry: string;
  onCountryChange: (countryName: string, countryCode: string) => void;
  onClose: () => void;
}

const CountryPickerModal: React.FC<CountryPickerModalProps> = memo(
  ({ visible, selectedCountry, onCountryChange, onClose }) => {
    const { Colors } = useAppTheme();
    const styles = createStyles(Colors);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = useMemo(() => {
      if (!searchQuery.trim()) {
        return countriesData;
      }
      const query = searchQuery.toLowerCase();
      return countriesData.filter(
        country =>
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query),
      );
    }, [searchQuery]);

    const handleSelectCountry = useCallback(
      (country: Country) => {
        onCountryChange(country.name, country.code);
      },
      [onCountryChange],
    );

    const renderCountryItem = useCallback(
      ({ item }: { item: Country }) => {
        const isSelected = selectedCountry === item.name;
        return (
          <TouchableOpacity
            style={[
              styles.countryItem,
              isSelected && styles.selectedCountryItem,
            ]}
            onPress={() => handleSelectCountry(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>
              {item.emoji || getFlagEmoji(item.code)}
            </Text>
            <Text
              style={[styles.countryName, isSelected && styles.selectedText]}
            >
              {item.name}
            </Text>
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={20}
                color={Colors.primaryColor}
              />
            )}
          </TouchableOpacity>
        );
      },
      [selectedCountry, handleSelectCountry, Colors, styles],
    );

    const handleClose = useCallback(() => {
      setSearchQuery('');
      onClose();
    }, [onClose]);

    return (
      <PickerBottomSheet
        visible={visible}
        onClose={handleClose}
        title="Select Country"
      >
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Countries List */}
        <FlatList
          data={filteredCountries}
          renderItem={renderCountryItem}
          keyExtractor={item => item.code}
          initialNumToRender={20}
          maxToRenderPerBatch={30}
          windowSize={10}
          style={styles.countryList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </PickerBottomSheet>
    );
  },
);

CountryPickerModal.displayName = 'CountryPickerModal';

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surfaceHover,
      margin: 16,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textColor,
      padding: 0,
    },
    countryList: {
      flex: 1,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderLight,
    },
    selectedCountryItem: {
      backgroundColor: Colors.primaryBg,
    },
    flag: {
      fontSize: 24,
      marginRight: 16,
    },
    countryName: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textPrimaryColor,
    },
    selectedText: {
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.primaryColor,
    },
  });

export default CountryPickerModal;
