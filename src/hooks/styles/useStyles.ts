import { THEME } from '@/constants/theme';
import { FONT_FAMILIES, FONT_SIZES } from '@/services/config/fonts';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  ASPECT_RATIO,
  BORDER_RADIUS,
  BORDER_WIDTH,
  IS_IOS,
  IS_LARGE_SCREEN,
  IS_SMALL_SCREEN,
  OPACITY,
  SHADOW,
  SPACING,
  Z_INDEX,
} from '@/styles/constants';
import { useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation as Extrapolate,
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export const useStyles = () => {
  const scheme = useAppSelector(state => state.theme.colorScheme, shallowEqual);
  const { width, height } = Dimensions.get('window');

  // Theme values
  const Colors = THEME?.[scheme];
  const Elevation = THEME.elevation;

  // Responsive scaling
  const scale = (size: number) => {
    const ratio = size / 375; // Base width (iPhone 6/7/8)
    return Math.round(width * ratio);
  };

  // Main style generator
  const styles = useMemo(() => {
    // ======================
    // TEXT STYLES (All font combinations)
    // ======================
    const textStyles = StyleSheet.create({
      // Material Design 3 Typography
      displayLarge: {
        fontFamily: FONT_FAMILIES.interExtraBold,
        fontSize: FONT_SIZES.xxxxl,
        lineHeight: FONT_SIZES.xxxxl * 1.2,
        letterSpacing: -0.5,
        color: Colors.textColor,
      },
      displayMedium: {
        fontFamily: FONT_FAMILIES.interExtraBold,
        fontSize: FONT_SIZES.xxxl,
        lineHeight: FONT_SIZES.xxxl * 1.2,
        color: Colors.textColor,
      },
      displaySmall: {
        fontFamily: FONT_FAMILIES.interBold,
        fontSize: FONT_SIZES.xxl,
        lineHeight: FONT_SIZES.xxl * 1.2,
        color: Colors.textColor,
      },
      headlineLarge: {
        fontFamily: FONT_FAMILIES.interBold,
        fontSize: FONT_SIZES.xl,
        lineHeight: FONT_SIZES.xl * 1.3,
        color: Colors.textColor,
      },
      headlineMedium: {
        fontFamily: FONT_FAMILIES.interBold,
        fontSize: FONT_SIZES.lg,
        lineHeight: FONT_SIZES.lg * 1.3,
        color: Colors.textColor,
      },
      headlineSmall: {
        fontFamily: FONT_FAMILIES.interSemiBold,
        fontSize: FONT_SIZES.md,
        lineHeight: FONT_SIZES.md * 1.4,
        color: Colors.textColor,
      },
      titleLarge: {
        fontFamily: FONT_FAMILIES.interSemiBold,
        fontSize: FONT_SIZES.md,
        lineHeight: FONT_SIZES.md * 1.5,
        color: Colors.textColor,
      },
      titleMedium: {
        fontFamily: FONT_FAMILIES.interSemiBold,
        fontSize: FONT_SIZES.sm,
        lineHeight: FONT_SIZES.sm * 1.5,
        color: Colors.textColor,
      },
      titleSmall: {
        fontFamily: FONT_FAMILIES.interMedium,
        fontSize: FONT_SIZES.xs,
        lineHeight: FONT_SIZES.xs * 1.5,
        color: Colors.textColor,
      },
      bodyLarge: {
        fontFamily: FONT_FAMILIES.interRegular,
        fontSize: FONT_SIZES.md,
        lineHeight: FONT_SIZES.md * 1.5,
        color: Colors.textColor,
      },
      bodyMedium: {
        fontFamily: FONT_FAMILIES.interRegular,
        fontSize: FONT_SIZES.sm,
        lineHeight: FONT_SIZES.sm * 1.5,
        color: Colors.textColor,
      },
      bodySmall: {
        fontFamily: FONT_FAMILIES.interRegular,
        fontSize: FONT_SIZES.xs,
        lineHeight: FONT_SIZES.xs * 1.5,
        color: Colors.textColor,
      },
      labelLarge: {
        fontFamily: FONT_FAMILIES.interMedium,
        fontSize: FONT_SIZES.sm,
        lineHeight: FONT_SIZES.sm * 1.5,
        color: Colors.textColor,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      },
      labelMedium: {
        fontFamily: FONT_FAMILIES.interMedium,
        fontSize: FONT_SIZES.xs,
        lineHeight: FONT_SIZES.xs * 1.5,
        color: Colors.textColor,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      },
      labelSmall: {
        fontFamily: FONT_FAMILIES.interMedium,
        fontSize: FONT_SIZES.xxs,
        lineHeight: FONT_SIZES.xxs * 1.5,
        color: Colors.greyColor600,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      },
      buttonLarge: {
        fontFamily: FONT_FAMILIES.interSemiBold,
        fontSize: FONT_SIZES.md,
        lineHeight: FONT_SIZES.md * 1.5,
        color: Colors.white,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      },
      buttonMedium: {
        fontFamily: FONT_FAMILIES.interSemiBold,
        fontSize: FONT_SIZES.sm,
        lineHeight: FONT_SIZES.sm * 1.5,
        color: Colors.white,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      },
      buttonSmall: {
        fontFamily: FONT_FAMILIES.interSemiBold,
        fontSize: FONT_SIZES.xs,
        lineHeight: FONT_SIZES.xs * 1.5,
        color: Colors.white,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
      },

      // Font family specific styles
      nunitoRegular: {
        fontFamily: FONT_FAMILIES.nunitoRegular,
        fontSize: FONT_SIZES.md,
        color: Colors.textColor,
      },
      nunitoBold: {
        fontFamily: FONT_FAMILIES.nunitoBold,
        fontSize: FONT_SIZES.md,
        color: Colors.textColor,
      },
      interRegular: {
        fontFamily: FONT_FAMILIES.interRegular,
        fontSize: FONT_SIZES.md,
        color: Colors.textColor,
      },
      interBold: {
        fontFamily: FONT_FAMILIES.interBold,
        fontSize: FONT_SIZES.md,
        color: Colors.textColor,
      },

      // Color variants
      textPrimary: {
        color: Colors.textPrimaryColor,
      },
      textSecondary: {
        color: Colors.secondaryColor,
      },
      textMuted: {
        color: Colors.greyColor600,
      },
      textError: {
        color: Colors.red,
      },
      textSuccess: {
        color: Colors.greenColor,
      },
      textWhite: {
        color: Colors.white,
      },
      textBlack: {
        color: Colors.black,
      },

      // Text decorations
      underline: {
        textDecorationLine: 'underline' as const,
      },
      lineThrough: {
        textDecorationLine: 'line-through' as const,
      },

      // Text transforms
      uppercase: {
        textTransform: 'uppercase' as const,
      },
      lowercase: {
        textTransform: 'lowercase' as const,
      },
      capitalize: {
        textTransform: 'capitalize' as const,
      },

      // Text alignments
      textLeft: {
        textAlign: 'left' as const,
      },
      textCenter: {
        textAlign: 'center' as const,
      },
      textRight: {
        textAlign: 'right' as const,
      },
    });

    // ======================
    // LAYOUT STYLES
    // ======================
    const layoutStyles = StyleSheet.create({
      // Flex
      flex: { flex: 1 },
      flexGrow: { flexGrow: 1 },
      flexShrink: { flexShrink: 1 },
      flexNone: { flex: 0 },

      // Flex Direction
      row: { flexDirection: 'row' },
      col: { flexDirection: 'column' },
      rowReverse: { flexDirection: 'row-reverse' },
      colReverse: { flexDirection: 'column-reverse' },

      // Flex Wrap
      flexWrap: { flexWrap: 'wrap' },
      flexNoWrap: { flexWrap: 'nowrap' },
      flexWrapReverse: { flexWrap: 'wrap-reverse' },

      // Justify Content
      justifyStart: { justifyContent: 'flex-start' },
      justifyEnd: { justifyContent: 'flex-end' },
      justifyCenter: { justifyContent: 'center' },
      justifyBetween: { justifyContent: 'space-between' },
      justifyAround: { justifyContent: 'space-around' },
      justifyEvenly: { justifyContent: 'space-evenly' },

      // Align Items
      itemsStart: { alignItems: 'flex-start' },
      itemsEnd: { alignItems: 'flex-end' },
      itemsCenter: { alignItems: 'center' },
      itemsBaseline: { alignItems: 'baseline' },
      itemsStretch: { alignItems: 'stretch' },

      // Align Self
      selfAuto: { alignSelf: 'auto' },
      selfStart: { alignSelf: 'flex-start' },
      selfEnd: { alignSelf: 'flex-end' },
      selfCenter: { alignSelf: 'center' },
      selfBaseline: { alignSelf: 'baseline' },
      selfStretch: { alignSelf: 'stretch' },

      // Position
      relative: { position: 'relative' },
      absolute: { position: 'absolute' },
      absoluteFill: { ...StyleSheet.absoluteFillObject },

      // Top/Right/Bottom/Left
      top0: { top: 0 },
      topXs: { top: SPACING.xs },
      topSm: { top: SPACING.sm },
      topMd: { top: SPACING.md },
      topLg: { top: SPACING.lg },
      topXl: { top: SPACING.xl },

      // Right
      right0: { right: 0 },
      rightXs: { right: SPACING.xs },
      rightSm: { right: SPACING.sm },
      rightMd: { right: SPACING.md },
      rightLg: { right: SPACING.lg },
      rightXl: { right: SPACING.xl },

      // Bottom
      bottom0: { bottom: 0 },
      bottomXs: { bottom: SPACING.xs },
      bottomSm: { bottom: SPACING.sm },
      bottomMd: { bottom: SPACING.md },
      bottomLg: { bottom: SPACING.lg },
      bottomXl: { bottom: SPACING.xl },

      // Left
      left0: { left: 0 },
      leftXs: { left: SPACING.xs },
      leftSm: { left: SPACING.sm },
      leftMd: { left: SPACING.md },
      leftLg: { left: SPACING.lg },
      leftXl: { left: SPACING.xl },

      // Z-Index
      z0: { zIndex: Z_INDEX.base },
      z10: { zIndex: Z_INDEX.dropdown },
      z20: { zIndex: Z_INDEX.sticky },
      z30: { zIndex: Z_INDEX.fixed },
      z40: { zIndex: Z_INDEX.overlay },
      z50: { zIndex: Z_INDEX.modal },
      z60: { zIndex: Z_INDEX.toast },
      z70: { zIndex: Z_INDEX.tooltip },

      // Width
      wFull: { width: '100%' },
      wScreen: { width: width },
      w1_2: { width: '50%' },
      w1_3: { width: '33.333333%' },
      w1_4: { width: '25%' },
      w1_5: { width: '20%' },
      w2_3: { width: '66.666667%' },
      w3_4: { width: '75%' },
      wAuto: { width: 'auto' },

      // Height
      hFull: { height: '100%' },
      hScreen: { height: height },
      h1_2: { height: '50%' },
      h1_3: { height: '33.333333%' },
      h1_4: { height: '25%' },
      h1_5: { height: '20%' },
      h2_3: { height: '66.666667%' },
      h3_4: { height: '75%' },
      hAuto: { height: 'auto' },

      // Min/Max Width/Height
      minW0: { minWidth: 0 },
      minH0: { minHeight: 0 },
      maxWFull: { maxWidth: '100%' },
      maxHFull: { maxHeight: '100%' },

      // Overflow
      overflowVisible: { overflow: 'visible' },
      overflowHidden: { overflow: 'hidden' },
      overflowScroll: { overflow: 'scroll' },

      // Aspect Ratio
      aspectSquare: { aspectRatio: ASPECT_RATIO.square },
      aspectVideo: { aspectRatio: ASPECT_RATIO.landscape },
      aspectPortrait: { aspectRatio: ASPECT_RATIO.portrait },
      aspectWidescreen: { aspectRatio: ASPECT_RATIO.widescreen },
    });

    // ======================
    // SPACING STYLES
    // ======================
    const spacingStyles = StyleSheet.create({
      // Padding
      p0: { padding: SPACING.none },
      pXs: { padding: SPACING.xxs },
      pSm: { padding: SPACING.xs },
      pMd: { padding: SPACING.sm },
      pLg: { padding: SPACING.md },
      pXl: { padding: SPACING.lg },
      pXxl: { padding: SPACING.xl },
      pXxxl: { padding: SPACING.xxl },

      // Padding Horizontal
      px0: { paddingHorizontal: SPACING.none },
      pxXs: { paddingHorizontal: SPACING.xxs },
      pxSm: { paddingHorizontal: SPACING.xs },
      pxMd: { paddingHorizontal: SPACING.sm },
      pxLg: { paddingHorizontal: SPACING.md },
      pxXl: { paddingHorizontal: SPACING.lg },
      pxXxl: { paddingHorizontal: SPACING.xl },
      pxXxxl: { paddingHorizontal: SPACING.xxl },

      // Padding Vertical
      py0: { paddingVertical: SPACING.none },
      pyXs: { paddingVertical: SPACING.xxs },
      pySm: { paddingVertical: SPACING.xs },
      pyMd: { paddingVertical: SPACING.sm },
      pyLg: { paddingVertical: SPACING.md },
      pyXl: { paddingVertical: SPACING.lg },
      pyXxl: { paddingVertical: SPACING.xl },
      pyXxxl: { paddingVertical: SPACING.xxl },

      // Padding Top
      pt0: { paddingTop: SPACING.none },
      ptXs: { paddingTop: SPACING.xxs },
      ptSm: { paddingTop: SPACING.xs },
      ptMd: { paddingTop: SPACING.sm },
      ptLg: { paddingTop: SPACING.md },
      ptXl: { paddingTop: SPACING.lg },
      ptXxl: { paddingTop: SPACING.xl },
      ptXxxl: { paddingTop: SPACING.xxl },

      // Padding Right
      pr0: { paddingRight: SPACING.none },
      prXs: { paddingRight: SPACING.xxs },
      prSm: { paddingRight: SPACING.xs },
      prMd: { paddingRight: SPACING.sm },
      prLg: { paddingRight: SPACING.md },
      prXl: { paddingRight: SPACING.lg },
      prXxl: { paddingRight: SPACING.xl },
      prXxxl: { paddingRight: SPACING.xxl },

      // Padding Bottom
      pb0: { paddingBottom: SPACING.none },
      pbXs: { paddingBottom: SPACING.xxs },
      pbSm: { paddingBottom: SPACING.xs },
      pbMd: { paddingBottom: SPACING.sm },
      pbLg: { paddingBottom: SPACING.md },
      pbXl: { paddingBottom: SPACING.lg },
      pbXxl: { paddingBottom: SPACING.xl },
      pbXxxl: { paddingBottom: SPACING.xxl },

      // Padding Left
      pl0: { paddingLeft: SPACING.none },
      plXs: { paddingLeft: SPACING.xxs },
      plSm: { paddingLeft: SPACING.xs },
      plMd: { paddingLeft: SPACING.sm },
      plLg: { paddingLeft: SPACING.md },
      plXl: { paddingLeft: SPACING.lg },
      plXxl: { paddingLeft: SPACING.xl },
      plXxxl: { paddingLeft: SPACING.xxl },

      // Margin
      m0: { margin: SPACING.none },
      mXs: { margin: SPACING.xxs },
      mSm: { margin: SPACING.xs },
      mMd: { margin: SPACING.sm },
      mLg: { margin: SPACING.md },
      mXl: { margin: SPACING.lg },
      mXxl: { margin: SPACING.xl },
      mXxxl: { margin: SPACING.xxl },

      // Margin Horizontal
      mx0: { marginHorizontal: SPACING.none },
      mxXs: { marginHorizontal: SPACING.xxs },
      mxSm: { marginHorizontal: SPACING.xs },
      mxMd: { marginHorizontal: SPACING.sm },
      mxLg: { marginHorizontal: SPACING.md },
      mxXl: { marginHorizontal: SPACING.lg },
      mxXxl: { marginHorizontal: SPACING.xl },
      mxXxxl: { marginHorizontal: SPACING.xxl },

      // Margin Vertical
      my0: { marginVertical: SPACING.none },
      myXs: { marginVertical: SPACING.xxs },
      mySm: { marginVertical: SPACING.xs },
      myMd: { marginVertical: SPACING.sm },
      myLg: { marginVertical: SPACING.md },
      myXl: { marginVertical: SPACING.lg },
      myXxl: { marginVertical: SPACING.xl },
      myXxxl: { marginVertical: SPACING.xxl },

      // Margin Top
      mt0: { marginTop: SPACING.none },
      mtXs: { marginTop: SPACING.xxs },
      mtSm: { marginTop: SPACING.xs },
      mtMd: { marginTop: SPACING.sm },
      mtLg: { marginTop: SPACING.md },
      mtXl: { marginTop: SPACING.lg },
      mtXxl: { marginTop: SPACING.xl },
      mtXxxl: { marginTop: SPACING.xxl },

      // Margin Right
      mr0: { marginRight: SPACING.none },
      mrXs: { marginRight: SPACING.xxs },
      mrSm: { marginRight: SPACING.xs },
      mrMd: { marginRight: SPACING.sm },
      mrLg: { marginRight: SPACING.md },
      mrXl: { marginRight: SPACING.lg },
      mrXxl: { marginRight: SPACING.xl },
      mrXxxl: { marginRight: SPACING.xxl },

      // Margin Bottom
      mb0: { marginBottom: SPACING.none },
      mbXs: { marginBottom: SPACING.xxs },
      mbSm: { marginBottom: SPACING.xs },
      mbMd: { marginBottom: SPACING.sm },
      mbLg: { marginBottom: SPACING.md },
      mbXl: { marginBottom: SPACING.lg },
      mbXxl: { marginBottom: SPACING.xl },
      mbXxxl: { marginBottom: SPACING.xxl },

      // Margin Left
      ml0: { marginLeft: SPACING.none },
      mlXs: { marginLeft: SPACING.xxs },
      mlSm: { marginLeft: SPACING.xs },
      mlMd: { marginLeft: SPACING.sm },
      mlLg: { marginLeft: SPACING.md },
      mlXl: { marginLeft: SPACING.lg },
      mlXxl: { marginLeft: SPACING.xl },
      mlXxxl: { marginLeft: SPACING.xxl },

      // Gap
      gap0: { gap: SPACING.none },
      gapXs: { gap: SPACING.xxs },
      gapSm: { gap: SPACING.xs },
      gapMd: { gap: SPACING.sm },
      gapLg: { gap: SPACING.md },
      gapXl: { gap: SPACING.lg },
      gapXxl: { gap: SPACING.xl },
      gapXxxl: { gap: SPACING.xxl },

      // Row Gap
      rowGap0: { rowGap: SPACING.none },
      rowGapXs: { rowGap: SPACING.xxs },
      rowGapSm: { rowGap: SPACING.xs },
      rowGapMd: { rowGap: SPACING.sm },
      rowGapLg: { rowGap: SPACING.md },
      rowGapXl: { rowGap: SPACING.lg },
      rowGapXxl: { rowGap: SPACING.xl },
      rowGapXxxl: { rowGap: SPACING.xxl },

      // Column Gap
      columnGap0: { columnGap: SPACING.none },
      columnGapXs: { columnGap: SPACING.xxs },
      columnGapSm: { columnGap: SPACING.xs },
      columnGapMd: { columnGap: SPACING.sm },
      columnGapLg: { columnGap: SPACING.md },
      columnGapXl: { columnGap: SPACING.lg },
      columnGapXxl: { columnGap: SPACING.xl },
      columnGapXxxl: { columnGap: SPACING.xxl },
    });

    // ======================
    // BORDER STYLES
    // ======================
    const borderStyles = StyleSheet.create({
      // Border Width
      border0: { borderWidth: BORDER_WIDTH.none },
      border: { borderWidth: BORDER_WIDTH.thin },
      border2: { borderWidth: BORDER_WIDTH.medium },
      border4: { borderWidth: BORDER_WIDTH.thick },

      // Border Top Width
      borderT0: { borderTopWidth: BORDER_WIDTH.none },
      borderT: { borderTopWidth: BORDER_WIDTH.thin },
      borderT2: { borderTopWidth: BORDER_WIDTH.medium },
      borderT4: { borderTopWidth: BORDER_WIDTH.thick },

      // Border Right Width
      borderR0: { borderRightWidth: BORDER_WIDTH.none },
      borderR: { borderRightWidth: BORDER_WIDTH.thin },
      borderR2: { borderRightWidth: BORDER_WIDTH.medium },
      borderR4: { borderRightWidth: BORDER_WIDTH.thick },

      // Border Bottom Width
      borderB0: { borderBottomWidth: BORDER_WIDTH.none },
      borderB: { borderBottomWidth: BORDER_WIDTH.thin },
      borderB2: { borderBottomWidth: BORDER_WIDTH.medium },
      borderB4: { borderBottomWidth: BORDER_WIDTH.thick },

      // Border Left Width
      borderL0: { borderLeftWidth: BORDER_WIDTH.none },
      borderL: { borderLeftWidth: BORDER_WIDTH.thin },
      borderL2: { borderLeftWidth: BORDER_WIDTH.medium },
      borderL4: { borderLeftWidth: BORDER_WIDTH.thick },

      // Border Color
      borderTransparent: { borderColor: 'transparent' },
      borderPrimary: { borderColor: Colors.primaryColor },
      borderSecondary: { borderColor: Colors.secondaryColor },
      borderWhite: { borderColor: Colors.white },
      borderBlack: { borderColor: Colors.black },
      borderGray100: { borderColor: Colors.greyColor100 },
      borderGray200: { borderColor: Colors.greyColor200 },
      borderGray400: { borderColor: Colors.greyColor400 },
      borderGray500: { borderColor: Colors.greyColor500 },
      borderGray600: { borderColor: Colors.greyColor600 },
      borderGray700: { borderColor: Colors.greyColor700 },
      borderGray900: { borderColor: Colors.greyColor900 },
      borderRed: { borderColor: Colors.red },
      borderGreen: { borderColor: Colors.greenColor },
      borderLightGreen: { borderColor: Colors.lightGreenColor },

      // Border Radius
      roundedNone: { borderRadius: BORDER_RADIUS.none },
      roundedXs: { borderRadius: BORDER_RADIUS.xs },
      roundedSm: { borderRadius: BORDER_RADIUS.sm },
      roundedMd: { borderRadius: BORDER_RADIUS.md },
      roundedLg: { borderRadius: BORDER_RADIUS.lg },
      roundedXl: { borderRadius: BORDER_RADIUS.xl },
      roundedPill: { borderRadius: BORDER_RADIUS.pill },
      roundedCircle: { borderRadius: BORDER_RADIUS.circle },

      // Border Radius Top
      roundedTNone: {
        borderTopLeftRadius: BORDER_RADIUS.none,
        borderTopRightRadius: BORDER_RADIUS.none,
      },
      roundedTXs: {
        borderTopLeftRadius: BORDER_RADIUS.xs,
        borderTopRightRadius: BORDER_RADIUS.xs,
      },
      roundedTSm: {
        borderTopLeftRadius: BORDER_RADIUS.sm,
        borderTopRightRadius: BORDER_RADIUS.sm,
      },
      roundedTMd: {
        borderTopLeftRadius: BORDER_RADIUS.md,
        borderTopRightRadius: BORDER_RADIUS.md,
      },
      roundedTLg: {
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
      },
      roundedTXl: {
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
      },
      roundedTPill: {
        borderTopLeftRadius: BORDER_RADIUS.pill,
        borderTopRightRadius: BORDER_RADIUS.pill,
      },

      // Border Radius Right
      roundedRNone: {
        borderTopRightRadius: BORDER_RADIUS.none,
        borderBottomRightRadius: BORDER_RADIUS.none,
      },
      roundedRXs: {
        borderTopRightRadius: BORDER_RADIUS.xs,
        borderBottomRightRadius: BORDER_RADIUS.xs,
      },
      roundedRSm: {
        borderTopRightRadius: BORDER_RADIUS.sm,
        borderBottomRightRadius: BORDER_RADIUS.sm,
      },
      roundedRMd: {
        borderTopRightRadius: BORDER_RADIUS.md,
        borderBottomRightRadius: BORDER_RADIUS.md,
      },
      roundedRLg: {
        borderTopRightRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.lg,
      },
      roundedRXl: {
        borderTopRightRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
      },
      roundedRPill: {
        borderTopRightRadius: BORDER_RADIUS.pill,
        borderBottomRightRadius: BORDER_RADIUS.pill,
      },

      // Border Radius Bottom
      roundedBNone: {
        borderBottomLeftRadius: BORDER_RADIUS.none,
        borderBottomRightRadius: BORDER_RADIUS.none,
      },
      roundedBXs: {
        borderBottomLeftRadius: BORDER_RADIUS.xs,
        borderBottomRightRadius: BORDER_RADIUS.xs,
      },
      roundedBSm: {
        borderBottomLeftRadius: BORDER_RADIUS.sm,
        borderBottomRightRadius: BORDER_RADIUS.sm,
      },
      roundedBMd: {
        borderBottomLeftRadius: BORDER_RADIUS.md,
        borderBottomRightRadius: BORDER_RADIUS.md,
      },
      roundedBLg: {
        borderBottomLeftRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.lg,
      },
      roundedBXl: {
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
      },
      roundedBPill: {
        borderBottomLeftRadius: BORDER_RADIUS.pill,
        borderBottomRightRadius: BORDER_RADIUS.pill,
      },

      // Border Radius Left
      roundedLNone: {
        borderTopLeftRadius: BORDER_RADIUS.none,
        borderBottomLeftRadius: BORDER_RADIUS.none,
      },
      roundedLXs: {
        borderTopLeftRadius: BORDER_RADIUS.xs,
        borderBottomLeftRadius: BORDER_RADIUS.xs,
      },
      roundedLSm: {
        borderTopLeftRadius: BORDER_RADIUS.sm,
        borderBottomLeftRadius: BORDER_RADIUS.sm,
      },
      roundedLMd: {
        borderTopLeftRadius: BORDER_RADIUS.md,
        borderBottomLeftRadius: BORDER_RADIUS.md,
      },
      roundedLLg: {
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderBottomLeftRadius: BORDER_RADIUS.lg,
      },
      roundedLXl: {
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
      },
      roundedLPill: {
        borderTopLeftRadius: BORDER_RADIUS.pill,
        borderBottomLeftRadius: BORDER_RADIUS.pill,
      },

      // Border Style
      borderSolid: { borderStyle: 'solid' as const },
      borderDotted: { borderStyle: 'dotted' as const },
      borderDashed: { borderStyle: 'dashed' as const },
    });

    // ======================
    // BACKGROUND STYLES
    // ======================
    const backgroundStyles = StyleSheet.create({
      bgTransparent: { backgroundColor: 'transparent' },
      bgPrimary: { backgroundColor: Colors.primaryColor },
      bgSecondary: { backgroundColor: Colors.secondaryColor },
      bgWhite: { backgroundColor: Colors.white },
      bgBlack: { backgroundColor: Colors.black },
      bgGray100: { backgroundColor: Colors.greyColor100 },
      bgGray200: { backgroundColor: Colors.greyColor200 },
      bgGray400: { backgroundColor: Colors.greyColor400 },
      bgGray500: { backgroundColor: Colors.greyColor500 },
      bgGray600: { backgroundColor: Colors.greyColor600 },
      bgGray700: { backgroundColor: Colors.greyColor700 },
      bgGray900: { backgroundColor: Colors.greyColor900 },
      bgRed: { backgroundColor: Colors.red },
      bgGreen: { backgroundColor: Colors.greenColor },
      bgLightGreen: { backgroundColor: Colors.lightGreenColor },
      bgBlue600: { backgroundColor: Colors.blueColor600 },
    });

    // ======================
    // SHADOW & ELEVATION
    // ======================
    const shadowStyles = StyleSheet.create({
      shadowNone: SHADOW.none,
      shadowSm: SHADOW.sm,
      shadowMd: SHADOW.md,
      shadowLg: SHADOW.lg,
      elevationNone: Elevation.plain,
      elevation3d: Elevation['3d'],
      elevationUltra3d: Elevation.ultra_3d,
    });

    // ======================
    // OPACITY
    // ======================
    const opacityStyles = StyleSheet.create({
      opacity0: { opacity: OPACITY.transparent },
      opacity50: { opacity: OPACITY.semiTransparent },
      opacity100: { opacity: OPACITY.opaque },
      opacityDisabled: { opacity: OPACITY.disabled },
    });

    // ======================
    // COMMON COMPONENT STYLES
    // ======================
    const componentStyles = StyleSheet.create({
      // Buttons
      btn: {
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...textStyles.buttonMedium,
      },
      btnPrimary: {
        backgroundColor: Colors.primaryColor,
      },
      btnSecondary: {
        backgroundColor: Colors.secondaryColor,
      },
      btnOutline: {
        backgroundColor: 'transparent',
        borderWidth: BORDER_WIDTH.thin,
        borderColor: Colors.primaryColor,
      },
      btnDisabled: {
        opacity: OPACITY.disabled,
      },

      // Cards
      card: {
        backgroundColor: Colors.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        ...SHADOW.md,
      },
      cardPrimary: {
        borderLeftWidth: BORDER_WIDTH.thick,
        borderLeftColor: Colors.primaryColor,
      },
      cardSecondary: {
        borderLeftWidth: BORDER_WIDTH.thick,
        borderLeftColor: Colors.secondaryColor,
      },

      // Inputs
      input: {
        backgroundColor: Colors.white,
        borderWidth: BORDER_WIDTH.thin,
        borderColor: Colors.greyColor400,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.sm,
        ...textStyles.bodyMedium,
      },
      inputFocused: {
        borderColor: Colors.primaryColor,
        ...SHADOW.sm,
      },
      inputError: {
        borderColor: Colors.red,
      },

      // Badges
      badge: {
        paddingHorizontal: SPACING.xs,
        paddingVertical: SPACING.xxs,
        borderRadius: BORDER_RADIUS.pill,
        alignSelf: 'flex-start',
      },
      badgePrimary: {
        backgroundColor: Colors.primaryColor,
      },
      badgeSecondary: {
        backgroundColor: Colors.secondaryColor,
      },
      badgeOutline: {
        backgroundColor: 'transparent',
        borderWidth: BORDER_WIDTH.thin,
        borderColor: Colors.primaryColor,
      },

      // Dividers
      divider: {
        height: BORDER_WIDTH.hairline,
        backgroundColor: Colors.greyColor400,
        marginVertical: SPACING.md,
      },
      dividerVertical: {
        width: BORDER_WIDTH.hairline,
        backgroundColor: Colors.greyColor400,
        marginHorizontal: SPACING.md,
      },

      // Avatars
      avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.greyColor200,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
      },
      avatarLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
      },

      // Icons
      icon: {
        width: 24,
        height: 24,
        tintColor: Colors.textColor,
      },
      iconSmall: {
        width: 16,
        height: 16,
      },
      iconLarge: {
        width: 32,
        height: 32,
      },
      iconPrimary: {
        tintColor: Colors.primaryColor,
      },
      iconSecondary: {
        tintColor: Colors.secondaryColor,
      },
      iconWhite: {
        tintColor: Colors.white,
      },
    });

    return {
      text: textStyles,
      layout: layoutStyles,
      spacing: spacingStyles,
      border: borderStyles,
      background: backgroundStyles,
      shadow: shadowStyles,
      opacity: opacityStyles,
      components: componentStyles,
      colors: Colors,
      isDark,
      isSmallScreen: IS_SMALL_SCREEN,
      isLargeScreen: IS_LARGE_SCREEN,
      isIOS: IS_IOS,
      screenWidth: width,
      screenHeight: height,
    };
  }, [isDark, width, height]);

  // ======================
  // ANIMATED STYLES
  // ======================
  const animatedStyles = {
    // Basic transforms
    scale: (value: Animated.SharedValue<number>) => ({
      transform: [{ scale: value }],
    }),
    translateX: (value: Animated.SharedValue<number>) => ({
      transform: [{ translateX: value }],
    }),
    translateY: (value: Animated.SharedValue<number>) => ({
      transform: [{ translateY: value }],
    }),
    rotate: (value: Animated.SharedValue<string>) => ({
      transform: [{ rotate: value }],
    }),
    rotateX: (value: Animated.SharedValue<string>) => ({
      transform: [{ rotateX: value }],
    }),
    rotateY: (value: Animated.SharedValue<string>) => ({
      transform: [{ rotateY: value }],
    }),

    // Color animations
    backgroundColor: (value: Animated.SharedValue<string>) => ({
      backgroundColor: value,
    }),
    color: (value: Animated.SharedValue<string>) => ({
      color: value,
    }),
    borderColor: (value: Animated.SharedValue<string>) => ({
      borderColor: value,
    }),

    // Opacity
    opacity: (value: Animated.SharedValue<number>) => ({
      opacity: value,
    }),

    // Size
    width: (value: Animated.SharedValue<number>) => ({
      width: value,
    }),
    height: (value: Animated.SharedValue<number>) => ({
      height: value,
    }),

    // Complex animations
    pressableScale: (isPressed: Animated.SharedValue<boolean>) => {
      return useAnimatedStyle(() => {
        return {
          transform: [
            {
              scale: withSpring(isPressed.value ? 0.95 : 1, {
                damping: 10,
                stiffness: 300,
              }),
            },
          ],
          opacity: isPressed.value ? 0.8 : 1,
        };
      });
    },

    fadeIn: (value: Animated.SharedValue<number>) => {
      return useAnimatedStyle(() => {
        return {
          opacity: value.value,
          transform: [
            {
              translateY: interpolate(
                value.value,
                [0, 1],
                [20, 0],
                Extrapolate.CLAMP,
              ),
            },
          ],
        };
      });
    },

    slideInRight: (value: Animated.SharedValue<number>) => {
      return useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateX: interpolate(
                value.value,
                [0, 1],
                [100, 0],
                Extrapolate.CLAMP,
              ),
            },
          ],
        };
      });
    },

    // Gradient animations
    gradientColors: (
      colors: Animated.SharedValue<string[]>,
      start: { x: number; y: number } = { x: 0, y: 0 },
      end: { x: number; y: number } = { x: 1, y: 1 },
    ) => {
      return {
        colors: colors,
        start: start,
        end: end,
      };
    },
  };

  return {
    styles,
    animated: animatedStyles,

    scale,
  };
};
