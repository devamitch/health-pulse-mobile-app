import { fontScale } from '@/hooks/styles/responsive';

export const FONT_FAMILIES = {
  // Icon fonts
  antDesign: 'AntDesign',
  entypo: 'Entypo',
  evilIcons: 'EvilIcons',
  feather: 'Feather',
  fontAwesome: 'FontAwesome',
  fontAwesome5Brands: 'FontAwesome5_Brands',
  fontAwesome5Regular: 'FontAwesome5_Regular',
  fontAwesome5Solid: 'FontAwesome5_Solid',
  fontAwesome6Brands: 'FontAwesome6_Brands',
  fontAwesome6Regular: 'FontAwesome6_Regular',
  fontAwesome6Solid: 'FontAwesome6_Solid',
  foundation: 'Foundation',
  ionicons: 'Ionicons',
  materialIcons: 'MaterialIcons',
  materialCommunityIcons: 'MaterialCommunityIcons',
  simpleLineIcons: 'SimpleLineIcons',
  octicons: 'Octicons',
  zocial: 'Zocial',
  fontisto: 'Fontisto',

  // Text fonts
  aptosBlack: 'Aptos-Black',
  aptosBold: 'Aptos-Bold',
  aptosExtraBold: 'Aptos-ExtraBold',
  aptosLight: 'Aptos-Light',
  aptosRegular: 'Aptos-Regular',
  aptosSemiBold: 'Aptos-SemiBold',
  aquaticoRegular: 'Aquatico-Regular',
  interBlack: 'Inter-Black',
  interBold: 'Inter-Bold',
  interExtraBold: 'Inter-ExtraBold',
  interExtraLight: 'Inter-ExtraLight',
  interLight: 'Inter-Light',
  interMedium: 'Inter-Medium',
  interRegular: 'Inter-Regular',
  interSemiBold: 'Inter-SemiBold',
  interThin: 'Inter-Thin',
  notoSans: 'NotoSans',
  nunitoBlack: 'Nunito-Black',
  nunitoBold: 'Nunito-Bold',
  nunitoExtraBold: 'Nunito-ExtraBold',
  nunitoExtraLight: 'Nunito-ExtraLight',
  nunitoLight: 'Nunito-Light',
  nunitoMedium: 'Nunito-Medium',
  nunitoRegular: 'Nunito-Regular',
  nunitoSemiBold: 'Nunito-SemiBold',
} as const;

export const FONT_SIZES = {
  xxxs: fontScale(10),
  xxs: fontScale(12),
  xs: fontScale(14),
  sm: fontScale(16),
  md: fontScale(18),
  lg: fontScale(20),
  xl: fontScale(24),
  xxl: fontScale(28),
  xxxl: fontScale(32),
  xxxxl: fontScale(40),
} as const;

export const FONT_WEIGHTS = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

/**
 * Text decorations
 */
export const TEXT_DECORATIONS = ['none', 'underline', 'lineThrough'] as const;
export type TextDecoration = (typeof TEXT_DECORATIONS)[number];

/**
 * Text transforms
 */
export const TEXT_TRANSFORMS = [
  'none',
  'uppercase',
  'lowercase',
  'capitalize',
] as const;
export type TextTransform = (typeof TEXT_TRANSFORMS)[number];

/**
 * Text alignments
 */
export const TEXT_ALIGNMENTS = ['left', 'center', 'right'] as const;
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];
/**
 * Icon font names
 */
export const ICON_FONTS = {
  antDesign: FONT_FAMILIES.antDesign,
  entypo: FONT_FAMILIES.entypo,
  evilIcons: FONT_FAMILIES.evilIcons,
  feather: FONT_FAMILIES.feather,
  fontAwesome: FONT_FAMILIES.fontAwesome,
  fontAwesome5Brands: FONT_FAMILIES.fontAwesome5Brands,
  fontAwesome5Regular: FONT_FAMILIES.fontAwesome5Regular,
  fontAwesome5Solid: FONT_FAMILIES.fontAwesome5Solid,
  fontAwesome6Brands: FONT_FAMILIES.fontAwesome6Brands,
  fontAwesome6Regular: FONT_FAMILIES.fontAwesome6Regular,
  fontAwesome6Solid: FONT_FAMILIES.fontAwesome6Solid,
  foundation: FONT_FAMILIES.foundation,
  ionicons: FONT_FAMILIES.ionicons,
  materialIcons: FONT_FAMILIES.materialIcons,
  materialCommunityIcons: FONT_FAMILIES.materialCommunityIcons,
  simpleLineIcons: FONT_FAMILIES.simpleLineIcons,
  octicons: FONT_FAMILIES.octicons,
  zocial: FONT_FAMILIES.zocial,
  fontisto: FONT_FAMILIES.fontisto,
} as const;

/**
 * Text style keys
 */
export type TextStyleKey =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'buttonLarge'
  | 'buttonMedium'
  | 'buttonSmall';

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  fontWeight?: string;
  textDecorationLine?: TextDecoration;
  textTransform?: TextTransform;
  textAlign?: TextAlignment;
  color?: string;
};

export const COLOR_KEYS = [
  'primary',
  'secondary',
  'text',
  'muted',
  'white',
  'black',
  'success',
  'error',
  'warning',
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];
