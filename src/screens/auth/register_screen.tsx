import { AuthFooter, AuthHeader } from '@/components/auth/auth-components';
import { RegisterForm } from '@/components/auth/auth-forms';
import {
  useAuthAnimations,
  useRegisterForm,
} from '@/components/auth/auth-hooks';
import AuthLayout from '@/components/auth/auth-layout';
import SocianFullButtons from '@/components/auth/social-buttons-full';
import useAuthentication from '@/hooks/use-authentication';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { Toast } from '@/utils/toast';
import Clipboard from '@react-native-clipboard/clipboard';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

const RegisterScreen = ({ navigation }) => {
  // const { signUpWithEmail: signUp } = useFirebaseAuth();

  const {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    socialOpacity,
    startAnimations,
  } = useAuthAnimations();

  const {
    EmailSignUp
  } = useAuthentication();

  const {
    loading,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordVisible,
    confirmPasswordVisible,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    errorObj,
    onSubmit,
  } = useRegisterForm({
    onSuccess: async (email, password, name, lastName, phone) => {
      const res = await EmailSignUp({
        firstName: name,
        lastName,
        email,
        mobileNumber: phone,
        password,
      });

      console.log(res);

      Clipboard.setString('res');

      if(res?.status === 'otp_sent'){
        navigation.navigate('OTPVerifyScreen', {
          email,
          type: 'new_user',
        });
      }
    }
  });

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const socialStyle = useAnimatedStyle(() => ({
    opacity: socialOpacity.value,
  }));

  return (
    <AuthLayout
      header={
        <AuthHeader
          headerStyle={headerStyle}
          title="Join HealthPulse HEALTH"
          subtitle="Create your account to start your health journey"
        />
      }
    >
      <RegisterForm
        formStyle={formStyle}
        firstName={firstName}
        setFirstName={setFirstName}
        email={email}
        setEmail={setEmail}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        password={password}
        setPassword={setPassword}
        passwordVisible={passwordVisible}
        togglePasswordVisibility={togglePasswordVisibility}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        confirmPasswordVisible={confirmPasswordVisible}
        toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
        errorObj={errorObj}
        onSubmit={onSubmit}
        loading={loading}
        lastName={lastName}
        setLastName={setLastName}
      />

      <Reanimated.View style={[styles.socialSection, socialStyle]}>
        <AuthFooter
          primaryText="Already have an account?"
          secondaryText="Sign in"
          onActionPress={() => navigation.navigate('LoginScreen')}
        />
        <SocianFullButtons />
      </Reanimated.View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
});

export default RegisterScreen;
