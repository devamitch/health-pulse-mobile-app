import { AnimatedInput } from '@/components/base/AnimatedInput';
import { AnimatedButton } from '@/components/base/AnimatedButton';
import { AuthHeader } from '@/components/auth/auth-components';
import AuthLayout from '@/components/auth/auth-layout';
import useAuthentication from '@/hooks/use-authentication';
import { useAppTheme } from '@/hooks/themeHook';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthAnimations } from '@/components/auth/auth-hooks';

type RootStackParamList = {
  PasswordChanged: undefined;
};

const PasswordResetScreen = ({ route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmNewPasswordVisible] =
    useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmNewPasswordVisible(prev => !prev);

  const passwordInputRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  const [errorObj, setErrorObj] = useState({
    password: '',
    confirmPassword: '',
  });
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { Colors } = useAppTheme();

  const {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    startAnimations,
  } = useAuthAnimations();

  const { resetPassword } = useAuthentication();

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

  const onChangePassword = async () => {
    let flag = true;

    try {
      if (!newPassword.trim()) {
        flag = false;
        errorObj.password = 'Please enter password';
      } else {
        flag = true;
        errorObj.password = '';
      }
      if (!confirmPassword.trim()) {
        flag = false;
        errorObj.confirmPassword = 'Please enter confirm password';
      } else {
        flag = true;
        errorObj.confirmPassword = '';
      }
      if (newPassword !== confirmPassword) {
        flag = false;
        errorObj.password = 'Password not matching';
        errorObj.confirmPassword = 'Password not matching';
      } else {
        flag = true;
        errorObj.password = '';
        errorObj.confirmPassword = '';
      }
      setErrorObj(errorObj);
      if (flag) {
        setLoading(true);
        await resetPassword({
          email: route.params.email,
          newPassword,
          resetToken: route.params.resetToken,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      header={
        <AuthHeader
          headerStyle={headerStyle}
          title="Create new password"
          subtitle="Your new password must be unique from those previously used."
        />
      }
    >
      <Reanimated.View style={[{ paddingHorizontal: 24 }, formStyle]}>
        <AnimatedInput
          ref={passwordInputRef}
          label="Password"
          placeholder="Create a password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!passwordVisible}
          error={errorObj.password}
          index={1}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.textSecondary}
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
          secureTextEntry={!confirmPasswordVisible}
          error={errorObj.confirmPassword}
          index={2}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.textSecondary}
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
          onSubmitEditing={onChangePassword}
        />

        <View style={{ marginTop: 24 }}>
          <AnimatedButton
            text="Reset Password"
            onPress={onChangePassword}
            loading={loading}
              backgroundColor='#1857C1'
            activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
         
          />
        </View>
      </Reanimated.View>
    </AuthLayout>
  );
};

export default PasswordResetScreen;
