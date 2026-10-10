import { loginStyles } from '@/screens/auth/styles';
import { useAppTheme } from '@/hooks/themeHook';
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
  showPasswordStrength?: boolean;
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
  showPasswordStrength = false,
  children,
}: BaseAuthFormProps) => {
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
            color={Colors.textSecondary}
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
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={togglePasswordVisibility}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        showPasswordStrength={showPasswordStrength}
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
  showForgotPassword = false,
  showPrivacyNotice = false,
  showDivider = false,
  children,
}: ForgetPasswordFormProps) => {
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
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <View style={loginStyles.buttonContainer}>
        <AnimatedButton
          text={submitButtonText}
          onPress={onSubmit}
          loading={loading}
            backgroundColor='#1857C1'
            activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
          
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
  const lastNameInputRef = React.useRef<any>(null);
  const emailInputRef = React.useRef<any>(null);
  const phoneInputRef = React.useRef<any>(null);
  const passwordInputRef = React.useRef<any>(null);
  const confirmPasswordRef = React.useRef<any>(null);
  const { Colors } = useAppTheme();

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
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => lastNameInputRef.current?.focus()}
      />

      <AnimatedInput
        ref={lastNameInputRef}
        label="Last Name"
        placeholder="Enter your last name"
        value={lastName}
        onChangeText={setLastName}
        error={errorObj.lastNameError}
        index={1}
        leftIcon={
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={Colors.textSecondary}
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
        index={2}
        leftIcon={
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color={Colors.textSecondary}
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
        index={3}
        leftIcon={
          <MaterialCommunityIcons
            name="phone-outline"
            size={20}
            color={Colors.textSecondary}
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
        // secureTextEntry={!passwordVisible}
        error={errorObj.passwordError}
        index={4}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={togglePasswordVisibility}
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        showPasswordStrength={true}
      />

      <AnimatedInput
        ref={confirmPasswordRef}
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        // secureTextEntry={!confirmPasswordVisible}
        error={errorObj.confirmPasswordError}
        index={5}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-check-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
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
            backgroundColor='#1857C1'
            activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
        />
      </View>

      {showDivider && <AuthDivider />}
    </Reanimated.View>
  );
};

interface ChangePasswordFormProps {
  formStyle?: any;
  currentPassword: string;
  setCurrentPassword: (text: string) => void;
  newPassword: string;
  setNewPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  currentPasswordVisible: boolean;
  toggleCurrentPasswordVisibility: () => void;
  newPasswordVisible: boolean;
  toggleNewPasswordVisibility: () => void;
  confirmPasswordVisible: boolean;
  toggleConfirmPasswordVisibility: () => void;
  errorObj: {
    currentPasswordError: string;
    newPasswordError: string;
    confirmPasswordError: string;
  };
  onSubmit: () => void;
  loading: boolean;
  submitButtonText?: string;
  showPrivacyNotice?: boolean;
  children?: React.ReactNode;
}

export const ChangePasswordForm = ({
  formStyle,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  currentPasswordVisible,
  toggleCurrentPasswordVisibility,
  newPasswordVisible,
  toggleNewPasswordVisibility,
  confirmPasswordVisible,
  toggleConfirmPasswordVisibility,
  errorObj,
  onSubmit,
  loading,
  submitButtonText = 'Change Password',
  showPrivacyNotice = false,
  children,
}: ChangePasswordFormProps) => {
  const newPasswordInputRef = React.useRef<any>(null);
  const confirmPasswordRef = React.useRef<any>(null);
  const { Colors } = useAppTheme();

  return (
    <Reanimated.View style={[loginStyles.formSection, formStyle]}>
      <AnimatedInput
        label="Current Password"
        placeholder="Enter current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={!currentPasswordVisible}
        error={errorObj.currentPasswordError}
        index={1}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={currentPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={toggleCurrentPasswordVisibility}
        returnKeyType="next"
        onSubmitEditing={() => newPasswordInputRef.current?.focus()}
      />

      <AnimatedInput
        ref={newPasswordInputRef}
        label="New Password"
        placeholder="Create new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!newPasswordVisible}
        error={errorObj.newPasswordError}
        index={2}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={newPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={toggleNewPasswordVisibility}
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        showPasswordStrength={true}
      />

      <AnimatedInput
        ref={confirmPasswordRef}
        label="Confirm New Password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!confirmPasswordVisible}
        error={errorObj.confirmPasswordError}
        index={3}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-check-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={toggleConfirmPasswordVisibility}
        returnKeyType="done"
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
    </Reanimated.View>
  );
};

interface VerifyOTPFormProps {
  formStyle?: any;
  otp: string;
  setOtp: (text: string) => void;
  errorObj: {
    otpError: string;
  };
  onSubmit: () => void;
  onResend?: () => void;
  loading: boolean;
  resendLoading?: boolean;
  submitButtonText?: string;
  showResend?: boolean;
  resendDisabled?: boolean;
  resendTimer?: number;
  children?: React.ReactNode;
}

export const VerifyOTPForm = ({
  formStyle,
  otp,
  setOtp,
  errorObj,
  onSubmit,
  onResend,
  loading,
  resendLoading = false,
  submitButtonText = 'Verify',
  showResend = true,
  resendDisabled = false,
  resendTimer = 0,
  children,
}: VerifyOTPFormProps) => {
  return (
    <Reanimated.View style={[loginStyles.formSection, formStyle]}>
      <AnimatedInput
        label="OTP Code"
        placeholder="Enter 6-digit code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        error={errorObj.otpError}
        index={1}
        leftIcon={
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <View style={loginStyles.buttonContainer}>
        <AnimatedButton
          text={submitButtonText}
          onPress={onSubmit}
          loading={loading}
        />
      </View>

      {showResend && onResend && (
        <View style={loginStyles.resendContainer}>
          <AnimatedButton
            text={
              resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'
            }
            onPress={onResend}
            loading={resendLoading}
            disabled={resendDisabled || resendTimer > 0}
            variant="text"
          />
        </View>
      )}

      {children}
    </Reanimated.View>
  );
};

interface ResetPasswordFormProps {
  formStyle?: any;
  newPassword: string;
  setNewPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  newPasswordVisible: boolean;
  toggleNewPasswordVisibility: () => void;
  confirmPasswordVisible: boolean;
  toggleConfirmPasswordVisibility: () => void;
  errorObj: {
    newPasswordError: string;
    confirmPasswordError: string;
  };
  onSubmit: () => void;
  loading: boolean;
  submitButtonText?: string;
  children?: React.ReactNode;
}

export const ResetPasswordForm = ({
  formStyle,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  newPasswordVisible,
  toggleNewPasswordVisibility,
  confirmPasswordVisible,
  toggleConfirmPasswordVisibility,
  errorObj,
  onSubmit,
  loading,
  submitButtonText = 'Reset Password',
  children,
}: ResetPasswordFormProps) => {
  const confirmPasswordRef = React.useRef<any>(null);
  const { Colors } = useAppTheme();

  return (
    <Reanimated.View style={[loginStyles.formSection, formStyle]}>
      <AnimatedInput
        label="New Password"
        placeholder="Create new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!newPasswordVisible}
        error={errorObj.newPasswordError}
        index={1}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={newPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={toggleNewPasswordVisibility}
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        showPasswordStrength={true}
      />

      <AnimatedInput
        ref={confirmPasswordRef}
        label="Confirm Password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!confirmPasswordVisible}
        error={errorObj.confirmPasswordError}
        index={2}
        leftIcon={
          <MaterialCommunityIcons
            name="lock-check-outline"
            size={20}
            color={Colors.textSecondary}
            style={loginStyles.inputIcon}
          />
        }
        rightIcon={
          <MaterialCommunityIcons
            name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        }
        onRightIconPress={toggleConfirmPasswordVisibility}
        returnKeyType="done"
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
    </Reanimated.View>
  );
};
