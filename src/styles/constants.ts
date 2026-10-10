// constants.styles.ts
import { fontScale } from '@/hooks/styles/responsive';
import { Dimensions, Platform } from 'react-native';

// Screen dimensions
const { width, height } = Dimensions.get('window');
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const IS_SMALL_SCREEN = width < 375;
export const IS_LARGE_SCREEN = width >= 768;
export const IS_IOS = Platform.OS === 'ios';

// Spacing system (4px baseline)
export const SPACING = {
  none: fontScale(0),
  xxs: fontScale(4),
  xs: fontScale(8),
  sm: fontScale(12),
  md: fontScale(16),
  lg: fontScale(24),
  xl: fontScale(32),
  xxl: fontScale(48),
  xxxl: fontScale(64),
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: fontScale(0),
  xs: fontScale(4),
  sm: fontScale(8),
  md: fontScale(12),
  lg: fontScale(16),
  xl: fontScale(24),
  pill: 500, // remains large for actual pill shape
  circle: 999, // same here
} as const;

// Border width
export const BORDER_WIDTH = {
  none: fontScale(0),
  hairline: fontScale(0.5),
  thin: fontScale(1),
  medium: fontScale(1.5),
  thick: fontScale(2),
} as const;

// Opacity levels
export const OPACITY = {
  transparent: 0,
  semiTransparent: 0.5,
  opaque: 1,
  disabled: 0.3,
} as const;

// Shadow levels
export const SHADOW = {
  none: {},
  sm: {
    shadowOffset: { width: 0, height: fontScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: fontScale(4),
    elevation: fontScale(2),
  },
  md: {
    shadowOffset: { width: 0, height: fontScale(4) },
    shadowOpacity: 0.15,
    shadowRadius: fontScale(8),
    elevation: fontScale(4),
  },
  lg: {
    shadowOffset: { width: 0, height: fontScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: fontScale(16),
    elevation: fontScale(8),
  },
} as const;

// Z-index system
export const Z_INDEX = {
  auto: 'auto',
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

// Aspect ratios
export const ASPECT_RATIO = {
  square: 1,
  landscape: 16 / 9,
  portrait: 9 / 16,
  widescreen: 21 / 9,
} as const;
