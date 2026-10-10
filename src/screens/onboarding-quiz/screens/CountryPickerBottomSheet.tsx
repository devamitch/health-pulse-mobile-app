'use client';

/**
 * CountryPickerBottomSheet - Optimized Country Picker with Wheel Selector
 */

import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { addQuiz } from '@/services/mmkv-redux/slices';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLocales } from 'react-native-localize';
import Animated, { FadeIn } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CountryWheelPicker } from '../components/WheelPicker';

// Country data with ISO codes
export const COUNTRIES = [
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

export type Country = (typeof COUNTRIES)[number];

// Convert ISO country code to flag emoji
export const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Get country by code
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(c => c.code === code);
};

// Get country by name
export const getCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase());
};

// Get country name by code
export const getCountryNameByCode = (code: string): string | undefined => {
  const country = COUNTRIES.find(c => c.code === code);
  return country?.name;
};

// Detect user's country from device locale
export const detectUserCountry = async (): Promise<Country> => {
  try {
    const locales = await getLocales();
    if (locales && locales.length > 0) {
      // Try to get country from locale (e.g., "en_US" -> "US")
      const locale = locales[0];
      const countryCode = locale?.substring(locale.length - 2).toUpperCase();
      const country = getCountryByCode(countryCode);
      if (country) return country;
    }
  } catch (error) {
    console.log('[CountryPicker] Error detecting locale:', error);
  }
  // Default to United States
  return COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0];
};

interface CountryPickerBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  selectedCountry: string; // This should be country NAME, not code
  onCountryChange: (countryName: string, countryCode: string) => void;
  onClose?: () => void;
}

const CountryPickerBottomSheet: React.FC<CountryPickerBottomSheetProps> = ({
  bottomSheetRef,
  selectedCountry,
  onCountryChange,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);

  // Find selected country code from country name
  const selectedCode = useMemo(() => {
    const country = COUNTRIES.find(c => c.name === selectedCountry);
    return country?.code || 'US';
  }, [selectedCountry]);

  // Handle country change
  const handleCountryChange = useCallback(
    (countryName: string, countryCode: string) => {
      console.log(`🌍 Country selected: ${countryName} (${countryCode})`);

      // First, update the parent component
      onCountryChange(countryName, countryCode);

      // Then save to Redux
      const country_data = {
        id: 6,
        question: 'Where are you located?',
        answerString: `I am located in ${countryName}.`,
        questionTag: 'Country',
        answer: countryName,
      };
      dispatch(addQuiz(country_data));

      // Keyboard.dismiss();
      // setTimeout(() => {
      //   // bottomSheetRef.current?.close();
      //   onClose?.();
      // }, 300);
    },
    [onCountryChange, bottomSheetRef, onClose, dispatch],
  );

  // Handle close button
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
    onClose?.();
  }, [bottomSheetRef, onClose]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['60%']}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
      keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Country</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Country Wheel Picker */}
        <View style={styles.pickerContainer}>
          <CountryWheelPicker
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            containerStyle={styles.wheelPickerContainer}
            showLabel={false}
            showSearch={true}
          />
        </View>

        {/* Selected Country Info */}
        <Animated.View
          entering={FadeIn.delay(300).duration(300)}
          style={styles.selectedInfoContainer}
        >
          <Text style={styles.selectedFlag}>{getFlagEmoji(selectedCode)}</Text>
          <Text style={styles.selectedCountryName}>
            {selectedCountry || 'Select a country'}
          </Text>
          <Text style={styles.selectedCountryCode}>{selectedCode}</Text>
        </Animated.View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelPickerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  selectedInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1857C1',
  },
  selectedFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  selectedCountryName: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    marginRight: 8,
  },
  selectedCountryCode: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export default CountryPickerBottomSheet;
