import LinearGradient from '@/components/base/LinearGradient';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch } from '@/services/mmkv-redux/hooks';
import { updateLaunch } from '@/services/mmkv-redux/slices';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
type ScreenInfo = {
  image: any;
  title: string;
  description: string;
};

type OnboardingContentProps = {
  navigation: any;
  Colors: any;
};

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

// Data
const SCREEN_INFO: ScreenInfo[] = [
  {
    image: require('@/assets/onboard_images/Frame.png'),
    title: 'Secure Health Data',
    description:
      'Your health data stays safe with advanced encryption and trusted security.',
  },
  {
    image: require('@/assets/onboard_images/Frame2.png'),
    title: 'Personalized Wellness',
    description:
      "No two journeys are the same. That's why we create a wellness plan tailored to you.",
  },
  {
    image: require('@/assets/onboard_images/Frame3.png'),
    title: 'All-in-One Wellness',
    description:
      'Track activity, monitor progress, and manage your health all in one place.',
  },
];

// Spring config for smooth animations
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 90,
  mass: 1,
  overshootClamping: false,
};

// Error fallback component
const ErrorFallback = memo(({ error, resetError }: ErrorFallbackProps) => {
  const { Colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const styles = createStyles(Colors, width, height);

  return (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={styles.errorButton} onPress={resetError}>
        <Text style={styles.errorButtonText}>Try Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});
ErrorFallback.displayName = 'ErrorFallback';

// Animated Pagination dots component with scroll-based animation
const AnimatedPaginationDots = memo(
  ({
    scrollX,
    screenWidth,
    screenHeight,
    primaryColor,
  }: {
    scrollX: Animated.SharedValue<number>;
    screenWidth: number;
    screenHeight: number;
    primaryColor: string;
  }) => {
    const isShortDevice = screenHeight < 700;
    const bottomPosition = isShortDevice
      ? screenHeight * 0.18
      : screenHeight * 0.22;

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 400,

          zIndex: 5,
        }}
        pointerEvents="none"
      >
        {SCREEN_INFO.map((_, dotIndex) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const inputRange = [
              (dotIndex - 1) * screenWidth,
              dotIndex * screenWidth,
              (dotIndex + 1) * screenWidth,
            ];

            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              'clamp',
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.3, 1, 0.3],
              'clamp',
            );

            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View
              key={dotIndex}
              style={[
                {
                  backgroundColor: primaryColor,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                },
                animatedDotStyle,
              ]}
              accessibilityLabel={`Page ${dotIndex + 1} of ${
                SCREEN_INFO.length
              }`}
            />
          );
        })}
      </View>
    );
  },
);
AnimatedPaginationDots.displayName = 'AnimatedPaginationDots';

// Individual slide component
const Slide = memo(
  ({
    screen,
    screenWidth,
    screenHeight,
    isLastSlide,
    Colors,
  }: {
    screen: ScreenInfo;
    screenWidth: number;
    screenHeight: number;
    isLastSlide: boolean;
    Colors: any;
  }) => {
    const styles = createStyles(Colors, screenWidth, screenHeight);

    return (
      <View style={[styles.slide, { width: screenWidth }]}>
        <View style={styles.imageContainer}>
          <Image
            source={screen.image}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={`Illustration for ${screen.title}`}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>{screen.title}</Text>
          <Text style={styles.slideDescription}>{screen.description}</Text>
          {isLastSlide && (
            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerText}>
                Skyp Health is designed for general wellness tracking only. It
                is not a medical device and is not intended to diagnose, treat,
                or prevent any condition.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  },
);
Slide.displayName = 'Slide';

// Navigation buttons component with improved animations
const NavigationButtons = memo(
  ({
    isLastSlide,
    onNext,
    onSkip,
    primaryColor,
    scrollX,
    Colors,
    screenWidth,
    screenHeight,
  }: {
    isLastSlide: boolean;
    onNext: () => void;
    onSkip: () => void;
    primaryColor: string;
    scrollX: Animated.SharedValue<number>;
    Colors: any;
    screenWidth: number;
    screenHeight: number;
  }) => {
    // Responsive calculations
    const isSmallDevice = screenWidth < 375;
    const isShortDevice = screenHeight < 700;

    const insests = useSafeAreaInsets();
    const horizontalPadding = isSmallDevice ? 16 : 24;
    const buttonHeight = isSmallDevice ? 50 : 56;
    const bottomPadding =
      Platform.OS === 'ios' ? (isShortDevice ? 24 : 32) : 24;
    const fontSize = isSmallDevice ? 14 : 16;

    const widhth = useWindowDimensions().width;
    const maxWIdth = widhth - 60;
    // Calculate responsive button widths
    const SKIP_WIDTH = Math.min(screenWidth * 0.35, 140);
    const NEXT_WIDTH = Math.min(screenWidth * 0.45, 180);
    const FULL_WIDTH = Math.min(screenWidth * 0.85, 340);

    const skipButtonStyle = useAnimatedStyle(() => {
      const progress = scrollX.value / (screenWidth * (SCREEN_INFO.length - 1));

      const width = interpolate(
        progress,
        [0, 0.8, 1],
        [SKIP_WIDTH, SKIP_WIDTH, 0],
        'clamp',
      );

      const opacity = interpolate(progress, [0, 0.8, 1], [1, 1, 0], 'clamp');

      const scale = interpolate(progress, [0, 0.8, 1], [1, 1, 0.8], 'clamp');

      return {
        width,
        opacity,
        transform: [{ scale }],
      };
    });

    const nextButtonStyle = useAnimatedStyle(() => {
      const progress = scrollX.value / (screenWidth * (SCREEN_INFO.length - 1));

      const width = interpolate(
        progress,
        [0, 0.8, 1],
        [NEXT_WIDTH, NEXT_WIDTH, maxWIdth],
        'clamp',
      );

      return {
        width,
      };
    });

    const nextTextStyle = useAnimatedStyle(() => {
      const progress = scrollX.value / (screenWidth * (SCREEN_INFO.length - 1));

      const opacity = interpolate(
        progress,
        [0, 0.8, 0.9, 1],
        [1, 1, 0, 0],
        'clamp',
      );

      const scale = interpolate(progress, [0, 0.8, 1], [1, 1, 0.8], 'clamp');

      return {
        opacity,
        transform: [{ scale }],
      };
    });

    const getStartedTextStyle = useAnimatedStyle(() => {
      const progress = scrollX.value / (screenWidth * (SCREEN_INFO.length - 1));

      const opacity = interpolate(
        progress,
        [0, 0.8, 0.9, 1],
        [0, 0, 0.5, 1],
        'clamp',
      );

      const scale = interpolate(
        progress,
        [0, 0.8, 0.9, 1],
        [0.8, 0.8, 0.9, 1],
        'clamp',
      );

      return {
        opacity,
        transform: [{ scale }],
      };
    });

    return (
      <View
        style={{
          paddingBottom: insests.bottom + 24,
          paddingHorizontal: 24,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: widhth,
            height: buttonHeight,
            justifyContent: 'space-between',
            gap: 12,
            position: 'relative',
            paddingHorizontal: 24,
          }}
        >
          {/* Skip Button */}
          <Animated.View
            style={[
              {
                paddingVertical: isSmallDevice ? 14 : 16,
                borderRadius: 99,
                borderWidth: 1.5,
                borderColor: Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.backgroundColor,
                height: buttonHeight,
                overflow: 'hidden',
              },
              skipButtonStyle,
            ]}
          >
            <TouchableOpacity
              onPress={onSkip}
              accessibilityLabel="Skip onboarding"
              accessibilityRole="button"
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
              disabled={isLastSlide}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILIES.nunitoBold,
                  fontSize: fontSize,
                  letterSpacing: 0.5,
                  color: primaryColor,
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Next Button */}
          <Animated.View
            style={[
              {
                paddingVertical: isSmallDevice ? 14 : 16,
                borderRadius: 99,
                alignItems: 'center',
                justifyContent: 'center',
                height: buttonHeight,
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
                overflow: 'hidden',
              },
              nextButtonStyle,
            ]}
          >
            <TouchableOpacity
              onPress={onNext}
              accessibilityLabel={isLastSlide ? "Let's Get Started" : 'Next'}
              accessibilityRole="button"
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Animated.Text
                style={[
                  {
                    fontSize: fontSize,
                    color: Colors.white,
                    fontFamily: FONT_FAMILIES.nunitoBold,
                    letterSpacing: 0.5,
                    textAlign: 'center',
                    position: 'absolute',
                  },
                  nextTextStyle,
                ]}
              >
                Next
              </Animated.Text>
              <Animated.Text
                style={[
                  {
                    fontSize: fontSize,
                    color: Colors.white,
                    fontFamily: FONT_FAMILIES.nunitoBold,
                    letterSpacing: 0.5,
                    textAlign: 'center',
                  },
                  getStartedTextStyle,
                ]}
              >
                Let's Get Started
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  },
);
NavigationButtons.displayName = 'NavigationButtons';

// Animated Progress bar with smooth scroll-based animation
const AnimatedProgressBar = memo(
  ({
    scrollX,
    screenWidth,
    color,
    Colors,
  }: {
    scrollX: Animated.SharedValue<number>;
    screenWidth: number;
    color: string;
    Colors: any;
  }) => {
    const progressStyle = useAnimatedStyle(() => {
      const totalScrollWidth = screenWidth * (SCREEN_INFO.length - 1);
      const progress = Math.min(
        Math.max((scrollX.value / totalScrollWidth) * 100, 0),
        100,
      );
      return {
        width: `${progress}%`,
      };
    });

    return (
      <View
        style={{
          width: '100%',
          zIndex: 10,
          paddingTop: Platform.OS === 'ios' ? 10 : 0,
        }}
      >
        <View
          style={{
            height: 4,
            width: '100%',
            backgroundColor: Colors.greyColor400 || Colors.border,
          }}
        >
          <Animated.View
            style={[
              {
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                borderRadius: 2,
                backgroundColor: color,
              },
              progressStyle,
            ]}
          />
        </View>
      </View>
    );
  },
);
AnimatedProgressBar.displayName = 'AnimatedProgressBar';

// Main content component
const OnboardingContent = memo(
  ({ navigation, Colors }: OnboardingContentProps) => {
    const dispatch = useAppDispatch();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrolling, setScrolling] = useState(false);
    const scrollRef = useRef<Animated.ScrollView>(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const scrollX = useSharedValue(0);
    const styles = createStyles(Colors, screenWidth, screenHeight);

    // Computed values
    const isLastSlide = useMemo(
      () => currentIndex === SCREEN_INFO.length - 1,
      [currentIndex],
    );

    const currentColor = useMemo(
      () => Colors.primaryColor,
      [Colors.primaryColor],
    );

    // Optimized scroll handler
    const scrollHandler = useAnimatedScrollHandler({
      onScroll: event => {
        scrollX.value = event.contentOffset.x;
      },
    });

    // Navigation handlers
    const handleNext = useCallback(() => {
      if (currentIndex < SCREEN_INFO.length - 1 && !scrolling) {
        setScrolling(true);
        scrollRef.current?.scrollTo({
          x: (currentIndex + 1) * screenWidth,
          animated: true,
        });
      } else if (isLastSlide) {
        dispatch(updateLaunch());
        navigation.navigate('WelcomeScreen');
      }
    }, [
      currentIndex,
      scrolling,
      dispatch,
      navigation,
      isLastSlide,
      screenWidth,
    ]);

    const handleSkip = useCallback(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, []);

    // Optimized scroll end handler
    const onMomentumScrollEnd = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offset / screenWidth);

        setCurrentIndex(newIndex);
        setScrolling(false);
      },
      [screenWidth],
    );

    const onScrollBeginDrag = useCallback(() => setScrolling(true), []);

    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Optimized Animated ScrollView */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={onScrollBeginDrag}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="center"
          accessible={true}
          accessibilityLabel="Onboarding slides"
          removeClippedSubviews={false}
          overScrollMode="never"
        >
          {SCREEN_INFO.map((screen, index) => (
            <Slide
              key={screen.title}
              screen={screen}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
              isLastSlide={index === SCREEN_INFO.length - 1 && isLastSlide}
              Colors={Colors}
            />
          ))}
        </Animated.ScrollView>

        {/* Animated Pagination dots */}
        <AnimatedPaginationDots
          scrollX={scrollX}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          primaryColor={currentColor}
        />

        {/* Bottom navigation */}
        <NavigationButtons
          isLastSlide={isLastSlide}
          onNext={handleNext}
          onSkip={handleSkip}
          primaryColor={currentColor}
          scrollX={scrollX}
          Colors={Colors}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      </SafeAreaView>
    );
  },
);
OnboardingContent.displayName = 'OnboardingContent';

// Main component
const OnboardingScreen = (props: any) => {
  const { Colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const styles = createStyles(Colors, width, height);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={Colors.isDark ? 'light-content' : 'dark-content'}
        />
        <Animated.View style={styles.fixedHeaderGradient} pointerEvents="none">
          <LinearGradient
            colors={[`${Colors.primaryColor}32`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientFill}
          />
        </Animated.View>
        <OnboardingContent {...props} Colors={Colors} />
      </View>
    </ErrorBoundary>
  );
};

// Responsive Styles - Only for Slide and Error components
const createStyles = (
  Colors: any,
  width: number = 375,
  height: number = 812,
) => {
  // Responsive calculations
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 414;
  const isShortDevice = height < 700;

  // Responsive values
  const horizontalPadding = isSmallDevice ? 16 : 24;
  const imageSize = Math.min(width * 0.75, 320);
  const titleSize = isSmallDevice ? 22 : isMediumDevice ? 24 : 26;
  const descriptionSize = isSmallDevice ? 14 : 16;

  return StyleSheet.create({
    // Layout styles for main component
    fixedHeaderGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height * 0.4,
      zIndex: 0,
    },
    gradientFill: {
      flex: 1,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    safeArea: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },

    // Slide styles
    slide: {
      alignItems: 'center',
      paddingHorizontal: horizontalPadding,
      flex: 1,
      justifyContent: 'center',
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      maxWidth: imageSize,
      marginBottom: isShortDevice ? height * 0.05 : height * 0.08,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    textContainer: {
      alignItems: 'center',
      width: '100%',
      maxWidth: Math.min(width * 0.85, 340),
    },
    slideTitle: {
      fontSize: titleSize,
      fontFamily: FONT_FAMILIES.nunitoBold,
      textAlign: 'center',
      marginBottom: isSmallDevice ? 12 : 16,
      color: Colors.textPrimaryColor,
    },
    slideDescription: {
      fontSize: descriptionSize,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: isSmallDevice ? 20 : 24,
      maxWidth: Math.min(width * 0.8, 320),
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    disclaimerContainer: {
      marginTop: 12,
      paddingHorizontal: 8,
    },
    disclaimerText: {
      fontSize: isSmallDevice ? 8 : 9,
      color: Colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: isSmallDevice ? 11 : 12,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },

    // Error styles
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: Colors.backgroundColor,
    },
    errorTitle: {
      fontSize: 22,
      fontFamily: FONT_FAMILIES.nunitoBold,
      marginBottom: 10,
      color: Colors.error,
    },
    errorMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: Colors.textPrimaryColor,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    errorButton: {
      backgroundColor: Colors.primaryColor,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    errorButtonText: {
      color: Colors.white,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
  });
};

export default OnboardingScreen;
