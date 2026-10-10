'use client';

/**
 * Country Wheel Picker Component
 * Specialized wheel picker for country selection
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import WheelPicker, { WheelPickerItem } from './WheelPicker';

interface CountryWheelPickerProps {
  selectedCountry: string;
  onCountryChange: (country: string, code: string) => void;
  containerStyle?: ViewStyle;
  label?: string;
  showLabel?: boolean;
  showSearch?: boolean;
}

// Comprehensive country list with codes
const COUNTRIES = [
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Albania', code: 'AL' },
  { name: 'Algeria', code: 'DZ' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Austria', code: 'AT' },
  { name: 'Bangladesh', code: 'BD' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Canada', code: 'CA' },
  { name: 'Chile', code: 'CL' },
  { name: 'China', code: 'CN' },
  { name: 'Colombia', code: 'CO' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Egypt', code: 'EG' },
  { name: 'Finland', code: 'FI' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Greece', code: 'GR' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'Hungary', code: 'HU' },
  { name: 'Iceland', code: 'IS' },
  { name: 'India', code: 'IN' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Iran', code: 'IR' },
  { name: 'Iraq', code: 'IQ' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Israel', code: 'IL' },
  { name: 'Italy', code: 'IT' },
  { name: 'Japan', code: 'JP' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Kuwait', code: 'KW' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Morocco', code: 'MA' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'New Zealand', code: 'NZ' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Norway', code: 'NO' },
  { name: 'Pakistan', code: 'PK' },
  { name: 'Peru', code: 'PE' },
  { name: 'Philippines', code: 'PH' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Qatar', code: 'QA' },
  { name: 'Romania', code: 'RO' },
  { name: 'Russia', code: 'RU' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Singapore', code: 'SG' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Sri Lanka', code: 'LK' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Taiwan', code: 'TW' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
  { name: 'Venezuela', code: 'VE' },
  { name: 'Vietnam', code: 'VN' },
];

const CountryWheelPicker: React.FC<CountryWheelPickerProps> = ({
  selectedCountry,
  onCountryChange,
  containerStyle,
  label = 'Country',
  showLabel = true,
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const countryItems: WheelPickerItem[] = useMemo(() => {
    return filteredCountries.map(country => ({
      label: country.name,
      value: country.code,
    }));
  }, [filteredCountries]);

  const handleValueChange = (value: string | number) => {
    const country = COUNTRIES.find(c => c.code === value);
    if (country) {
      onCountryChange(country.name, country.code);
    }
  };

  // Find selected country code
  const selectedCode = COUNTRIES.find(c => c.name === selectedCountry)?.code || 'US';

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search country..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}
      
      <View style={styles.pickerContainer}>
        <WheelPicker
          items={countryItems}
          selectedValue={selectedCode}
          onValueChange={handleValueChange}
          itemHeight={50}
          visibleItems={5}
          width={250}
          textStyle={styles.pickerText}
          selectedTextStyle={styles.selectedPickerText}
        />
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
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 18,
    color: '#475569',
    fontFamily: 'Nunito-Regular',
  },
  selectedPickerText: {
    fontSize: 20,
    color: '#1857C1',
    fontFamily: 'Nunito-Bold',
  },
});

export default CountryWheelPicker;
