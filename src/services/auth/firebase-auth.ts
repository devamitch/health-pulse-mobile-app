import auth from '@react-native-firebase/auth';
// src/services/auth/firebase-auth.ts --- IGNORE ---
export const firebaseAppleAuth = async (token: string, nonce?: string) => {
  try {
    if (!token) {
      throw new Error('Apple ID token is required');
    }

    const provider = auth?.AppleAuthProvider;

    if (!provider) {
      throw new Error('Failed to create Apple provider instance');
    }

    const cred = provider?.credential;

    if (!cred) {
      throw new Error(
        'Failed to create Apple provider credential not a function',
      );
    }

    const credential = cred?.(token, nonce);

    if (!credential) {
      throw new Error('Failed to create Apple credential');
    }

    const result = await auth()?.signInWithCredential?.(credential);

    if (!result?.user) {
      throw new Error('Apple authentication failed - no user returned');
    }

    return result;
  } catch (error) {
    let errorMessage = 'Apple Sign-In Failed';

    if (error instanceof Error) {
      switch (error?.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid Apple credential';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Apple Sign-In is not enabled in Firebase';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Account already exists with different method';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }

    // Alert.alert('Authentication Error', errorMessage);
    throw error;
  }
};

export const firebaseGoogleAuth = async (
  idToken: string,
  accessToken?: string,
) => {
  try {
    if (!idToken) {
      throw new Error('Google ID token is required');
    }

    const provider = auth?.GoogleAuthProvider;

    if (!provider) {
      throw new Error('Failed to create Google provider instance');
    }
    const cred = provider?.credential;

    if (!cred) {
      throw new Error(
        'Failed to create Apple provider credential not a function',
      );
    }

    const credential = cred?.(idToken, accessToken);

    if (!credential) {
      throw new Error('Failed to create Google credential');
    }

    const result = await auth()?.signInWithCredential?.(credential);

    if (!result?.user) {
      throw new Error('Google authentication failed - no user returned');
    }

    return result;
  } catch (error) {
    let errorMessage = 'Google Sign-In Failed';

    if (error instanceof Error) {
      switch (error?.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid Google credential';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google Sign-In is not enabled in Firebase';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error during authentication';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }

    // Alert.alert('Authentication Error', errorMessage);
    throw error;
  }
};

export const firebaseEmailSignIn = async (email: string, password: string) => {
  const result = await auth().signInWithEmailAndPassword(email, password);
  if (!result.user) throw new Error('Email sign-in failed');
  return result;
};

export const firebaseEmailSignUp = async (email: string, password: string) => {
  const result = await auth().createUserWithEmailAndPassword(email, password);
  if (!result.user) throw new Error('Email sign-up failed');
  return result;
};

export const firebaseSignOut = async () => {
  await auth().signOut();
};

export const firebaseSendPasswordReset = async (email: string) => {
  await auth().sendPasswordResetEmail(email);
};

export const firebaseUpdatePassword = async (newPassword: string) => {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user');
  await user.updatePassword(newPassword);
};

export const firebaseDeleteAccount = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user');
  await user.delete();
};

export const firebaseGetCurrentUser = () => {
  return auth().currentUser;
};

export const firebaseOnAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};

export const deleteAccountWithPassword = async (
  email?: string,
  password?: string
): Promise<void> => {
  try {
    const user = auth().currentUser;

    if (!user) {
      throw new Error("No user is logged in.");
    }

    if (email && password) {
      const credential = auth.EmailAuthProvider.credential(email, password);
      await user.reauthenticateWithCredential(credential);
    }

    await user.delete();
  } catch (error: any) {
    throw error; // Let the caller handle error messages
  }
};
