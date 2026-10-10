import { hapticFeedback } from '@/utils/haptics';
import { Toast } from '@/utils/toast';
import { checkEmail } from '@/utils/validation/string_validation';
import { useEffect, useState } from 'react';
import {} from 'react-native';
import {
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useVerificationEmail } from './login/useVerificationEmail';

interface UseAuthFormOptions {
  initialEmail?: string;
  initialPassword?: string;
  onSuccess: (email: string, password: string) => Promise<void>;
}

export const useAuthForm = ({
  initialEmail = '',
  initialPassword = '',
  onSuccess,
}: UseAuthFormOptions) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
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

    if (!password) {
      isValid = false;
      newErrors.passwordError = 'Please enter your password';
    } else {
      newErrors.passwordError = '';
    }

    setErrorObj(newErrors);
    return isValid;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSuccess(email, password);
    } catch (error: any) {
      Toast(error?.message || 'An error occurred');
      if (error.message?.includes('email not verified')) {
        setEmailVerified(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    hapticFeedback('impactLight');
    try {
      const result = await sendVerificationEmail(email, password);
      if (result?.message) {
        Toast(result.message);
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
    onSubmit,
    handleResendEmail,
  };
};

interface UseRegisterFormOptions {
  onSuccess: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) => Promise<void>;
}

export const useRegisterForm = ({ onSuccess }: UseRegisterFormOptions) => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorObj, setErrorObj] = useState({
    firstNameError: '',
    lastNameError: '',
    emailError: '',
    phoneNumberError: '',
    passwordError: '',
    confirmPasswordError: '',
  });

  const validate = () => {
    hapticFeedback('impactLight');
    let isValid = true;
    const newErrors = { ...errorObj };

    if (!firstName) {
      isValid = false;
      newErrors.firstNameError = 'Please enter your first name';
    } else {
      newErrors.firstNameError = '';
    }

    if (!lastName) {
      isValid = false;
      newErrors.firstNameError = 'Please enter your last name';
    } else {
      newErrors.firstNameError = '';
    }

    if (!email) {
      isValid = false;
      newErrors.emailError = 'Please enter your email';
    } else if (!checkEmail(email)) {
      isValid = false;
      newErrors.emailError = 'Please enter a valid email';
    } else {
      newErrors.emailError = '';
    }

    if (!phoneNumber) {
      isValid = false;
      newErrors.phoneNumberError = 'Please enter your phone number';
    } else {
      newErrors.phoneNumberError = '';
    }

    if (!password) {
      isValid = false;
      newErrors.passwordError = 'Please enter your password';
    } else if (password.length < 6) {
      isValid = false;
      newErrors.passwordError = 'Password must be at least 6 characters';
    } else {
      newErrors.passwordError = '';
    }

    if (!confirmPassword) {
      isValid = false;
      newErrors.confirmPasswordError = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      isValid = false;
      newErrors.confirmPasswordError = 'Passwords do not match';
    } else {
      newErrors.confirmPasswordError = '';
    }

    setErrorObj(newErrors);
    return isValid;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSuccess(email, password, firstName, lastName, phoneNumber);
    } catch (error: any) {
      Toast(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return {
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
  };
};

export const useAuthAnimations = () => {
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const socialOpacity = useSharedValue(0);

  const startAnimations = () => {
    // Header animation
    headerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Form animation
    formOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
    formTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }),
    );

    // Social section animation
    socialOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
  };

  return {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    socialOpacity,
    startAnimations,
  };
};
