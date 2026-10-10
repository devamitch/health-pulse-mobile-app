import {
  firebaseAppleAuth,
  firebaseGoogleAuth,
} from '@/services/auth/firebase-auth';
import {
  getUserFromFirestore,
  getUserFromSupabase,
  handleSocialUserAuth,
} from '@/services/auth/handle-user';
import { appleAuthentication, googleAuth } from '@/services/auth/social-auth';
import { supabaseSignInWithIdToken } from '@/services/auth/supabase-auth';
import { useAppDispatch } from '@/services/mmkv-redux/hooks';
import { loginSuccess } from '@/services/mmkv-redux/slices';
import { hapticFeedback } from '@/utils';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const clearError = () => setError(null);
  const dispatch = useAppDispatch();

  const onGooglePress = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const socialData = await googleAuth();

      // Try Firebase first, fallback to Supabase
      let authResult = null;

      let access_token: string = socialData?.idToken;
      let displayName: string = socialData?.name || '';

      try {
        const firebaseResult = await firebaseGoogleAuth(access_token);
        authResult = firebaseResult;
        hapticFeedback('effectClick');
        socialData?.idToken;
        access_token =
          (await firebaseResult?.user?.getIdToken?.()) || socialData?.idToken;
        displayName = firebaseResult?.user?.displayName ?? displayName;
        try {
          const supabaseResult = await supabaseSignInWithIdToken({
            provider: 'apple',
            token: socialData.idToken,
          });
          access_token = supabaseResult?.session?.access_token;

          authResult = {
            user: firebaseResult?.user
              ? firebaseResult?.user
              : { uid: supabaseResult.user.id },
            additionalUserInfo: firebaseResult?.additionalUserInfo ?? {
              isNewUser: true,
            },
          };
        } catch (e) {
          authResult = firebaseResult;
          const message = e instanceof Error ? e.message : '';
          Alert.alert(message);
        }
      } catch {
        const supabaseResult = await supabaseSignInWithIdToken({
          provider: 'google',
          token: socialData.idToken,
        });
        access_token = supabaseResult?.session?.access_token;

        authResult = {
          user: { uid: supabaseResult.user.id },
          additionalUserInfo: { isNewUser: true },
        };
      }

      let data = {
        displayName,
        email: authResult.user.email,
        emailVerified: authResult.user.emailVerified,
        phoneNumber: authResult.user.phoneNumber,
        photoURL: authResult.user.photoURL,
        providerId: authResult.user.providerId,
        uid: authResult.user.uid,
        isMenstrualCycleTracked: false,
      };
      try {
        const user = await handleSocialUserAuth(authResult);
        data = {
          ...data,
          ...user,
        };
      } catch {}

      dispatch(
        loginSuccess({
          access_token,
          data,
          sync: false,
          payment: false,
          isNewUser: data.isNew,
        }),
      );
      hapticFeedback('notificationSuccess');

      // navigation.navigate('NameScreen');
      navigation.navigate('MainOnboardingQuiz');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google sign-in failed';
      setError(message);
      hapticFeedback('notificationError');
      Alert.alert('Authentication Error', message, [
        {
          text: 'OK',
          onPress: clearError,
          style: 'destructive',
        },
      ]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const onApplePress = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const socialData = await appleAuthentication();
      if (!socialData?.idToken) {
        throw new Error('Apple authentication failed');
      }

      hapticFeedback('effectClick');

      // Try Firebase first, fallback to Supabase
      let authResult = null;
      let access_token: string = '';
      let displayName: string = socialData?.name || '';

      try {
        const firebaseResult = await firebaseAppleAuth(
          socialData.idToken,
          socialData.nonce,
        );
        access_token = await firebaseResult?.user?.getIdToken?.();
        displayName = firebaseResult?.user?.displayName ?? displayName;

        try {
          const supabaseResult = await supabaseSignInWithIdToken({
            provider: 'apple',
            token: socialData.idToken,
            nonce: socialData.nonce,
          });
          access_token = supabaseResult?.session?.access_token;

          authResult = {
            user: firebaseResult?.user
              ? firebaseResult?.user
              : { uid: supabaseResult.user.id },
            additionalUserInfo: firebaseResult?.additionalUserInfo ?? {
              isNewUser: true,
            },
          };
        } catch (e) {
          authResult = firebaseResult;
          const message = e instanceof Error ? e.message : '';
          Alert.alert(message);
        }
      } catch {
        const supabaseResult = await supabaseSignInWithIdToken({
          provider: 'apple',
          token: socialData.idToken,
          nonce: socialData.nonce,
        });
        access_token = supabaseResult?.session?.access_token;

        authResult = {
          user: { uid: supabaseResult.user.id },
          additionalUserInfo: { isNewUser: false },
        };
      }

      const storedUserData =
        (await getUserFromSupabase(authResult.user.uid)) ||
        (await getUserFromFirestore(authResult.user.uid));

      const finalDisplayName = displayName || storedUserData?.displayName || '';

      const user = await handleSocialUserAuth(authResult);
      const data = {
        ...user,
        displayName,
        email: authResult.user.email,
        emailVerified: authResult.user.emailVerified,
        phoneNumber: authResult.user.phoneNumber,
        photoURL: authResult.user.photoURL,
        providerId: authResult.user.providerId,
        uid: authResult.user.uid,
        isMenstrualCycleTracked: false,
      };
      dispatch(
        loginSuccess({
          access_token,
          data,
          sync: false,
          payment: false,
          isNewUser: data.isNew,
        }),
      );
      hapticFeedback('notificationSuccess');

      navigation.navigate('NameScreen');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Apple sign-in failed';
      setError(message);
      Alert.alert('Authentication Error', message, [
        {
          text: 'OK',
          onPress: clearError,
          style: 'destructive',
        },
        // {
        //   text: 'Retry',
        //   onPress: onApplePress,
        //   style: 'default',
        // },
      ]);

      hapticFeedback('notificationError');

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    onGooglePress,
    onApplePress,
    clearError,
  };
};

export default useSocialAuth;
