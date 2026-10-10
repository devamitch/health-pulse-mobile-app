import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
} from '@/services/config/fonts';

// Infer the types from the constants
export type FontFamily = keyof typeof FONT_FAMILIES;
export type FontSize = keyof typeof FONT_SIZES;
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type FontWeightValue = (typeof FONT_WEIGHTS)[FontWeight];

// Utility type for responsive scaling function
export type ScaleFunction = <T extends number>(size: T) => T;
