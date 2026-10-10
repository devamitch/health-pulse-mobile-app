/* =========================================================
   COLOR SCALES (RAW, FUTURE-PROOF)
   Never use directly in UI
========================================================= */

const COLOR_SCALES = {
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  pink: {
    50: '#FFF1F6',
    100: '#FFE4EC',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#FE568D',
    600: '#E11D48',
    700: '#B03C64',
    800: '#9F1239',
    900: '#881337',
  },

  slate: {
    50: '#F9FAFB',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

/* =========================================================
   BRAND CONFIG (CHANGE HERE ONLY)
========================================================= */

const BRAND = {
  primary: COLOR_SCALES.blue, // 🔁 switch later to green / teal
  secondary: COLOR_SCALES.pink, // emotional accent
};

/* =========================================================
   LIGHT THEME
========================================================= */

export const lightTheme = {
  /* -------- Brand -------- */
  primaryColor: BRAND.primary[700],
  primaryLight: BRAND.primary[500],
  primaryDark: BRAND.primary[800],

  secondaryColor: BRAND.secondary[500],
  secondaryLight: BRAND.secondary[300],
  secondaryDark: BRAND.secondary[700],
  secondaryBg: BRAND.secondary[50],

  /* -------- Base -------- */
  black: '#000000',
  white: '#FFFFFF',
  isDark: false,

  /* -------- Backgrounds -------- */
  backgroundColor: COLOR_SCALES.slate[50],
  surface: '#FFFFFF',
  surfaceHover: COLOR_SCALES.slate[100],
  primaryBg: BRAND.primary[50],
  primaryBgHover: BRAND.primary[100],

  /* -------- Text -------- */
  textColor: COLOR_SCALES.slate[900],
  textPrimaryColor: COLOR_SCALES.slate[800],
  textSecondary: COLOR_SCALES.slate[600],
  textTertiary: COLOR_SCALES.slate[400],
  textDisabled: COLOR_SCALES.slate[300],

  /* -------- Greys -------- */
  greyColor: COLOR_SCALES.slate[100],
  greyColor100: COLOR_SCALES.slate[50],
  greyColor200: COLOR_SCALES.slate[100],
  greyColor400: COLOR_SCALES.slate[200],
  greyColor500: COLOR_SCALES.slate[300],
  greyColor600: COLOR_SCALES.slate[400],
  greyColor700: COLOR_SCALES.slate[500],
  greyColor900: COLOR_SCALES.slate[900],

  /* -------- Borders -------- */
  border: COLOR_SCALES.slate[200],
  borderLight: COLOR_SCALES.slate[100],
  borderDark: COLOR_SCALES.slate[300],

  /* -------- Semantic -------- */
  greenColor: COLOR_SCALES.green[600],
  lightGreenColor: COLOR_SCALES.green[50],

  error: '#DC2626',
  errorLight: '#FCA5A5',
  errorDark: '#991B1B',
  errorBg: '#FEF2F2',

  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#B45309',
  warningBg: '#FFFBEB',

  info: BRAND.primary[500],
  infoLight: BRAND.primary[300],
  infoDark: BRAND.primary[700],
  infoBg: BRAND.primary[50],

  /* -------- Utility -------- */
  red: '#CC0000',
  blueColor600: BRAND.primary[900],

  /* -------- Gradients -------- */
  gradientColor1: BRAND.primary[400],
  gradientColor2: BRAND.primary[700],

  /* -------- Effects -------- */
  shadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.25)',
} as const satisfies ColorSchemeCore;

/* =========================================================
   DARK THEME
========================================================= */

export const darkTheme = {
  /* -------- Brand -------- */
  primaryColor: BRAND.primary[400],
  primaryLight: BRAND.primary[300],
  primaryDark: BRAND.primary[600],

  secondaryColor: BRAND.secondary[700],
  secondaryLight: BRAND.secondary[400],
  secondaryDark: BRAND.secondary[800],
  secondaryBg: BRAND.secondary[900],

  /* -------- Base -------- */
  black: '#000000',
  white: '#0B1220',
  isDark: true,

  /* -------- Backgrounds -------- */
  backgroundColor: COLOR_SCALES.slate[900],
  surface: COLOR_SCALES.slate[800],
  surfaceHover: COLOR_SCALES.slate[700],
  primaryBg: BRAND.primary[900],
  primaryBgHover: BRAND.primary[800],

  /* -------- Text -------- */
  textColor: COLOR_SCALES.slate[100],
  textPrimaryColor: '#FFFFFF',
  textSecondary: COLOR_SCALES.slate[300],
  textTertiary: COLOR_SCALES.slate[400],
  textDisabled: COLOR_SCALES.slate[500],

  /* -------- Greys -------- */
  greyColor: COLOR_SCALES.slate[700],
  greyColor100: COLOR_SCALES.slate[800],
  greyColor200: COLOR_SCALES.slate[700],
  greyColor400: COLOR_SCALES.slate[600],
  greyColor500: COLOR_SCALES.slate[500],
  greyColor600: COLOR_SCALES.slate[400],
  greyColor700: COLOR_SCALES.slate[300],
  greyColor900: '#FFFFFF',

  /* -------- Borders -------- */
  border: COLOR_SCALES.slate[700],
  borderLight: COLOR_SCALES.slate[800],
  borderDark: COLOR_SCALES.slate[600],

  /* -------- Semantic -------- */
  greenColor: COLOR_SCALES.green[400],
  lightGreenColor: '#052E16',

  error: '#F87171',
  errorLight: '#FCA5A5',
  errorDark: '#DC2626',
  errorBg: '#3F0D0D',

  warning: '#FBBF24',
  warningLight: '#FCD34D',
  warningDark: '#B45309',
  warningBg: '#422006',

  info: BRAND.primary[400],
  infoLight: BRAND.primary[300],
  infoDark: BRAND.primary[600],
  infoBg: '#082F49',

  /* -------- Utility -------- */
  red: '#F87171',
  blueColor600: BRAND.primary[300],

  /* -------- Gradients -------- */
  gradientColor1: BRAND.primary[800],
  gradientColor2: BRAND.primary[500],

  /* -------- Effects -------- */
  shadow: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
} as const satisfies ColorSchemeCore;

/* =========================================================
   ELEVATION
========================================================= */

export const plain: ElevationScheme = {
  backgroundColor: '#f5f5f5',
};

export const thereD: ElevationScheme = {
  shadowColor: '#00000075',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 3.84,
  elevation: 4,
};

export const ultraThereD: ElevationScheme = {
  shadowColor: '#00000088',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 2.5,
};

export const ElevationStyle = {
  plain,
  '3d': thereD,
  ultra_3d: ultraThereD,
};

/* =========================================================
   TYPES (UNCHANGED)
========================================================= */

export interface ColorSchemeCore {
  primaryColor: string;
  textPrimaryColor: string;
  secondaryColor: string;

  black: string;
  white: string;

  backgroundColor: string;
  textColor: string;

  greyColor: string;
  greyColor100: string;
  greyColor200: string;
  greyColor400: string;
  greyColor500: string;
  greyColor600: string;
  greyColor700: string;
  greyColor900: string;

  gradientColor1: string;
  gradientColor2: string;

  blueColor600: string;
  lightGreenColor: string;
  greenColor: string;
  red: string;

  isDark: boolean;
}

export interface ElevationScheme {
  borderWidth?: number;
  borderColor?: string;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  backgroundColor?: string;
}

/* =========================================================
   EXPORTS
========================================================= */

export const ColorStyle = {
  light: lightTheme,
  dark: darkTheme,
};

export const THEME = {
  light: lightTheme,
  dark: darkTheme,
  elevation: ElevationStyle,
} as const;

export type ColorScheme = typeof lightTheme | typeof darkTheme;
