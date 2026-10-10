import { AuthHeader } from '@/components/auth/auth-components';
import AuthLayout from '@/components/auth/auth-layout';
import { AnimatedButton } from '@/components/base/AnimatedButton';
import { supabase } from '@/config/supabase-config';
import { SKYP_COLORS } from '@/screens/auth/styles';
import { logButtonTap } from '@/services/analyticsService';
import { hapticFeedback } from '@/utils/haptics';
import { Toast } from '@/utils/toast';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MailCheckScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verificationMethod, setVerificationMethod] = useState<'link' | 'otp'>(
    'link',
  );
  const [otpError, setOtpError] = useState('');

  // Countdown timer for resend email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleBackToLogin = () => {
    hapticFeedback('impactLight');
    logButtonTap('MailCheck - Back to Login');
    navigation.navigate('LoginScreen');
  };

  const handleTryAnotherEmail = () => {
    hapticFeedback('impactLight');
    logButtonTap('MailCheck - Try Another Email');
    navigation.navigate('ForgotPasswordScreen');
  };

  const resendVerification = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      if (verificationMethod === 'link') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        if (error) throw error;
        Toast('Verification email resent successfully');
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: 'yourapp://auth/callback',
          },
        });
        if (error) throw error;
        Toast('OTP sent successfully');
      }
      setCountdown(60);
    } catch (error) {
      Toast(error.message || 'Failed to resend verification');
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      Toast('Email verified successfully!');
      navigation.navigate('LoginScreen');
    } catch (error) {
      setOtpError('Invalid OTP. Please try again.');
      Toast('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerificationMethod = () => {
    setVerificationMethod(prev => (prev === 'link' ? 'otp' : 'link'));
    setOtp('');
    setOtpError('');
  };

  return (
    <AuthLayout header={<AuthHeader title="Check Your Email" />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {verificationMethod === 'link'
                ? 'Password Reset Sent'
                : 'Enter Verification Code'}
            </Text>
            <Text style={styles.subtitle}>
              {verificationMethod === 'link'
                ? `We've sent a password reset link to ${email}. Please check your inbox.`
                : `We've sent a 6-digit OTP to ${email}. Please enter it below.`}
            </Text>
          </View>

          <Image
            source={require('@/assets/images/open-email.png')}
            style={styles.image}
            resizeMode="contain"
          />

          {verificationMethod === 'otp' && (
            <View style={styles.otpContainer}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={SKYP_COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#8391A1"
                  value={otp}
                  onChangeText={text => {
                    setOtp(text.replace(/[^0-9]/g, ''));
                    setOtpError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
              {otpError && <Text style={styles.errorText}>{otpError}</Text>}

              <AnimatedButton
                text="Verify OTP"
                onPress={verifyOtp}
                loading={isLoading}
                disabled={otp.length < 6}
                style={styles.verifyButton}
              />
            </View>
          )}

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.toggleMethodButton}
              onPress={toggleVerificationMethod}
            >
              <Text style={styles.toggleMethodText}>
                {verificationMethod === 'link'
                  ? 'Use OTP verification instead'
                  : 'Use verification link instead'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={resendVerification}
              disabled={countdown > 0 || resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator color={SKYP_COLORS.primary} />
              ) : (
                <Text style={styles.resendText}>
                  {countdown > 0
                    ? `Resend in ${countdown}s`
                    : 'Resend verification'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Didn't receive the email? Check your spam filter or
              </Text>
              <TouchableOpacity
                onPress={handleTryAnotherEmail}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>try another email address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SKYP_COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: SKYP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 40,
    alignSelf: 'center',
  },
  otpContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SKYP_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: SKYP_COLORS.text,
  },
  errorText: {
    color: SKYP_COLORS.error,
    fontSize: 14,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  verifyButton: {
    marginTop: 16,
  },
  actionContainer: {
    alignItems: 'center',
  },
  toggleMethodButton: {
    marginBottom: 24,
  },
  toggleMethodText: {
    color: SKYP_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    marginBottom: 16,
    padding: 8,
  },
  resendText: {
    color: SKYP_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: SKYP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  linkContainer: {
    padding: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: SKYP_COLORS.primary,
  },
});

export default MailCheckScreen;
