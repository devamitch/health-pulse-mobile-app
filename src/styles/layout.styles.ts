import { scale, screenMatch, verticalScale } from '@/hooks/styles/responsive';

export const LayoutStyles = {
  // Spacing
  spacing: {
    none: 0,
    xxs: scale(2),
    xs: scale(4),
    sm: scale(8),
    md: scale(12),
    lg: scale(16),
    xl: scale(24),
    xxl: scale(32),
    xxxl: scale(48),
    xxxxl: scale(64),
  },

  // Borders
  borders: {
    none: 0,
    hairline: scale(0.5),
    thin: scale(1),
    thick: scale(2),
    extraThick: scale(4),
  },

  // Radius
  radius: {
    none: 0,
    xs: scale(4),
    sm: scale(8),
    md: scale(12),
    lg: scale(16),
    xl: scale(24),
    xxl: scale(32),
    round: scale(9999),
  },

  // Shadows
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(1) },
      shadowOpacity: 0.18,
      shadowRadius: scale(1),
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.2,
      shadowRadius: scale(3),
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.23,
      shadowRadius: scale(6),
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(6) },
      shadowOpacity: 0.3,
      shadowRadius: scale(8),
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(8) },
      shadowOpacity: 0.35,
      shadowRadius: scale(10),
      elevation: 12,
    },
  },

  // Layout
  container: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  flexStart: {
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
  },
  flexEnd: {
    alignItems: 'flex-end' as const,
    justifyContent: 'flex-end' as const,
  },
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  spaceEvenly: {
    justifyContent: 'space-evenly' as const,
  },
  wrap: {
    flexWrap: 'wrap' as const,
  },
  noWrap: {
    flexWrap: 'nowrap' as const,
  },

  // Responsive Layout
  responsivePadding: screenMatch({
    small: {
      paddingHorizontal: scale(12),
    },
    large: {
      paddingHorizontal: scale(24),
    },
    default: {
      paddingHorizontal: scale(16),
    },
  }),

  responsiveMargin: screenMatch({
    small: {
      marginVertical: verticalScale(8),
    },
    large: {
      marginVertical: verticalScale(16),
    },
    default: {
      marginVertical: verticalScale(12),
    },
  }),

  // Absolute Positioning
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  absoluteTop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
  },
  absoluteBottom: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Dimensions
  screenWidth: {
    width: '100%' as const,
  },
  screenHeight: {
    height: '100%' as const,
  },
  halfWidth: {
    width: '50%' as const,
  },
  quarterWidth: {
    width: '25%' as const,
  },
  thirdHeight: {
    height: '33.33%' as const,
  },
};
