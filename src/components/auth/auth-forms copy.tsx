import { loginStyles, SKYP_COLORS } from '@/screens/auth/styles';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedButton } from '../base/AnimatedButton';
import { AnimatedInput } from '../base/AnimatedInput';
import { AuthDivider, PrivacyNotice } from './auth-components';
import { ForgotPasswordLink } from './login/ForgotPasswordLink';

interface ForgetPasswordFormProps {
  formStyle?: any;
  email: string;
  setEmail: (text: string) => void;

  errorObj: {
    emailError: string;
  };
  onSubmit: () => void;
  loading: boolean;
  submitButtonText?: string;
  showForgotPassword?: boolean;
  showPrivacyNotice?: boolean;
  showDivider?: boolean;
  children?: React.ReactNode;
}

interface BaseAuthFormProps {
  formStyle?: any;
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
  onSubmit: () => void;
  loading: boolean;
  submitButtonText?: string;
  showForgotPassword?: boolean;
  showPrivacyNotice?: boolean;
  showDivider?: boolean;
  children?: React.ReactNode;
}

export const BaseAuthForm = ({
  formStyle,
  email,
  setEmail,
  password,
  setPassword,
  passwordVisible,
  togglePasswordVisibility,
  errorObj,
  onSubmit,
  loading,
  submitButtonText = 'Continue',
  showForgotPassword = true,
  showPrivacyNotice = true,
  showDivider = false,
  children,
}: BaseAuthFormProps) => {
  const passwordInputRef = React.useRef<any>(null);

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
        // secureTextEntry={!passwordVisible}
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
        onSubmitEditing={onSubmit}
      />

      {showForgotPassword && (
        <ForgotPasswordLink navigation={useNavigation()} />
      )}

      <View style={loginStyles.buttonContainer}>
        <AnimatedButton
          text={submitButtonText}
          onPress={onSubmit}
          loading={loading}
        />
      </View>

      {children}

      {showPrivacyNotice && <PrivacyNotice />}
      {showDivider && <AuthDivider />}
    </Reanimated.View>
  );
};
export const ForgetPasswordForm = ({
  formStyle,
  email,
  setEmail,

  errorObj,
  onSubmit,
  loading,
  submitButtonText = 'Continue',
  showForgotPassword = true,
  showPrivacyNotice = true,
  showDivider = false,
  children,
}: ForgetPasswordFormProps) => {
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
        onSubmitEditing={onSubmit}
      />

      <View style={loginStyles.buttonContainer}>
        <AnimatedButton
          text={submitButtonText}
          onPress={onSubmit}
          loading={loading}
        />
      </View>

      {children}

      {showPrivacyNotice && <PrivacyNotice />}
      {showDivider && <AuthDivider />}
    </Reanimated.View>
  );
};

interface RegisterFormProps extends BaseAuthFormProps {
  firstName: string;
  setFirstName: (text: string) => void;
  lastName: string;
  setLastName: (text: string) => void;
  phoneNumber: string;
  setPhoneNumber: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  confirmPasswordVisible: boolean;
  toggleConfirmPasswordVisibility: () => void;
  errorObj: BaseAuthFormProps['errorObj'] & {
    firstNameError: string;
    lastNameError: string;
    phoneNumberError: string;
    confirmPasswordError: string;
  };
}

export const RegisterForm = ({
  formStyle,
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
  passwordVisible,
  togglePasswordVisibility,
  confirmPassword,
  setConfirmPassword,
  confirmPasswordVisible,
  toggleConfirmPasswordVisibility,
  errorObj,
  onSubmit,
  loading,
  submitButtonText = 'Create Account',
  showPrivacyNotice = true,
  showDivider = true,
}: RegisterFormProps) => {
  const emailInputRef = React.useRef<any>(null);
  const phoneInputRef = React.useRef<any>(null);
  const passwordInputRef = React.useRef<any>(null);
  const confirmPasswordRef = React.useRef<any>(null);

  return (
    <Reanimated.View style={[loginStyles.formSection, formStyle]}>
      <AnimatedInput
        label="First Name"
        placeholder="Enter your first name"
        value={firstName}
        onChangeText={setFirstName}
        error={errorObj.firstNameError}
        index={0}
        leftIcon={
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={SKYP_COLORS.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => emailInputRef.current?.focus()}
      />

      <AnimatedInput
        label="Last Name"
        placeholder="Enter your last name"
        value={lastName}
        onChangeText={setLastName}
        error={errorObj.lastNameError}
        index={0}
        leftIcon={
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={SKYP_COLORS.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => emailInputRef.current?.focus()}
      />

      <AnimatedInput
        ref={emailInputRef}
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
        onSubmitEditing={() => phoneInputRef.current?.focus()}
      />

      <AnimatedInput
        ref={phoneInputRef}
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        error={errorObj.phoneNumberError}
        index={2}
        leftIcon={
          <MaterialCommunityIcons
            name="phone-outline"
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
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        error={errorObj.passwordError}
        index={3}
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
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        // showPasswordStrength={true}
      />

      <AnimatedInput
        ref={confirmPasswordRef}
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!confirmPasswordVisible}
        error={errorObj.confirmPasswordError}
        index={4}
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
            name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={SKYP_COLORS.textSecondary}
          />
        }
        onRightIconPress={toggleConfirmPasswordVisibility}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      {showPrivacyNotice && <PrivacyNotice />}

      <View style={loginStyles.buttonContainer}>
        <AnimatedButton
          text={submitButtonText}
          onPress={onSubmit}
          loading={loading}
        />
      </View>

      {showDivider && <AuthDivider />}
    </Reanimated.View>
  );
};
