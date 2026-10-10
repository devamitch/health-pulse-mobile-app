import { Dimensions, Platform, ScaledSize } from 'react-native';

// Base design dimensions (iPhone 13/14 standard portrait)
const BASE_WIDTH = 375 as const;
const BASE_HEIGHT = 812 as const;

// Screen size breakpoints
const SCREEN_SIZES = {
  xs: 320, // iPhone SE, Galaxy Fold
  sm: 375, // iPhone 13 mini, most Android phones
  md: 414, // iPhone 13/14 Pro Max
  lg: 768, // iPad portrait
  xl: 1024, // iPad landscape
} as const;

// Get initial dimensions
let { width, height }: ScaledSize = Dimensions.get('window');

// Listen for orientation changes
Dimensions.addEventListener('change', ({ window }) => {
  width = window.width;
  height = window.height;
});

// Type-safe scaling functions
const scale = <T extends number>(size: T): T => {
  const scaledSize = (width / BASE_WIDTH) * size;

  // Apply different scaling for different screen sizes
  if (width <= SCREEN_SIZES.xs) {
    // Extra small screens (like iPhone SE)
    return (scaledSize * 0.9) as T;
  } else if (width <= SCREEN_SIZES.sm) {
    // Small screens
    return (scaledSize * 0.95) as T;
  } else if (width >= SCREEN_SIZES.lg) {
    // Large screens (tablets)
    return (scaledSize * 1.1) as T;
  }

  return scaledSize as T;
};

const verticalScale = <T extends number>(size: T): T => {
  const scaledSize = (height / BASE_HEIGHT) * size;

  // Handle landscape mode
  if (width > height) {
    return (scaledSize * 0.9) as T;
  }

  return scaledSize as T;
};

const moderateScale = <T extends number>(size: T, factor = 0.5): T => {
  return (size + (scale(size) - size) * factor) as T;
};

const fontScale = <T extends number>(size: T, factor = 0.5): T => {
  let scaledSize = moderateScale(size, factor);

  // Platform-specific adjustments
  if (Platform.OS === 'android') {
    // Android tends to render fonts slightly larger
    scaledSize = (scaledSize * 0.97) as T;
  }

  // Minimum font size for readability
  const MIN_FONT_SIZE = 10 as const;

  if (scaledSize < MIN_FONT_SIZE) {
    return MIN_FONT_SIZE as T;
  }

  // Handle very large screens
  if (width >= SCREEN_SIZES.xl) {
    scaledSize = (scaledSize * 1.05) as T;
  }

  return scaledSize as T;
};

// Screen size conditions
export const isSmallScreen = width <= SCREEN_SIZES.sm;
export const isLargeScreen = width >= SCREEN_SIZES.lg;
export const isPortrait = height >= width;

// Media query-like function
export const screenMatch = <T>(conditions: {
  small?: T;
  medium?: T;
  large?: T;
  default: T;
}): T => {
  if (width <= SCREEN_SIZES.sm && conditions.small) {
    return conditions.small;
  }
  if (width >= SCREEN_SIZES.lg && conditions.large) {
    return conditions.large;
  }
  return conditions.default;
};

export { fontScale, moderateScale, scale, verticalScale };
