// hooks/useDimensions.ts
import { Platform, useWindowDimensions } from 'react-native';

type Breakpoints = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

const breakpoints: Breakpoints = {
  xs: 320, // Extra small devices (phones)
  sm: 576, // Small devices (large phones)
  md: 768, // Medium devices (tablets)
  lg: 992, // Large devices (desktops)
  xl: 1200, // Extra large devices (large desktops)
  xxl: 1440, // Extra extra large devices
};

// Base dimensions for scaling (iPhone 6/7/8 standard)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

export const useDimensions = () => {
  const dimensions = useWindowDimensions();

  // Screen size detection
  const isXs = dimensions.width <= breakpoints.xs;
  const isSm =
    dimensions.width > breakpoints.xs && dimensions.width <= breakpoints.sm;
  const isMd =
    dimensions.width > breakpoints.sm && dimensions.width <= breakpoints.md;
  const isLg =
    dimensions.width > breakpoints.md && dimensions.width <= breakpoints.lg;
  const isXl =
    dimensions.width > breakpoints.lg && dimensions.width <= breakpoints.xl;
  const isXxl = dimensions.width > breakpoints.xl;

  const isSmallScreen = dimensions.width <= breakpoints.md;
  const isLargeScreen = dimensions.width > breakpoints.md;
  const isLandscape = dimensions.width > dimensions.height;
  const isTablet =
    dimensions.width >= breakpoints.md ||
    (dimensions.height >= breakpoints.md && isLandscape);

  // Memoize scaling functions for better performance
  const scale = <T extends number>(size: T) => {
    const scaledSize = (dimensions.width / BASE_WIDTH) * size;

    // Adjust scaling based on screen size
    if (isXs) return scaledSize * 0.9;
    if (isSm) return scaledSize * 0.95;
    if (isLg) return scaledSize * 1.05;
    if (isXl) return scaledSize * 1.1;
    if (isXxl) return scaledSize * 1.15;

    return scaledSize;
  };

  const verticalScale = (size: number) => {
    const scaledSize = (dimensions.height / BASE_HEIGHT) * size;
    return isLandscape ? scaledSize * 0.9 : scaledSize;
  };

  const moderateScale = (size: number, factor = 0.5) => {
    return size + (scale(size) - size) * factor;
  };

  const fontScale = (size: number, factor = 0.5) => {
    let scaledSize = moderateScale(size, factor);

    // Platform adjustments
    if (Platform.OS === 'android') scaledSize *= 0.97;
    if (Platform.OS === 'ios') scaledSize *= 1.03;

    // Screen size adjustments
    if (isXs) scaledSize *= 0.95;
    if (isXxl) scaledSize *= 1.05;

    // Minimum font size
    return Math.max(10, scaledSize);
  };

  // Media query function
  const mediaQuery = <T>(queries: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    xxl?: T;
    default: T;
  }): T => {
    if (isXs && queries.xs) return queries.xs;
    if (isSm && queries.sm) return queries.sm;
    if (isMd && queries.md) return queries.md;
    if (isLg && queries.lg) return queries.lg;
    if (isXl && queries.xl) return queries.xl;
    if (isXxl && queries.xxl) return queries.xxl;
    return queries.default;
  };

  return {
    width: dimensions.width,
    height: dimensions.height,
    scale,
    verticalScale,
    moderateScale,
    fontScale,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isSmallScreen,
    isLargeScreen,
    isLandscape,
    isTablet,
    mediaQuery,
    breakpoints,
  };
};
