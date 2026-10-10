import { AnimatedButton } from '@/components/base/AnimatedButton';
import { AnimatedInput } from '@/components/base/AnimatedInput';
import { loginStyles, SKYP_COLORS } from '@/screens/auth/styles';
import React from 'react';
import { View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ForgotPasswordLink } from './ForgotPasswordLink';
import { ResendVerification } from './ResendVerification';
import { useAppTheme } from '@/hooks/themeHook';

interface LoginFormProps {
  formStyle: any;
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  passwordVisible: boolean;
  togglePasswordVisibility: () => void;
  errorObj: {
    emailError: string;
    passwordError: string;
  };
  validation: () => void;
  loading: boolean;
  emailVerified: boolean;
  handleResendEmail: () => void;
  navigation: any;
}

export const LoginForm = ({
  formStyle,
  email,
  setEmail,
  password,
  setPassword,
  passwordVisible,
  togglePasswordVisibility,
  errorObj,
  validation,
  loading,
  emailVerified,
  handleResendEmail,
  navigation,
}: LoginFormProps) => {
  const passwordInputRef = React.useRef<any>(null);
    const { Colors } = useAppTheme();

  return (
    <Reanimated.View style={[loginStyles.formSection, formStyle]}>
      <AnimatedInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errorObj.emailError}
        index={1}
        leftIcon={
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color={SKYP_COLORS.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
      />

      <AnimatedInput
        ref={passwordInputRef}
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        error={errorObj.passwordError}
        index={2}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={SKYP_COLORS.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={SKYP_COLORS.textSecondary}
          />
        }
        onRightIconPress={togglePasswordVisibility}
        returnKeyType="done"
        onSubmitEditing={validation}
      />

      <ForgotPasswordLink navigation={navigation} />

      <View style={loginStyles.buttonContainer}>
        <AnimatedButton
          text="Sign In"
          onPress={validation}
          loading={loading}
          backgroundColor="#1857C1"
          activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
        />
      </View>

      {!emailVerified && <ResendVerification onPress={handleResendEmail} />}
    </Reanimated.View>
  );
};
