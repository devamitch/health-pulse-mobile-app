import CoverImage from '@/assets/svg/otp.svg';
import { AuthHeader } from '@/components/auth/auth-components';
import { useAuthAnimations } from '@/components/auth/auth-hooks';
import AuthLayout from '@/components/auth/auth-layout';
import { AnimatedButton } from '@/components/base/AnimatedButton';
import OtpInput from '@/components/otp-input';
import Button from '@/components/ui/buttons/button';
import { useAppTheme } from '@/hooks/themeHook';
import useAuthentication from '@/hooks/use-authentication';
import { hapticFeedback } from '@/utils/haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const OTPVerificationScreen = ({ navigation, route }: any) => {
  const [otp, setOTP] = useState('');
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const errorShake = useSharedValue(0);

  const {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    startAnimations,
  } = useAuthAnimations();

  const {
    verifyNewUser,
    verifyForgotPassword,
    VerifyDeleteAccountOTP,
    ResendRegUserOTP,
    ResendForgotPasswordOTP,
    ResendDeleteAccountOTP,
  } = useAuthentication();

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  useEffect(() => {
    startAnimations();
  }, []);

  // Auto-submit when OTP is complete
  const handleOTPComplete = useCallback(
    async (code: string) => {
      await handlePressVerify(code);
    },
    [route.params],
  );

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const handlePressVerify = async (code?: string) => {
    const otpCode = code || otp;

    if (otpCode.length !== 6) {
      setError(true);
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      hapticFeedback('notificationError');
      return;
    }

    setLoading(true);
    setError(false);
    buttonScale.value = withSpring(0.95, { damping: 10 });

    try {
      if (route.params.type === 'new_user') {
        await verifyNewUser({ email: route.params.email ?? '', otp: otpCode });
      } else if (route.params.type === 'delete_account') {
        await VerifyDeleteAccountOTP({
          email: route.params.email ?? '',
          otp: otpCode,
        });
      } else {
        await verifyForgotPassword({
          email: route.params.email ?? '',
          otp: otpCode,
        });
      }
      hapticFeedback('notificationSuccess');
    } catch (err) {
      setError(true);
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      hapticFeedback('notificationError');
    } finally {
      setLoading(false);
      buttonScale.value = withSpring(1, { damping: 10 });
    }
  };

  const handlePressResend = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setError(false);
    hapticFeedback('impactMedium');

    try {
      if (route.params.type === 'new_user') {
        await ResendRegUserOTP(route.params.email ?? '');
      } else if (route.params.type === 'delete_account') {
        await ResendDeleteAccountOTP();
      } else {
        await ResendForgotPasswordOTP(route.params.email ?? '');
      }
      // Reset timer
      setResendTimer(120);
      setCanResend(false);
      hapticFeedback('notificationSuccess');
    } catch (err) {
      hapticFeedback('notificationError');
    } finally {
      setResendLoading(false);
    }
  };

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername =
      username.substring(0, 2) +
      '***' +
      username.substring(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <AuthLayout
      header={
        <AuthHeader
          headerStyle={headerStyle}
          title="Verify Your Email"
          subtitle="Enter the 6-digit code we sent to your email"
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.imageContainer}>
        <CoverImage width={200} height={200} />
      </View>

      <Animated.View style={[formStyle, styles.formContainer]}>
        {/* Email Info Card */}
        <View style={styles.emailCard}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color={Colors.primaryColor || '#1857C1'}
          />
          <View style={styles.emailTextContainer}>
            <Text style={styles.emailLabel}>Code sent to</Text>
            <Text style={[styles.emailText, { color: Colors.primaryColor }]}>
              {formatEmail(route.params.email || '')}
            </Text>
          </View>
        </View>

        {/* OTP Input with error animation */}
        <Animated.View style={errorAnimatedStyle}>
          <OtpInput
            length={6}
            value={otp}
            onChangeText={text => {
              setOTP(text);
              setError(false);
            }}
            onCodeFilled={handleOTPComplete}
            error={error}
            disabled={loading}
          />
          {error && (
            <Text style={styles.errorText}>
              Invalid code. Please try again.
            </Text>
          )}
        </Animated.View>

        {/* Verify Button */}
        
           <AnimatedButton
                    text='Verify OTP'
                         onPress={() => handlePressVerify()}
                    loading={loading}
                      backgroundColor='#1857C1'
                      activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
                           disabled={otp.length !== 6}
                  />

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={styles.resendLabel}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handlePressResend}
            style={[
              styles.resendButton,
              (!canResend || resendLoading) && styles.resendButtonDisabled,
            ]}
            disabled={!canResend || resendLoading}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={16}
              color={
                canResend && !resendLoading
                  ? Colors.primaryColor || '#1857C1'
                  : Colors.textSecondary || '#718096'
              }
              style={styles.resendIcon}
            />
            <Text
              style={[
                styles.resendText,
                {
                  color:
                    canResend && !resendLoading
                      ? Colors.primaryColor || '#1857C1'
                      : Colors.textSecondary || '#718096',
                },
              ]}
            >
              {resendLoading
                ? 'Sending...'
                : canResend
                ? 'Resend Code'
                : `Resend in ${formatTime(resendTimer)}`}

              {/* {resendLoading
                ? 'Sending...'
                : canResend
                ? 'Resend Code'
                : `Resend in ${resendTimer}s`} */}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color={Colors.textSecondary || '#718096'}
          />
          <Text style={styles.helpText}>
            Check your spam folder if you don't see the email
          </Text>
        </View>
      </Animated.View>
    </AuthLayout>
  );
};

const createStyle = (Colors: any) =>
  StyleSheet.create({
    imageContainer: {
      alignItems: 'center',
      marginVertical: 24,
    },
    formContainer: {
      paddingHorizontal: 24,
      gap: 24,
    },
    emailCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${Colors.primaryColor || '#1857C1'}08`,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${Colors.primaryColor || '#1857C1'}20`,
    },
    emailTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    emailLabel: {
      fontSize: 12,
      color: Colors.textSecondary || '#718096',
      fontWeight: '500',
      marginBottom: 2,
    },
    emailText: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
    },
    errorText: {
      fontSize: 13,
      color: '#FF5252',
      textAlign: 'center',
      marginTop: 12,
      fontWeight: '600',
    },
    resendSection: {
      alignItems: 'center',
      gap: 8,
    },
    resendLabel: {
      fontSize: 14,
      color: Colors.textSecondary || '#718096',
      fontWeight: '500',
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: `${Colors.primaryColor || '#1857C1'}10`,
    },
    resendButtonDisabled: {
      backgroundColor: 'transparent',
    },
    resendIcon: {
      marginRight: 6,
    },
    resendText: {
      fontSize: 15,
      fontWeight: '700',
    },
    helpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${Colors.textSecondary || '#718096'}08`,
      padding: 12,
      borderRadius: 10,
      gap: 8,
    },
    helpText: {
      fontSize: 12,
      color: Colors.textSecondary || '#718096',
      flex: 1,
      lineHeight: 18,
    },
  });

export default OTPVerificationScreen;
