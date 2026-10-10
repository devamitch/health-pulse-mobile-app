import { logButtonTap } from '@/services/analyticsService';
import { updateCachedImage } from '@/services/image-cache';
import {
  AppleAuthProps,
  AuthResponseType,
  ResetPasswordProps,
  SignInProps,
  SignUpProps,
  VerifyOTPProps,
} from '@/services/mmkv-redux/apis';
import {
  useAppleSignInMutation,
  useDeleteAccountMutation,
  useForgotPasswordMutation,
  useGoogleSignInMutation,
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useSendAcccountDeleteOTPMutation,
  useSendForgotPasswordOTPMutation,
  useSendNewUserOTPMutation,
  useSignupMutation,
  useVerifyAccountDeleteOTPMutation,
  useVerifyForgotPasswordOTPMutation,
  useVerifyNewUserOTPMutation,
} from '@/services/mmkv-redux/apis/auth';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  loginSuccess,
  resetAllApp,
  resetAllUser,
  UserData,
} from '@/services/mmkv-redux/slices';
import { deleteAllDatabase } from '@/services/sqlite/queries';
import { initializeDatabase } from '@/services/sqlite/vitals';
import { Toast } from '@/utils/toast';
import notifee from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  AndroidResponseType,
  AndroidScope,
  AppleRequestOperation,
  AppleRequestScope,
  configureAppleSignInAndroid,
  configureAppleSignInIOS,
  configureGoogleSignIn,
  signInWithAppleAndroid,
  signInWithAppleIOS,
  signInWithGoogle,
  signOutGoogle,
  SocialAuthResult,
} from 'rn-social-auth';
import useNetInfo from './use_net_info';

const useAuthentication = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isInternetAvailable = useNetInfo();

  const { userData } = useAppSelector(state => state.user);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn({
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      webClientId: `806922605148-lvhs3rf1aso3ar2eim8f9nptcg3ukmiu.apps.googleusercontent.com`,
      offlineAccess: true,
    });

    if (Platform.OS === 'android')
      configureAppleSignInAndroid({
        clientId: 'com.devamitch.HealthPulse.auth',
        redirectUri:
          'https://iam-api.AuraCoremedical.com/auth/oauth/apple-redirect/HealthPulse',
        scope: AndroidScope.ALL,
        responseType: AndroidResponseType.ALL,
      });

    if (Platform.OS === 'ios')
      configureAppleSignInIOS({
        requestedOperation: AppleRequestOperation.LOGIN,
        requestedScopes: [AppleRequestScope.EMAIL, AppleRequestScope.FULL_NAME],
      });
  }, []);

  // API Mutations
  const mutations = {
    signup: useSignupMutation(),
    login: useLoginMutation(),
    google: useGoogleSignInMutation(),
    apple: useAppleSignInMutation(),
    verifyNewUserOTP: useVerifyNewUserOTPMutation(),
    verifyForgotOTP: useVerifyForgotPasswordOTPMutation(),
    forgotPassword: useForgotPasswordMutation(),
    resetPassword: useResetPasswordMutation(),
    logout: useLogoutMutation(),
    deleteAccount: useDeleteAccountMutation(),
    sendNewUserOTP: useSendNewUserOTPMutation(),
    sendForgotOTP: useSendForgotPasswordOTPMutation(),
    sendDeleteOTP: useSendAcccountDeleteOTPMutation(),
    verifyDeleteOTP: useVerifyAccountDeleteOTPMutation(),
  };

  const getErrorMessage = (error: any) => {
    try {
      return error?.data?.message ?? error?.message ?? 'Unknown Error';
    } catch (error) {
      return 'Unknown Error';
    }
  };

  /**
   * Generic request handler for all API calls
   */
  const handleRequest = async <T>(
    request: () => Promise<T>,
    onSuccess?: (res: T) => void,
  ): Promise<T | undefined> => {
    try {
      setLoading(true);
      const response = await request();
      onSuccess?.(response);
      return response;
    } catch (error: any) {
      console.error(error);
      try {
        Toast.error(getErrorMessage(error));
      } catch (error) {
        Alert.alert('Error', 'Unknown Error');
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  /** SUCCESS Login + Navigate */
  const handleSuccess = async (
    userInfo: AuthResponseType,
    provider: string,
  ) => {
    const userData: UserData = {
      displayName: userInfo.firstName,
      email: userInfo.email,
      emailVerified: true,
      phoneNumber: userInfo.mobileNumber,
      photoURL: userInfo.profilePhoto
        ? await updateCachedImage(userInfo.profilePhoto, 'profilePhoto')
        : null,
      providerId: provider,
      uid: userInfo.id,
      isMenstrualCycleTracked: false,
      lastName: userInfo.lastName,
    };

    dispatch(
      loginSuccess({
        access_token: userInfo.token,
        data: userData,
        sync: false,
        payment: false,
        isNewUser: true,
        refreshToken: userInfo.refreshToken,
      }),
    );

    try {
      await initializeDatabase();
    } catch (error: any) {
      // Alert.alert('Error', JSON.stringify(error));
    }

    navigation.navigate('NameScreen');

    // navigation.reset({
    //   index: 0,
    //   routes: [
    //     {
    //       // name: 'MainOnboardingQuiz',
    //       name: 'NameScreen',
    //     },
    //   ],
    // });
  };

  /** Logout Cleanup */
  const onLogout = async () => {
    await logButtonTap('Logout');
    await notifee.cancelAllNotifications();
    await notifee.cancelTriggerNotifications();
    await deleteAllDatabase();
    dispatch(resetAllApp());
    dispatch(resetAllUser());
    await signOutGoogle();

    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'WelcomeScreen' }],
    // });

    navigation.navigate('WelcomeScreen');
  };

  /** OTP Resend Helper */
  const resendOtpHandler = (mutation: any, payload?: any) =>
    handleRequest(() => mutation(payload).unwrap());

  // ---------- AUTH ACTIONS ---------- //

  const EmailSignUp = (data: SignUpProps) =>
    handleRequest(() => mutations.signup[0](data).unwrap());

  const EmailSignIn = (data: SignInProps) =>
    handleRequest(
      () => mutations.login[0](data).unwrap(),
      res => handleSuccess(res, 'password'),
    );

  const verifyNewUser = (data: VerifyOTPProps) =>
    handleRequest(
      () => mutations.verifyNewUserOTP[0](data).unwrap(),
      res => handleSuccess(res, 'password'),
    );

  const forgotPassword = (email: string) =>
    handleRequest(() => mutations.forgotPassword[0]({ email }).unwrap());

  const verifyForgotPassword = (data: VerifyOTPProps) =>
    handleRequest(async () => {
      const res = await mutations.verifyForgotOTP[0](data).unwrap();
      if (res.status === 'otp_verified') {
        navigation.navigate('PasswordResetScreen', {
          email: data.email,
          resetToken: res.resetToken,
        });
      } else Alert.alert(res.message);
      return res;
    });

  const resetPassword = (data: ResetPasswordProps) =>
    handleRequest(async () => {
      const res = await mutations.resetPassword[0](data).unwrap();
      if (res.status === 'password_reset_success') {
        navigation.navigate('LoginScreen');
      } else Alert.alert(res.message);
      return res;
    });

  const GoogleSignIn = () =>
    handleRequest(async () => {
      const result = await signInWithGoogle();

      const res = await mutations.google[0]({
        idToken: result.idToken,
      }).unwrap();

      handleSuccess(res, 'google');
      return res;
    });

  const AppleSignIn = () =>
    handleRequest(async () => {
      if (!isInternetAvailable) throw new Error('Internet Not Available');

      let result: SocialAuthResult;

      if (Platform.OS === 'ios') result = await signInWithAppleIOS();
      else result = await signInWithAppleAndroid();

      if (!result.idToken) {
        throw new Error('No identityToken from Apple.');
      }

      let params: AppleAuthProps = {
        idToken: result.idToken,
      };

      if (result.firstName) params.firstName = result.firstName;
      if (result.lastName) params.lastName = result.lastName;
      if (result.email) params.email = result.email;

      const res = await mutations.apple[0](params).unwrap();

      handleSuccess(res, 'apple');
      return res;
    });

  const Logout = () => handleRequest(() => mutations.logout[0]().unwrap());

  const DeleteAccount = () =>
    handleRequest(() => mutations.deleteAccount[0]().unwrap());

  const DeleteAppleAccount = () =>
    handleRequest(async () => {
      if (userData?.providerId !== 'apple') throw new Error('No apple login');

      if (!isInternetAvailable) throw new Error('Internet Not Available');

      let result: SocialAuthResult;

      if (Platform.OS === 'ios') result = await signInWithAppleIOS();
      else result = await signInWithAppleAndroid();

      if (!result.idToken) throw new Error('No identityToken from Apple.');

      const deleteAccountParams = { appleIdToken: result.idToken };

      return await mutations.deleteAccount[0](deleteAccountParams).unwrap();
    });

  /** Verified Delete → Logout */
  const VerifyDeleteAccountOTP = (data: VerifyOTPProps) =>
    handleRequest(async () => {
      const res = await mutations.verifyDeleteOTP[0](data).unwrap();

      if (res.status === 'otp_verified') {
        await DeleteAccount();
        await onLogout();
      }
      return res;
    });

  // ---------- OTP RESENDS ---------- //

  const ResendRegUserOTP = (email: string) =>
    resendOtpHandler(mutations.sendNewUserOTP[0], { email });

  const ResendForgotPasswordOTP = (email: string) =>
    resendOtpHandler(mutations.sendForgotOTP[0], { email });

  const ResendDeleteAccountOTP = () =>
    resendOtpHandler(mutations.sendDeleteOTP[0]);

  return {
    EmailSignUp,
    EmailSignIn,
    GoogleSignIn,
    AppleSignIn,
    verifyNewUser,
    verifyForgotPassword,
    forgotPassword,
    resetPassword,
    Logout,
    DeleteAccount,
    DeleteAppleAccount,
    ResendRegUserOTP,
    ResendForgotPasswordOTP,
    ResendDeleteAccountOTP,
    VerifyDeleteAccountOTP,

    // expose mutation states (optional)
    loading,
    ...Object.fromEntries(
      Object.entries(mutations).map(([k, v]) => [`${k}Result`, v[1]]),
    ),
  };
};

export default useAuthentication;
