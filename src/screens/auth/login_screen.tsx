import AuthLayout from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login/LoginForm';
import { LoginHeader } from '@/components/auth/login/LoginHeader';
import React from 'react';

import { useLoginAnimations } from '@/components/auth/login/useLoginAnimations';
import { useLoginForm } from '@/components/auth/login/useLoginForm';
import SocianFullButtons from '@/components/auth/social-buttons-full';
import useAuthentication from '@/hooks/use-authentication';
import { useAnimatedStyle } from 'react-native-reanimated';

const LoginScreen = ({ navigation }: any) => {
  // const { signInWithEmail: signIn } = useFirebaseAuth();
  const {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    startAnimations,
  } = useLoginAnimations();

  const { EmailSignIn } = useAuthentication();

  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    emailVerified,
    passwordVisible,
    togglePasswordVisibility,
    errorObj,
    validation,
    handleResendEmail,
  } = useLoginForm(async (email, password) => {
    const signin = await EmailSignIn({ email, password });
    console.log(signin);

    // Toast(signin.message ?? signin.error ?? '');
  });

  React.useEffect(() => {
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
      header={<LoginHeader navigation={navigation} headerStyle={headerStyle} />}
    >
      <LoginForm
        formStyle={formStyle}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        passwordVisible={passwordVisible}
        togglePasswordVisibility={togglePasswordVisibility}
        errorObj={errorObj}
        validation={validation}
        loading={loading}
        emailVerified={emailVerified}
        handleResendEmail={handleResendEmail}
        navigation={navigation}
      />

      <SocianFullButtons />
    </AuthLayout>
  );
};

export default LoginScreen;
