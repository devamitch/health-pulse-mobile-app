import { AuthFooter, AuthHeader } from '@/components/auth/auth-components';
import { ForgetPasswordForm } from '@/components/auth/auth-forms';
import { useAuthAnimations } from '@/components/auth/auth-hooks';
import AuthLayout from '@/components/auth/auth-layout';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { logButtonTap } from '@/services/analyticsService';
import { hapticFeedback } from '@/utils/haptics';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    startAnimations,
  } = useAuthAnimations();

  const { loading, email, setEmail, errorObj, onSubmit } = useForgotPassword();

  useEffect(() => {
    startAnimations();
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  return (
    <AuthLayout
      header={
        <AuthHeader
          headerStyle={headerStyle}
          title="Forgot Password?"
          subtitle="Don't worry! It occurs. Please enter the email address linked with your account."
        />
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/forgotpassword.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <ForgetPasswordForm
        formStyle={formStyle}
        email={email}
        setEmail={setEmail}
        errorObj={errorObj}
        onSubmit={onSubmit}
        loading={loading}
        submitButtonText="Send Reset Code"
        showForgotPassword={false}
        showPrivacyNotice={false}
      />

      <AuthFooter
        primaryText="Remember your password?"
        secondaryText="Sign in"
        onActionPress={() => {
          hapticFeedback('impactLight');
          logButtonTap('Forgot Password - Back to Login');
          navigation.navigate('LoginScreen');
        }}
      />
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: '80%',
    height: 200,
  },
});

export default ForgotPasswordScreen;
