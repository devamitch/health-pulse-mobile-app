// font.styles.ts
import { ColorScheme } from '@/constants/theme';
import {
  COLOR_KEYS,
  ColorKey,
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  TEXT_DECORATIONS,
  TEXT_TRANSFORMS,
  TextDecoration,
  TextTransform,
} from '@/services/config/fonts';
import { FontFamily, FontSize } from '@/types/fonts';
import { StyleSheet, TextStyle } from 'react-native';

type TextStyleKey =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'buttonLarge'
  | 'buttonMedium'
  | 'buttonSmall';

type TextAlignKey = 'left' | 'center' | 'right';

export const TEXT_STYLES = StyleSheet.create({
  // Display
  displayLarge: {
    fontFamily: FONT_FAMILIES.nunitoExtraBold,
    fontSize: FONT_SIZES.xxxxl,
    lineHeight: FONT_SIZES.xxxxl * 1.2,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: FONT_FAMILIES.nunitoBold,
    fontSize: FONT_SIZES.xxxl,
    lineHeight: FONT_SIZES.xxxl * 1.2,
  },
  displaySmall: {
    fontFamily: FONT_FAMILIES.nunitoBold,
    fontSize: FONT_SIZES.xxl,
    lineHeight: FONT_SIZES.xxl * 1.2,
  },

  // Headings
  heading1: {
    fontFamily: FONT_FAMILIES.nunitoBold,
    fontSize: FONT_SIZES.xl,
    lineHeight: FONT_SIZES.xl * 1.3,
  },
  heading2: {
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontSize: FONT_SIZES.lg,
    lineHeight: FONT_SIZES.lg * 1.3,
  },
  heading3: {
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.3,
  },

  // Body
  bodyLarge: {
    fontFamily: FONT_FAMILIES.nunitoRegular,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILIES.nunitoRegular,
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  bodySmall: {
    fontFamily: FONT_FAMILIES.nunitoRegular,
    fontSize: FONT_SIZES.xs,
    lineHeight: FONT_SIZES.xs * 1.5,
  },

  // Labels
  labelLarge: {
    fontFamily: FONT_FAMILIES.nunitoMedium,
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.3,
  },
  labelMedium: {
    fontFamily: FONT_FAMILIES.nunitoMedium,
    fontSize: FONT_SIZES.xs,
    lineHeight: FONT_SIZES.xs * 1.3,
  },
  labelSmall: {
    fontFamily: FONT_FAMILIES.nunitoMedium,
    fontSize: FONT_SIZES.xxs,
    lineHeight: FONT_SIZES.xxs * 1.3,
  },

  // Buttons
  buttonLarge: {
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.2,
    letterSpacing: 0.5,
  },
  buttonMedium: {
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.2,
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontSize: FONT_SIZES.xs,
    lineHeight: FONT_SIZES.xs * 1.2,
  },
} as const satisfies Record<TextStyleKey, TextStyle>);

// Alignment
export const TEXT_ALIGN = StyleSheet.create<Record<TextAlignKey, TextStyle>>({
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
} as const);

// Text decoration & transform helpers
export const TEXT_DECORATION = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
  lineThrough: { textDecorationLine: 'line-through' },
  none: { textDecorationLine: 'none' },
} as const);

export const TEXT_TRANSFORM = StyleSheet.create({
  uppercase: { textTransform: 'uppercase' },
  lowercase: { textTransform: 'lowercase' },
  capitalize: { textTransform: 'capitalize' },
  none: { textTransform: 'none' },
} as const);

// Dynamic color variants (use with your color theme)
export const getTextColorStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    textDefault: { color: colors.textColor },
    textPrimary: { color: colors.primaryColor },
    textSecondary: { color: colors.secondaryColor },
    textMuted: { color: colors.greyColor600 },
    textWhite: { color: colors.white },
    textBlack: { color: colors.black },
    textSuccess: { color: colors.greenColor },
    textError: { color: colors.red },
    textWarning: { color: colors.secondaryColor },
  } as const);

// Optional: icon fonts as text style helpers
// Optional: icon fonts as text style helpers
export const ICON_FONTS = StyleSheet.create({
  antDesign: { fontFamily: FONT_FAMILIES.antDesign },
  feather: { fontFamily: FONT_FAMILIES.feather },
  materialIcons: { fontFamily: FONT_FAMILIES.materialIcons },
  fontAwesome: { fontFamily: FONT_FAMILIES.fontAwesome },
  // add others if needed
} as const);

type FontStyleKey =
  `${FontFamily}_${FontSize}_${ColorKey}_${TextDecoration}_${TextTransform}`;

export type CombinedFontStyles = Record<FontStyleKey, TextStyle>;

/**
 * Generates all type-safe combinations of font styles
 */
export const createCombinedFontStyles = (
  colors: ColorScheme,
): CombinedFontStyles => {
  const colorMap: Record<ColorKey, string> = {
    primary: colors.primaryColor,
    secondary: colors.secondaryColor,
    text: colors.textColor,
    muted: colors.greyColor600,
    white: colors.white,
    black: colors.black,
    success: colors.greenColor,
    error: colors.red,
    warning: colors.primaryColor ?? colors.secondaryColor,
  };

  const styles: Partial<CombinedFontStyles> = {};

  Object.keys(FONT_FAMILIES).forEach(family => {
    Object.keys(FONT_SIZES).forEach(size => {
      COLOR_KEYS.forEach(color => {
        TEXT_DECORATIONS.forEach(decoration => {
          TEXT_TRANSFORMS.forEach(transform => {
            const key: FontStyleKey = `${family}_${size}_${color}_${decoration}_${transform}`;

            styles[key] = {
              fontFamily: FONT_FAMILIES[family],
              fontSize: FONT_SIZES[size],
              lineHeight: FONT_SIZES[size] * 1.3,
              fontWeight: FONT_WEIGHTS[family],
              color: colorMap[color],
              textDecorationLine:
                decoration === 'lineThrough' ? 'line-through' : decoration,
              textTransform: transform === 'none' ? undefined : transform,
            };
          });
        });
      });
    });
  });

  return StyleSheet.create(styles) as CombinedFontStyles;
};
