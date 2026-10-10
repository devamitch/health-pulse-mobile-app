import { hapticFeedback } from '@/utils';
import { Toast } from '@/utils/toast';
import { checkEmail } from '@/utils/validation/string_validation';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import useAuthentication from './use-authentication';
import { Alert } from 'react-native';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errorObj, setErrorObj] = useState({
    emailError: '',
  });
  const navigation = useNavigation();

  const {
    forgotPassword,
  } = useAuthentication();

  const validate = () => {
    hapticFeedback('impactLight');
    let isValid = true;
    const newErrors = { ...errorObj };

    if (!email) {
      isValid = false;
      newErrors.emailError = 'Please enter your email';
    } else if (!checkEmail(email)) {
      isValid = false;
      newErrors.emailError = 'Please enter a valid email';
    } else {
      newErrors.emailError = '';
    }

    setErrorObj(newErrors);
    return isValid;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    // let message = ' Please check your mail';
    try {
      const response = await forgotPassword(email);
      console.log(response);
      if(response.status === 'otp_sent'){
        navigation.navigate('OTPVerifyScreen', {
          email
        });
      } else {
        Alert.alert(response.message);
      }
      // await supabaseResetPasswordForEmail(email);
      // try {
      //   const response = await resetPasswordWithFirebase(email);
      //   if (response.success) {
      //     message = response?.message;
      //   }
      // } catch (e) {}
      // Alert.alert(message);
      // navigation.navigate('MailCheckScreen', { email });
    } catch (error: any) {
      console.error(error);
      Toast(error?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    email,
    setEmail,
    errorObj,
    onSubmit,
  };
};
