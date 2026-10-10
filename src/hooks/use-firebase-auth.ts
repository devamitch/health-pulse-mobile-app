import { AppStackParamList } from '@/navigation/main_route';
import { useAppDispatch } from '@/services/mmkv-redux/hooks';
import {
  loginSuccess,
  resetAllApp,
  resetAllUser,
  setAccessToken,
  UserData,
} from '@/services/mmkv-redux/slices';
import { initializeDatabase } from '@/services/sqlite/vitals';
import { Toast } from '@/utils/toast';
import auth, { FirebaseAuthTypes, getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface EmailSignUpParams {
  email: string;
  password: string;
  phone?: string;
  displayName?: string;
  lastName?: string;
}

export interface EmailSignInParams {
  email: string;
  password: string;
}

export interface AuthState {
  user: UserData | null;
  loading: boolean;
  isInitializing: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: UserData;
  error?: string;
  isNewUser?: boolean;
  provider?: 'google' | 'apple' | 'firebase';
  accessToken?: string;
}

export interface SocialAuthConfig {
  googleWebClientId?: string;
  googleOfflineAccess?: boolean;
  googleHostedDomain?: string;
  googleForceCodeForRefreshToken?: boolean;
  appleRequestedScopes?: ('email' | 'fullName')[];
  onAuthStateChanged?: (
    user: UserData | null,
    accessToken?: string,
    isNewUser?: boolean,
  ) => void;
  onSuccess?: (result: AuthResult) => void;
  onError?: (error: string, provider?: 'google' | 'apple' | 'firebase') => void;
  onSignOut?: () => void;
  enableDebugLogs?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  provider?: 'google' | 'apple' | 'firebase' | undefined;
  originalError?: any;
}

class AuthErrorHandler {
  private static getErrorMessage(error: any, provider?: string): string {
    if (typeof error === 'string') return error;

    const errorMessage =
      error?.message || error?.toString() || 'Unknown error occurred';

    if (error?.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/user-disabled':
          return 'This account has been disabled.';
        case 'auth/account-exists-with-different-credential':
          return 'An account already exists with this email using a different sign-in method.';
        case 'auth/credential-already-in-use':
          return 'This credential is already associated with a different account.';
        case 'auth/operation-not-allowed':
          return 'This sign-in method is not enabled.';
        case 'auth/invalid-credential':
          return 'The credential is invalid or has expired.';

        case 'auth/user-not-found':
          return 'No account found with this email.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
          return 'The email address is not valid.';
        case 'auth/email-already-in-use':
          return 'An account already exists with this email.';
        case 'auth/weak-password':
          return 'The password is too weak. Please use a stronger password.';
        case 'auth/missing-email':
          return 'Please enter an email address.';

        default:
          return errorMessage;
      }
    }

    if (provider === 'google') {
      if (errorMessage.includes('SIGN_IN_CANCELLED')) {
        return 'Google sign-in was cancelled.';
      }
      if (errorMessage.includes('IN_PROGRESS')) {
        return 'Google sign-in is already in progress.';
      }
      if (errorMessage.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
        return 'Google Play Services is not available on this device.';
      }
    }

    if (provider === 'apple') {
      if (errorMessage.includes('1001')) {
        return 'Apple sign-in was cancelled.';
      }
      if (errorMessage.includes('1000')) {
        return 'Apple sign-in failed. Please try again.';
      }
    }

    return errorMessage;
  }

  static createError(
    error: any,
    provider?: 'google' | 'apple' | 'firebase',
  ): AuthError {
    return {
      code: error?.code || 'unknown',
      message: this.getErrorMessage(error, provider),
      provider,
      originalError: error,
    };
  }
}

const mapFirebaseUser = (
  firebaseUser: FirebaseAuthTypes.User,
  isMenstrualCycleTracked?: boolean,
): UserData => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  phoneNumber: firebaseUser.phoneNumber,
  emailVerified: firebaseUser.emailVerified,
  providerId: firebaseUser.providerData[0]?.providerId || 'firebase',
  isMenstrualCycleTracked: isMenstrualCycleTracked ?? false,
});

const mapToStoreUser = (user: UserData) => ({
  displayName: user.displayName,
  email: user.email,
  emailVerified: user.emailVerified,
  phoneNumber: user.phoneNumber,
  photoURL: user.photoURL,
  providerId: user.providerId,
  uid: user.uid,
});

const isUserEqual = (user1: any, user2: any): boolean => {
  if (!user1 && !user2) return true;
  if (!user1 || !user2) return false;

  return (
    user1.uid === user2.uid &&
    user1.email === user2.email &&
    user1.displayName === user2.displayName &&
    user1.photoURL === user2.photoURL &&
    user1.phoneNumber === user2.phoneNumber &&
    user1.emailVerified === user2.emailVerified &&
    user1.providerId === user2.providerId
  );
};

export const useFirebaseAuth = (config: SocialAuthConfig = {}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    isInitializing: true,
    error: null,
    isAuthenticated: false,
  });

  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const lastUserRef = useRef<any>(null);
  const lastAccessTokenRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  const authInstance = getAuth();

  const { onAuthStateChanged, onSuccess, onError, onSignOut } = config;

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: any, provider?: 'google' | 'apple' | 'firebase') => {
      const authError = AuthErrorHandler.createError(error, provider);

      updateAuthState({
        error: authError.message,
        loading: false,
      });

      Toast(authError.message);

      onError?.(authError.message, provider);
      return authError;
    },
    [updateAuthState, onError],
  );

  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  const handleAuthSuccess = useCallback(
    async (
      userCredential: FirebaseAuthTypes.UserCredential,
      provider: 'google' | 'apple' | 'firebase',
    ): Promise<AuthResult> => {
      try {
        const user = mapFirebaseUser(userCredential.user);

        const userDoc = await firestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .get();

        if (!userDoc.exists()) {
          await firestore()
            .collection('users')
            .doc(userCredential.user.uid)
            .set({
              uid: userCredential.user.uid,
              isSyncEnabled: false,
              paymentStatus: false,
              isNewUser: true,
            });
        }

        const isNewUser =
          (userDoc.exists() && userDoc.data()?.isNewUser) ?? true;

        const accessToken = await userCredential.user.getIdToken();
        const storeUserData = mapToStoreUser(user);

        if (
          !isUserEqual(lastUserRef.current, storeUserData) ||
          lastAccessTokenRef.current !== accessToken
        ) {
          dispatch(
            loginSuccess({
              access_token: accessToken,
              data: storeUserData,
              payment: !!userDoc.data()?.paymentStatus,
              isNewUser: isNewUser,
              sync: !!userDoc.data()?.isSyncEnabled,
            }),
          );
          lastUserRef.current = storeUserData;
        }

        const result: AuthResult = {
          success: true,
          user,
          isNewUser,
          provider,
          accessToken,
        };

        onSuccess?.(result);
        Toast('Login Successfull');
        if (isNewUser) {
          await initializeDatabase();
          navigation.navigate('NameScreen');

          // navigation.reset({
          //   index: 0,
          //   // routes: [{ name: 'MainOnboardingQuiz' }],
          //   routes: [{ name: 'NameScreen' }],
          // });
        } else {
          navigation.navigate('NameScreen');

          navigation.reset({
            index: 0,
            routes: [{ name: 'NavigationTab' }],
          });
        }
        return result;
      } catch (error) {
        const authError = handleError(error, provider);
        return { success: false, error: authError.message, provider };
      }
    },
    [updateAuthState, onSuccess, handleError, loginSuccess],
  );

  const signUpWithEmail = useCallback(
    async ({
      email,
      password,
      displayName,
      phone,
      lastName,
    }: EmailSignUpParams) => {
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );

        await userCredential.user.updateProfile({
          displayName: displayName ?? email,
        });

        await firestore().collection('users').doc(userCredential.user.uid).set({
          uuid: userCredential.user.uid,
          isSyncEnabled: false,
          paymentStatus: false,
          phoneNumber: phone,
          isNewUser: true,
          firstName: displayName,
          lastName,
        });

        await userCredential.user.sendEmailVerification();

        Toast(
          'We’ve sent a verification email to your inbox. Please open your email and click on the verification link to complete your registration.',
        );

        return {
          success: true,
          user: userCredential.user,
          message:
            'We’ve sent a verification email to your inbox. Please open your email and click on the verification link to complete your registration.',
        };
      } catch (error: any) {
        const authError = handleError(error.code, 'firebase');
        return {
          success: false,
          error: authError.message,
          provider: 'firebase',
        };
      } finally {
        try {
          await auth().signOut();
        } catch {}
      }
    },
    [],
  );

  const signInWithEmail = useCallback(
    async ({ email, password }: EmailSignInParams) => {
      console.log('signin pressed');

      try {
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );

        if (userCredential.user.emailVerified) {
          handleAuthSuccess(userCredential, 'firebase');
          return {
            success: true,
            message: 'Login successfull',
            provider: 'firebase',
          };
        } else {
          await auth().signOut();
          return {
            success: false,
            message: 'Please verify your email before logging in.',
            provider: 'firebase',
          };
        }
      } catch (error: any) {
        const authError = handleError(error, 'firebase');
        return {
          success: false,
          error: authError.message,
          provider: 'firebase',
        };
      }
    },
    [updateAuthState, handleAuthSuccess, handleError, authInstance],
  );

  const signOut = useCallback(async (): Promise<AuthResult> => {
    updateAuthState({ loading: true, error: null });

    try {
      await authInstance.signOut();

      // Clear refs
      lastUserRef.current = null;
      lastAccessTokenRef.current = null;

      dispatch(resetAllUser());
      dispatch(resetAllApp());

      onSignOut?.();

      return { success: true };
    } catch (error) {
      const authError = handleError(error);
      return {
        success: false,
        error: authError.message,
      };
    }
  }, [
    updateAuthState,
    onSignOut,
    handleError,
    authInstance,
    resetAllApp,
    resetAllUser,
  ]);

  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged(async firebaseUser => {
      try {
        if (firebaseUser) {
          const user = mapFirebaseUser(firebaseUser);
          const accessToken = await firebaseUser.getIdToken();
          const storeUserData = mapToStoreUser(user);

          const userDoc = await firestore()
            .collection('users')
            .doc(storeUserData.uid)
            .get();

          if (!userDoc.exists()) {
            await firestore().collection('users').doc(storeUserData.uid).set({
              uid: storeUserData.uid,
              isSyncEnabled: false,
              paymentStatus: false,
              isNewUser: true,
            });
          }

          const isNewUser =
            (userDoc.exists() && userDoc.data()?.isNewUser) ?? true;

          const shouldUpdateUser =
            !isInitializedRef.current ||
            !isUserEqual(lastUserRef.current, storeUserData);
          const shouldUpdateToken =
            !isInitializedRef.current ||
            lastAccessTokenRef.current !== accessToken;

          if (
            !isUserEqual(lastUserRef.current, storeUserData) ||
            lastAccessTokenRef.current !== accessToken
          ) {
            dispatch(
              loginSuccess({
                access_token: accessToken,
                data: storeUserData,
                payment: !!userDoc.data()?.paymentStatus,
                isNewUser: isNewUser,
                sync: !!userDoc.data()?.isSyncEnabled,
              }),
            );
            lastUserRef.current = storeUserData;
          }

          if (
            shouldUpdateUser ||
            shouldUpdateToken ||
            !isInitializedRef.current
          ) {
            onAuthStateChanged?.(user, accessToken, isNewUser);
          }
        } else {
          if (lastUserRef.current !== null) {
            lastUserRef.current = null;
            lastAccessTokenRef.current = null;

            updateAuthState({
              user: null,
              isAuthenticated: false,
              isInitializing: false,
              error: null,
            });

            onAuthStateChanged?.(null);
          } else if (!isInitializedRef.current) {
            updateAuthState({
              user: null,
              isAuthenticated: false,
              isInitializing: false,
              error: null,
            });
          }
        }

        isInitializedRef.current = true;
      } catch (error) {
        updateAuthState({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
          error: 'Failed to get user token',
        });
        isInitializedRef.current = true;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [updateAuthState, onAuthStateChanged, authInstance, loginSuccess]);

  const getCurrentUser = useCallback(async () => {
    return authInstance.currentUser;
  }, [authInstance]);

  const getIdToken = useCallback(
    async (forceRefresh = false) => {
      const currentUser = authInstance.currentUser;
      if (!currentUser) return null;

      try {
        const token = await currentUser.getIdToken(forceRefresh);

        if (token && lastAccessTokenRef.current !== token) {
          dispatch(setAccessToken(token));
          lastAccessTokenRef.current = token;
        }

        return token;
      } catch (error) {
        return null;
      }
    },
    [setAccessToken, authInstance],
  );

  const refreshUser = useCallback(async () => {
    const currentUser = authInstance.currentUser;
    if (!currentUser) return;

    try {
      await currentUser.reload();
      const user = mapFirebaseUser(currentUser);
      const accessToken = await currentUser.getIdToken(true);
      const storeUserData = mapToStoreUser(user);

      const userDoc = await firestore()
        .collection('users')
        .doc(storeUserData.uid)
        .get();

      if (!userDoc.exists()) {
        await firestore().collection('users').doc(storeUserData.uid).set({
          uid: storeUserData.uid,
          isSyncEnabled: false,
          paymentStatus: false,
          isNewUser: true,
        });
      }

      const isNewUser = (userDoc.exists() && userDoc.data()?.isNewUser) ?? true;

      if (
        !isUserEqual(lastUserRef.current, storeUserData) ||
        lastAccessTokenRef.current !== accessToken
      ) {
        dispatch(
          loginSuccess({
            access_token: accessToken,
            data: storeUserData,
            payment: !!userDoc.data()?.paymentStatus,
            isNewUser: isNewUser,
            sync: !!userDoc.data()?.isSyncEnabled,
          }),
        );
        lastUserRef.current = storeUserData;
      }

      updateAuthState({ user });
    } catch (error) {}
  }, [updateAuthState, authInstance, loginSuccess]);

  return {
    ...authState,
    signOut,
    clearError,
    getCurrentUser,
    getIdToken,
    refreshUser,
    signInWithEmail,
    signUpWithEmail,
  };
};
