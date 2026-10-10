import {
  firebaseEmailSignIn,
  firebaseEmailSignUp,
} from '@/services/auth/firebase-auth';
import {
  createDefaultSupabaseUser,
  createUserInSupabase,
  getUserFromSupabase,
} from '@/services/auth/handle-user';
import {
  SupabaseAuthSession,
  supabaseSignInWithEmail,
  supabaseSignOut,
  supabaseSignUpWithEmail,
  SupabaseUser,
} from '@/services/auth/supabase-auth';
import { useAppDispatch } from '@/services/mmkv-redux/hooks';
import { loginSuccess } from '@/services/mmkv-redux/slices';
import { initializeDatabase } from '@/services/sqlite/vitals';
import { hapticFeedback } from '@/utils';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface AuthUserData {
  displayName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
  isMenstrualCycleTracked: boolean;
  isNewUser?: boolean;
}

export const getFirebaseAccessToken = async () => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return null;
    }

    const token = await user.getIdToken();

    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);

    return null;
  }
};

const useEmailAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const clearError = () => setError(null);

  const showErrorAlert = (title: string, message: string) => {
    hapticFeedback('notificationError');
    Alert.alert(title, message, [{ text: 'OK', onPress: clearError }]);
  };

  const getFirebaseAccessToken = async () => {
    const currentUser = auth().currentUser;

    if (currentUser) {
      const idToken = await currentUser.getIdToken(/* forceRefresh */ true);
      return idToken;
    } else {
      console.log('No user signed in');
      return null;
    }
  };

  const handleAuthSuccess = async (
    user: SupabaseUser | any,
    session: SupabaseAuthSession | { access_token: string },
    isNewUser: boolean = false,
  ) => {
    try {
      let userData: AuthUserData;
      let syncData: any;

      // Handle Supabase user
      if ('id' in user) {
        syncData = await getUserFromSupabase(user.id);
        if (!syncData) {
          throw new Error('User data not found in database');
        }

        userData = {
          displayName: syncData.display_name || '',
          email: user.email || '',
          emailVerified: true,
          phoneNumber: syncData.phone_number || null,
          photoURL: null,
          providerId: 'supabase',
          uid: user.id,
          isMenstrualCycleTracked: syncData.is_menstrual_cycle_tracked || false,
          isNewUser: syncData.is_new_user || isNewUser,
        };
      }
      // Handle Firebase user
      else {
        userData = {
          displayName: user.displayName || '',
          email: user.email || '',
          emailVerified: user.emailVerified || false,
          phoneNumber: user.phoneNumber || null,
          photoURL: user.photoURL || null,
          providerId: user.providerId || 'firebase',
          uid: user.uid,
          isMenstrualCycleTracked: false,
          isNewUser,
        };
      }

      dispatch(
        loginSuccess({
          access_token: session.access_token,
          sync: syncData?.is_sync_enabled || false,
          payment: syncData?.payment_status || false,
          isNewUser: userData.isNewUser || false,
          data: userData,
        }),
      );

      if (isNewUser || userData.isNewUser) {
        await initializeDatabase();
      }

      navigation.navigate(
        isNewUser || userData.isNewUser
          ? 'MainOnboardingQuiz'
          : 'NavigationTab',
      );

      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     {
      //       name:
      //         isNewUser || userData.isNewUser
      //           ? 'MainOnboardingQuiz'
      //           : 'NavigationTab',
      //     },
      //   ],
      // });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to process user data';
      showErrorAlert('Processing Error', message);
      throw error;
    }
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        clearError();
        hapticFeedback('effectClick');

        let authResult: { user: any; session: any } | null = null;

        // Try Firebase first
        try {
          const firebaseResult = await firebaseEmailSignIn(email, password);
          authResult = {
            user: firebaseResult.user,
            session: { access_token: await firebaseResult.user.getIdToken() },
          };
        } catch (firebaseError) {
          console.log('Firebase login failed, trying Supabase...');
          await auth().signOut();
        }

        // Fallback to Supabase if Firebase fails
        if (!authResult) {
          const supabaseResult = await supabaseSignInWithEmail({
            email,
            password,
          });
          authResult = {
            user: supabaseResult.user,
            session: supabaseResult.session,
          };
        }

        if (!authResult?.user) {
          throw new Error('Authentication failed - no user returned');
        }

        await handleAuthSuccess(
          authResult.user,
          authResult.session,
          authResult.user.isNewUser,
        );
      } catch (error) {
        await supabaseSignOut().catch(() => {});
        await auth()
          .signOut()
          .catch(() => {});

        let errorMessage = 'Login failed';
        if (error instanceof Error) {
          switch (error.message) {
            case 'auth/invalid-email':
            case 'Email not confirmed':
              errorMessage = 'Please enter a valid email address';
              break;
            case 'auth/user-disabled':
              errorMessage = 'This account has been disabled';
              break;
            case 'auth/user-not-found':
              errorMessage = 'No account found with this email';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Incorrect password';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many attempts. Try again later';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection';
              break;
            default:
              errorMessage = error.message.includes('Invalid login credentials')
                ? 'Invalid email or password'
                : error.message;
          }
        }
        setError(errorMessage);
        showErrorAlert('Login Error', errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      phoneNumber: string,
    ) => {
      try {
        setLoading(true);
        clearError();
        hapticFeedback('effectClick');

        let authResult: { user: any } | null = null;

        // Try Firebase first
        try {
          const firebaseResult = await firebaseEmailSignUp(email, password);
          authResult = { user: firebaseResult.user };

          // Update profile in Firebase
          if (authResult.user) {
            await auth().currentUser?.updateProfile({ displayName });
          }
        } catch (firebaseError) {
          console.log('Firebase signup failed, trying Supabase...');
          await auth().signOut();
        }

        // Fallback to Supabase if Firebase fails
        if (!authResult) {
          const supabaseResult = await supabaseSignUpWithEmail({
            email,
            password,
          });
          authResult = { user: supabaseResult.user };

          // Create user profile in Supabase
          try {
            const profile = createDefaultSupabaseUser(
              supabaseResult.user.id,
              displayName,
              phoneNumber,
            );
            await createUserInSupabase(profile);
          } catch (profileError) {
            console.error('Profile creation failed:', profileError);
            throw new Error('Failed to create user profile');
          }
        }

        if (!authResult?.user) {
          throw new Error('Registration failed - no user returned');
        }

        // For Supabase, we need to sign in after sign up to get the session
        if ('id' in authResult.user) {
          const { user, session } = await supabaseSignInWithEmail({
            email,
            password,
          });
          await handleAuthSuccess(user, session, true);
        } else {
          await handleAuthSuccess(
            authResult.user,
            { access_token: await authResult.user.getIdToken() },
            true,
          );
        }
      } catch (error) {
        await supabaseSignOut().catch(() => {});
        await auth()
          .signOut()
          .catch(() => {});

        let errorMessage = 'Signup failed';
        if (error instanceof Error) {
          switch (error.message) {
            case 'auth/email-already-in-use':
              errorMessage = 'This email is already registered';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Please enter a valid email address';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Account creation is currently disabled';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password should be at least 6 characters';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection';
              break;
            default:
              errorMessage = error.message.includes('User already registered')
                ? 'This email is already registered'
                : error.message;
          }
        }
        setError(errorMessage);
        showErrorAlert('Signup Error', errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [navigation],
  );

  return {
    loading,
    error,
    clearError,
    signIn,
    signUp,
    getFirebaseAccessToken,
  };
};

export default useEmailAuth;
