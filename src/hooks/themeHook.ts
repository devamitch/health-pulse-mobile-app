import { useTheme } from '@react-navigation/native';
import {
  ColorScheme,
  darkTheme,
  ElevationScheme,
  lightTheme,
} from '../constants/theme';
import { NativeTheme } from './use-nav-theme';

export type CustomThemeType = NativeTheme & {
  Colors: NativeTheme['Colors'] & ColorScheme;
  DEffect: ElevationScheme;
};

export const useAppTheme = (): CustomThemeType => {
  const theme = useTheme() as NativeTheme;
  const isDark = theme.dark;

  const Colors = isDark
    ? { ...theme.Colors, ...darkTheme }
    : { ...theme.Colors, ...lightTheme };

  return {
    ...theme,
    Colors,
    DEffect: theme.DEffect,
  } as CustomThemeType;
};
