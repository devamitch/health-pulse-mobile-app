import {
  firebaseEmailSignIn,
  firebaseEmailSignUp,
} from '@/services/auth/firebase-auth';
import { useAppDispatch } from '@/services/mmkv-redux/hooks';
import { loginSuccess } from '@/services/mmkv-redux/slices';
import { initializeDatabase } from '@/services/sqlite/vitals';
import { hapticFeedback } from '@/utils';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface FirebaseUserData {
  displayName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
  isMenstrualCycleTracked: boolean;
}

const useEmailAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const clearError = () => setError(null);

  const handleFirebaseLogin = async (user: any, isNewUser: boolean = false) => {
    try {
      const userData: FirebaseUserData = {
        displayName: user.displayName || '',
        email: user.email || '',
        emailVerified: user.emailVerified || false,
        phoneNumber: user.phoneNumber || null,
        photoURL: user.photoURL || null,
        providerId: user.providerId || 'firebase',
        uid: user.uid,
        isMenstrualCycleTracked: false, // You can set default values here
      };

      dispatch(
        loginSuccess({
          access_token: await user.getIdToken(),
          sync: false, // Default sync value
          payment: false, // Default payment status
          isNewUser: isNewUser,
          data: userData,
        }),
      );

      const navigationRoute = isNewUser
        ? { name: 'MainOnboardingQuiz' }
        : { name: 'NavigationTab' };
      // const navigationRoute = isNewUser
      //   ? { name: 'MainOnboardingQuiz',}
      //   : { name: 'NavigationTab' };

      if (isNewUser) {
        await initializeDatabase();
      }

      navigation.navigate(navigationRoute);
      // navigation.reset({
      //   index: 0,
      //   routes: [navigationRoute],
      // });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login processing failed';
      Alert.alert('Error', message);
    }
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        clearError();
        hapticFeedback('effectClick');

        const firebaseResult = await firebaseEmailSignIn(email, password);

        if (!firebaseResult.user) {
          throw new Error('Authentication failed - no user returned');
        }

        await handleFirebaseLogin(firebaseResult.user);
      } catch (error) {
        let errorMessage = 'Login failed';

        if (error instanceof Error) {
          // Handle specific Firebase error codes
          switch (error.message) {
            case 'auth/invalid-email':
              errorMessage = 'Invalid email address format';
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
              errorMessage = 'Network error. Check your connection';
              break;
            default:
              errorMessage = error.message;
          }
        }

        setError(errorMessage);
        hapticFeedback('notificationError');
        Alert.alert('Login Error', errorMessage);
        await auth().signOut();
      } finally {
        setLoading(false);
      }
    },
    [handleFirebaseLogin],
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

        const firebaseResult = await firebaseEmailSignUp(email, password);

        if (!firebaseResult.user) {
          throw new Error('Registration failed - no user returned');
        }

        // Update user profile with display name
        await auth().currentUser?.updateProfile({
          displayName: displayName,
        });

        // For phone number, you might need to implement phone verification separately
        // as Firebase requires verification for phone numbers

        await handleFirebaseLogin(firebaseResult.user, true);
      } catch (error) {
        let errorMessage = 'Signup failed';

        if (error instanceof Error) {
          // Handle specific Firebase error codes
          switch (error.message) {
            case 'auth/email-already-in-use':
              errorMessage = 'Email already in use';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email address format';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Account creation is currently disabled';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password is too weak';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Check your connection';
              break;
            default:
              errorMessage = error.message;
          }
        }

        setError(errorMessage);
        hapticFeedback('notificationError');
        Alert.alert('Signup Error', errorMessage);
        await auth().signOut();
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
  };
};

export default useEmailAuth;
