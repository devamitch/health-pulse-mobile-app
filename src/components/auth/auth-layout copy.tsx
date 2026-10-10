import type React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

type AuthLayoutProps = {
  children?: React.ReactNode | React.ReactNode[];
  header?: React.ReactNode | React.ReactNode[];
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, header }) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect, insets);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const gradientOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, insets?.top + 40],
      [1, 0],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
    };
  });
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="transparent"
        barStyle={Colors.isDark ? 'light-content' : 'dark-content'}
        translucent
      />
      <Reanimated.View
        style={[styles.fixedHeaderGradient, gradientOpacityStyle]}
      >
        <LinearGradient
          colors={['#2266dd32', '#065df40f', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientFill}
        />
      </Reanimated.View>
      {header}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <Reanimated.ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {children}
        </Reanimated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyle = (
  Colors: ColorScheme,
  DEffect: ElevationScheme,
  insets: { top: number; bottom: number; left: number; right: number },
) => {
  const primaryColor = Colors.primaryColor || '#1857C1';

  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      backgroundColor: 'transparent',
      paddingTop: insets.top,
      paddingBottom: Math.max(insets.bottom, 16),
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    imageContainer: {
      flex: 0.4,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },
    image: {
      width: width * 0.8,
      height: height * 0.3,
      maxHeight: 300,
    },
    bottomContainer: {
      flex: 0.6,
      backgroundColor: 'transparent',
      paddingTop: 20,
    },
    contentContainer: {
      paddingHorizontal: 24,
      flex: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
      color: '#2D3748',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      letterSpacing: -0.5,
    },
    subTitle: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 32,
      color: '#718096',
      opacity: 0.8,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    primaryButton: {
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    secondaryButton: {
      marginBottom: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    secondaryButtonText: {
      color: primaryColor,
    },
    fixedHeaderGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 400,
      zIndex: 0,
    },
    gradientFill: {
      flex: 1,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
  });
};

export default AuthLayout;
