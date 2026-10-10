// hooks/useTextStyles.ts
import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACING,
  LINE_HEIGHTS,
  TEXT_VARIANTS,
} from '@/constants/typography';
import { StyleSheet } from 'react-native';
import { useDimensions } from './useDimensions';
import { useThemeStyles } from './useThemeStyles';

export const useTextStyles = () => {
  const { colors } = useThemeStyles();
  const { fontScale: responsiveFontSize, mediaQuery } = useDimensions();

  // Helper function for responsive line heights
  const responsiveLineHeight = (fontSize: number, baseLineHeight: number) => {
    const ratio = baseLineHeight / fontSize;
    return Math.round(responsiveFontSize(fontSize) * ratio);
  };

  // Base text styles
  const baseTextStyles = StyleSheet.create({
    /* Material Design Typography */
    [TEXT_VARIANTS.displayLarge]: {
      fontFamily: FONT_FAMILIES.interExtraBold,
      fontSize: responsiveFontSize(FONT_SIZES.xxxxl),
      lineHeight: responsiveLineHeight(FONT_SIZES.xxxxl, LINE_HEIGHTS.xxxxl),
      letterSpacing: LETTER_SPACING.tight,
      color: colors.textColor,
      fontWeight: FONT_WEIGHTS.extraBold,
    },
    // ... include all other text variants similarly
  });

  // Text utilities
  const textUtilities = StyleSheet.create({
    /* Text Variants */
    textPrimary: {
      color: colors.primaryColor,
    },
    textSecondary: {
      color: colors.secondaryColor,
    },
    // ... include all other text utilities
  });

  // Responsive text styles
  const responsiveTextStyles = StyleSheet.create({
    responsiveTitle: mediaQuery({
      xs: {
        fontSize: responsiveFontSize(FONT_SIZES.md),
        lineHeight: responsiveLineHeight(FONT_SIZES.md, LINE_HEIGHTS.md),
      },
      sm: {
        fontSize: responsiveFontSize(FONT_SIZES.lg),
        lineHeight: responsiveLineHeight(FONT_SIZES.lg, LINE_HEIGHTS.lg),
      },
      default: {
        fontSize: responsiveFontSize(FONT_SIZES.lg),
        lineHeight: responsiveLineHeight(FONT_SIZES.lg, LINE_HEIGHTS.lg),
      },
    }),
    // ... other responsive styles
  });

  return {
    ...baseTextStyles,
    ...textUtilities,
    ...responsiveTextStyles,
  };
};
