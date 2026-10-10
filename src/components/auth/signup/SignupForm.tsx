import { AnimatedButton } from '@/components/base/AnimatedButton';
import { AnimatedInput } from '@/components/base/AnimatedInput';
import { loginStyles, SKYP_COLORS } from '@/screens/auth/styles';
import { Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SignupFormProps {
  formStyle: any;
  formData: {
    displayName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    displayName: string;
    emailError: string;
    phoneNumberError: string;
    passwordError: string;
    confirmPasswordError: string;
  };
  visibility: {
    isPasswordVisible: boolean;
    isConfirmPasswordVisible: boolean;
  };
  onChange: (field: string, value: string) => void;
  onToggleVisibility: (field: 'password' | 'confirmPassword') => void;
  onSubmit: () => void;
  loading: boolean;
  onNavigateToLogin: () => void;
}

export const SignupForm = ({
  formStyle,
  formData,
  errors,
  visibility,
  onChange,
  onToggleVisibility,
  onSubmit,
  loading,
  onNavigateToLogin,
}: SignupFormProps) => (
  <Reanimated.View style={[loginStyles.formSection, formStyle]}>
    <AnimatedInput
      label="Full Name"
      placeholder="Enter your full name"
      value={formData.displayName}
      onChangeText={text => onChange('displayName', text)}
      error={errors.displayName}
      leftIcon={
        <MaterialCommunityIcons
          name="account-outline"
          size={20}
          color={SKYP_COLORS.textSecondary}
          style={loginStyles.inputIcon}
        />
      }
      index={0}
    />

    {/* Reuse similar input components for other fields */}

    <View style={loginStyles.privacyNotice}>
      <MaterialCommunityIcons
        name="shield-check-outline"
        size={18}
        color={SKYP_COLORS.secondary}
      />
      <Text style={loginStyles.privacyText}>
        Your personal data is 100% private and secure
      </Text>
    </View>

    <View style={loginStyles.buttonContainer}>
      <AnimatedButton
        text="Create Account"
        onPress={onSubmit}
        loading={loading}
      />
    </View>

    <View style={loginStyles?.signInContainer}>
      <Text style={loginStyles?.signInText}>Already have an account?</Text>
      <TouchableOpacity onPress={onNavigateToLogin}>
        <Text style={[loginStyles?.signInLink, { color: SKYP_COLORS.primary }]}>
          Sign in
        </Text>
      </TouchableOpacity>
    </View>
  </Reanimated.View>
);
