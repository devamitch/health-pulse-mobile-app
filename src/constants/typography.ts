export const FONT_FAMILIES = {
  interThin: 'Inter-Thin',
  interExtraLight: 'Inter-ExtraLight',
  interLight: 'Inter-Light',
  interRegular: 'Inter-Regular',
  interMedium: 'Inter-Medium',
  interSemiBold: 'Inter-SemiBold',
  interBold: 'Inter-Bold',
  interExtraBold: 'Inter-ExtraBold',
  interBlack: 'Inter-Black',
  nunitoLight: 'Nunito-Light',
  nunitoRegular: 'Nunito-Regular',
  nunitoMedium: 'Nunito-Medium',
  nunitoSemiBold: 'Nunito-SemiBold',
  nunitoBold: 'Nunito-Bold',
  nunitoExtraBold: 'Nunito-ExtraBold',
  nunitoBlack: 'Nunito-Black',
  robotoMonoRegular: 'RobotoMono-Regular',
  robotoMonoMedium: 'RobotoMono-Medium',
  robotoMonoBold: 'RobotoMono-Bold',
  urbanistRegular: 'Urbanist-Regular',
  urbanistItalic: 'Urbanist-Italic',
} as const;

export const FONT_SIZES = {
  xxxxl: 60, // Display Large
  xxxl: 48, // Display Medium
  xxl: 36, // Display Small / Headline Large
  xl: 30, // Headline Medium
  lg: 24, // Headline Small / Title Large
  md: 20, // Title Medium / Body Large
  sm: 16, // Title Small / Body Medium / Label Large
  xs: 14, // Body Small / Label Medium
  xxs: 12, // Label Small
  xxxs: 10, // Caption
} as const;

export const LINE_HEIGHTS = {
  xxxxl: 72, // 1.2x
  xxxl: 58, // ~1.2x
  xxl: 44, // ~1.22x
  xl: 36, // 1.2x
  lg: 32, // ~1.33x
  md: 28, // 1.4x
  sm: 24, // 1.5x
  xs: 20, // ~1.43x
  xxs: 18, // 1.5x
  xxxs: 14, // 1.4x
} as const;

export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
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

export const TEXT_VARIANTS = {
  displayLarge: 'displayLarge',
  displayMedium: 'displayMedium',
  displaySmall: 'displaySmall',
  headlineLarge: 'headlineLarge',
  headlineMedium: 'headlineMedium',
  headlineSmall: 'headlineSmall',
  titleLarge: 'titleLarge',
  titleMedium: 'titleMedium',
  titleSmall: 'titleSmall',
  bodyLarge: 'bodyLarge',
  bodyMedium: 'bodyMedium',
  bodySmall: 'bodySmall',
  labelLarge: 'labelLarge',
  labelMedium: 'labelMedium',
  labelSmall: 'labelSmall',
  buttonLarge: 'buttonLarge',
  buttonMedium: 'buttonMedium',
  buttonSmall: 'buttonSmall',
} as const;
