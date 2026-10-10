import type React from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/base/AnimatedButton';
import { AnimatedDivider } from '@/components/base/AnimatedDivider';
import { AnimatedTextComponent } from '@/components/base/AnimatedText';
import { AnimatedViewComponent } from '@/components/base/AnimatedView';

import AuthLayout from '@/components/auth/auth-layout';
import SocianFullButtons from '@/components/auth/social-buttons-full';
import type { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useDeviceToken } from '@/hooks/useDeviceToken';
import { hapticFeedback } from '@/utils/haptics';
import { FONT_FAMILIES } from '@/constants/typography';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect, insets);

  useDeviceToken();

  const navigateToSignIn = (): void => {
    hapticFeedback('impactLight');
    navigation.navigate('LoginScreen');
  };

  const navigateToSignUp = (): void => {
    hapticFeedback('impactLight');
    navigation.navigate('RegisterScreen');
  };

  return (
    <AuthLayout>
      <AnimatedViewComponent
        style={styles.imageContainer}
        fadeIn={true}
        slideIn={true}
        slideDirection="up"
        duration={800}
      >
        <Image
          source={require('@/assets/svg/welcome.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </AnimatedViewComponent>

      <View style={styles.bottomContainer}>
        <View style={styles.contentContainer}>
          <AnimatedViewComponent
            fadeIn={true}
            slideIn={true}
            slideDirection="up"
            duration={800}
          >
            <AnimatedTextComponent
              text="Hi I am HealthPulse Health 👋"
              style={styles.title}
              duration={800}
            />
            <AnimatedTextComponent
              text="AI-powered health companion for a smarter, healthier lifestyle"
              style={styles.subTitle}
              initialDelay={200}
              duration={800}
            />
          </AnimatedViewComponent>

          <AnimatedButton
            onPress={navigateToSignIn}
            text="Sign in"
            style={styles.primaryButton}
            backgroundColor='#1857C1'
            activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
            height={56}
            borderRadius={28}
          />

          <AnimatedButton
            onPress={navigateToSignUp}
            text="Sign up"
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
            backgroundColor={
              Colors.isDark
                ? 'rgba(7, 74, 142, 0.2)'
                : 'rgba(255, 255, 255, 0.9)'
            }
            activeBackgroundColor={
              Colors.isDark
                ? 'rgba(7, 74, 142, 0.3)'
                : 'rgba(255, 255, 255, 0.7)'
            }
            borderColor={Colors.primaryColor}
            borderWidth={1}
            height={56}
            borderRadius={28}
          />

          <AnimatedDivider
            text="or continue with"
            lineColor={
              Colors.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
            }
            textColor={
              Colors.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
            }
            initialDelay={800}
            duration={600}
          />

          <SocianFullButtons fullWidth />
        </View>
      </View>
    </AuthLayout>
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
      paddingTop: 20,
    },
    contentContainer: {
      paddingHorizontal: 24,
      flex: 1,
    },
    title: {
      fontSize: 32,
      textAlign: 'center',
      marginBottom: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      letterSpacing: -0.5,
    },
    subTitle: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 32,
      color: Colors.textSecondary,
      opacity: 0.8,
      lineHeight: 24,
      fontFamily: FONT_FAMILIES.nunitoRegular,
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
      height: 200,
      zIndex: 0,
    },
    gradientFill: {
      flex: 1,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
  });
};

export default WelcomeScreen;
