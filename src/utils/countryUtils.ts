// ============================================
// Country Utilities - Auto-detection and data
// ============================================

import * as RNLocalize from 'react-native-localize';

export interface Country {
  name: string;
  code: string;
  emoji: string;
}

// Comprehensive country data with emoji flags
export const countriesData: Country[] = [
  { name: 'Afghanistan', code: 'AF', emoji: '🇦🇫' },
  { name: 'Albania', code: 'AL', emoji: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', emoji: '🇩🇿' },
  { name: 'Argentina', code: 'AR', emoji: '🇦🇷' },
  { name: 'Australia', code: 'AU', emoji: '🇦🇺' },
  { name: 'Austria', code: 'AT', emoji: '🇦🇹' },
  { name: 'Bangladesh', code: 'BD', emoji: '🇧🇩' },
  { name: 'Belgium', code: 'BE', emoji: '🇧🇪' },
  { name: 'Brazil', code: 'BR', emoji: '🇧🇷' },
  { name: 'Canada', code: 'CA', emoji: '🇨🇦' },
  { name: 'Chile', code: 'CL', emoji: '🇨🇱' },
  { name: 'China', code: 'CN', emoji: '🇨🇳' },
  { name: 'Colombia', code: 'CO', emoji: '🇨🇴' },
  { name: 'Czech Republic', code: 'CZ', emoji: '🇨🇿' },
  { name: 'Denmark', code: 'DK', emoji: '🇩🇰' },
  { name: 'Egypt', code: 'EG', emoji: '🇪🇬' },
  { name: 'Finland', code: 'FI', emoji: '🇫🇮' },
  { name: 'France', code: 'FR', emoji: '🇫🇷' },
  { name: 'Germany', code: 'DE', emoji: '🇩🇪' },
  { name: 'Greece', code: 'GR', emoji: '🇬🇷' },
  { name: 'Hong Kong', code: 'HK', emoji: '🇭🇰' },
  { name: 'Hungary', code: 'HU', emoji: '🇭🇺' },
  { name: 'Iceland', code: 'IS', emoji: '🇮🇸' },
  { name: 'India', code: 'IN', emoji: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', emoji: '🇮🇩' },
  { name: 'Iran', code: 'IR', emoji: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', emoji: '🇮🇶' },
  { name: 'Ireland', code: 'IE', emoji: '🇮🇪' },
  { name: 'Israel', code: 'IL', emoji: '🇮🇱' },
  { name: 'Italy', code: 'IT', emoji: '🇮🇹' },
  { name: 'Japan', code: 'JP', emoji: '🇯🇵' },
  { name: 'Kenya', code: 'KE', emoji: '🇰🇪' },
  { name: 'Kuwait', code: 'KW', emoji: '🇰🇼' },
  { name: 'Malaysia', code: 'MY', emoji: '🇲🇾' },
  { name: 'Mexico', code: 'MX', emoji: '🇲🇽' },
  { name: 'Morocco', code: 'MA', emoji: '🇲🇦' },
  { name: 'Netherlands', code: 'NL', emoji: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', emoji: '🇳🇿' },
  { name: 'Nigeria', code: 'NG', emoji: '🇳🇬' },
  { name: 'Norway', code: 'NO', emoji: '🇳🇴' },
  { name: 'Pakistan', code: 'PK', emoji: '🇵🇰' },
  { name: 'Peru', code: 'PE', emoji: '🇵🇪' },
  { name: 'Philippines', code: 'PH', emoji: '🇵🇭' },
  { name: 'Poland', code: 'PL', emoji: '🇵🇱' },
  { name: 'Portugal', code: 'PT', emoji: '🇵🇹' },
  { name: 'Qatar', code: 'QA', emoji: '🇶🇦' },
  { name: 'Romania', code: 'RO', emoji: '🇷🇴' },
  { name: 'Russia', code: 'RU', emoji: '🇷🇺' },
  { name: 'Saudi Arabia', code: 'SA', emoji: '🇸🇦' },
  { name: 'Singapore', code: 'SG', emoji: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', emoji: '🇿🇦' },
  { name: 'South Korea', code: 'KR', emoji: '🇰🇷' },
  { name: 'Spain', code: 'ES', emoji: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', emoji: '🇱🇰' },
  { name: 'Sweden', code: 'SE', emoji: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', emoji: '🇨🇭' },
  { name: 'Taiwan', code: 'TW', emoji: '🇹🇼' },
  { name: 'Thailand', code: 'TH', emoji: '🇹🇭' },
  { name: 'Turkey', code: 'TR', emoji: '🇹🇷' },
  { name: 'Ukraine', code: 'UA', emoji: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', emoji: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', emoji: '🇬🇧' },
  { name: 'United States', code: 'US', emoji: '🇺🇸' },
  { name: 'Venezuela', code: 'VE', emoji: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', emoji: '🇻🇳' },
];

/**
 * Get country by code
 */
export const getCountryByCode = (code: string): Country | undefined => {
  return countriesData.find(
    country => country.code.toLowerCase() === code.toLowerCase(),
  );
};

/**
 * Get country by name
 */
export const getCountryByName = (name: string): Country | undefined => {
  return countriesData.find(
    country => country.name.toLowerCase() === name.toLowerCase(),
  );
};

/**
 * Get country name by code
 */
export const getCountryNameByCode = (code: string): string | undefined => {
  const country = getCountryByCode(code);
  return country?.name;
};

/**
 * Get flag emoji from country code
 */
export const getFlagEmoji = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  if (country) return country.emoji;

  // Fallback: generate emoji from country code
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

/**
 * Auto-detect user's country using react-native-localize
 * Returns the detected country or defaults to United States
 */
export const detectUserCountry = async (): Promise<Country> => {
  try {
    // Get the device's country code
    const countryCode = RNLocalize.getCountry();

    if (countryCode) {
      const country = getCountryByCode(countryCode);
      if (country) {
        console.log('[CountryUtils] Detected country:', country.name);
        return country;
      }
    }

    // Fallback: try to get from locales
    const locales = RNLocalize.getLocales();
    if (locales && locales.length > 0) {
      const locale = locales[0];
      if (locale?.countryCode) {
        const country = getCountryByCode(locale.countryCode);
        if (country) {
          console.log(
            '[CountryUtils] Detected country from locale:',
            country.name,
          );
          return country;
        }
      }
    }

    // Default fallback
    console.log('[CountryUtils] Using default country: United States');
    return (
      getCountryByCode('US') || {
        name: 'United States',
        code: 'US',
        emoji: '🇺🇸',
      }
    );
  } catch (error) {
    console.error('[CountryUtils] Error detecting country:', error);
    return {
      name: 'United States',
      code: 'US',
      emoji: '🇺🇸',
    };
  }
};

/**
 * Get country display string with flag
 */
export const getCountryDisplayString = (
  countryName: string | undefined,
  isLoading?: boolean,
): string => {
  if (isLoading) return 'Detecting...';
  if (!countryName) return 'Select Country';

  const country = getCountryByName(countryName);
  if (country) {
    return `${country.emoji} ${country.name}`;
  }
  return countryName;
};

export default {
  countriesData,
  getCountryByCode,
  getCountryByName,
  getCountryNameByCode,
  getFlagEmoji,
  detectUserCountry,
  getCountryDisplayString,
};
