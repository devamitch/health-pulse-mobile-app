import { hapticFeedback } from '@/utils/haptics';
import { Toast } from '@/utils/toast';
import { checkEmail } from '@/utils/validation/string_validation';
import { useEffect, useState } from 'react';
import { useVerificationEmail } from './useVerificationEmail';

export const useLoginForm = (
  signIn: (email: string, password: string) => Promise<void>,
) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorObj, setErrorObj] = useState({
    emailError: '',
    passwordError: '',
  });
  const { sendVerificationEmail, isLoading } = useVerificationEmail();

  useEffect(() => {
    if (email && errorObj.emailError) {
      setErrorObj(prev => ({ ...prev, emailError: '' }));
    }
  }, [email]);

  useEffect(() => {
    if (password && errorObj.passwordError) {
      setErrorObj(prev => ({ ...prev, passwordError: '' }));
    }
  }, [password]);

  const validation = () => {
    hapticFeedback('impactLight');
    let isValidate = true;
    const newErrors = { ...errorObj };

    if (!email) {
      isValidate = false;
      newErrors.emailError = 'Please enter your email';
    } else if (!checkEmail(email)) {
      isValidate = false;
      newErrors.emailError = 'Please enter a valid email';
    } else {
      newErrors.emailError = '';
    }

    if (!password) {
      isValidate = false;
      newErrors.passwordError = 'Please enter your password';
    } else {
      newErrors.passwordError = '';
    }

    setErrorObj(newErrors);

    if (isValidate) {
      onLoginCall();
    }
  };

  const onLoginCall = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Toast(error?.message || 'An error occurred');
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    hapticFeedback('impactLight');
    try {
      const result = await sendVerificationEmail(email, password);
      if (result?.message) {
        Toast(result?.message);
      }
    } catch (error) {
      Toast('Failed to resend verification email');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return {
    loading: loading || isLoading,
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
  };
};
