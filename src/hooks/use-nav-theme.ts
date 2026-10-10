import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { FontFamily, FontWeight } from '@/types/fonts';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

type FontStyle = {
  fontFamily: FontFamily;
  fontWeight: FontWeight;
};

export interface NativeTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  fonts: {
    regular: FontStyle;
    medium: FontStyle;
    bold: FontStyle;
    heavy: FontStyle;
  };
  Colors: Record<string, string>;
  DEffect: unknown;
}

const fonts: NativeTheme['fonts'] = {
  regular: {
    fontFamily: 'nunitoRegular',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'nunitoSemiBold',
    fontWeight: '500' as FontWeight,
  },
  bold: {
    fontFamily: 'nunitoBold',
    fontWeight: '700' as FontWeight,
  },
  heavy: {
    fontFamily: 'nunitoExtraBold',
    fontWeight: '800' as FontWeight,
  },
};

export const useAppNavTheme = () => {
  const theme = useAppSelector(state => state.theme);
  const isDark = theme.colorScheme === 'dark';

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    dark: isDark,

    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primaryColor,
      background: theme.colors.backgroundColor,
      card: theme.colors.surface,
      text: theme.colors.textColor,
      border: theme.colors.greyColor400,
      notification: theme.colors.secondaryColor,
    },

    fonts,

    // Full design tokens for app usage
    Colors: {
      ...theme.colors,
    },

    // Elevation / shadow system
    DEffect: theme.elevation,
  } as const satisfies NativeTheme;

  return navigationTheme;
};

export default useAppNavTheme;
