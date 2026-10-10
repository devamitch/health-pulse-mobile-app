import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from '../../firebaseConfig';
// import firestore from '@react-native-firebase/firestore';

const getErrorMessage = (errorCode: string): string => {
  console.log(errorCode, 'err');

  switch (errorCode) {
    case 'auth/user-not-found':
      return 'This email address is not registered. Please sign up first.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered.';
    case 'auth/invalid-email':
      return 'The email address is invalid. Please enter a valid email.';
    case 'auth/invalid-credential':
      return 'Invalid credential. Please enter a valid credential.';
    case 'auth/weak-password':
      return 'The password is too weak. Please choose a stronger password.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const registerWithFirebase = async (
  email: string,
  password: string,
  displayName: string,
  phone: string,
) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );

    await userCredential.user.updateProfile({
      displayName: displayName,
    });

    throw new Error('Firestore error. Unable to connect with firebase.');

    // await firestore().collection('users').doc(userCredential.user.uid).set({
    //   uuid: userCredential.user.uid,
    //   isSyncEnabled: false,
    //   paymentStatus: false,
    //   phoneNumber: phone,
    //   isNewUser: true,
    // });

    await userCredential.user.sendEmailVerification();

    return {
      success: true,
      user: userCredential.user,
      message:
        'We’ve sent a verification email to your inbox. Please open your email and click on the verification link to complete your registration.',
    };
  } catch (error: any) {
    const userFriendlyMessage = getErrorMessage(error.code);
    throw error;
  }
};

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  user?: FirebaseAuthTypes.User;
  is_new_user?: boolean;
  otherInfo?: Record<string, any>;
}> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );

    throw new Error('Firestore error. Unable to connect with firebase.');

    // const userData = await firestore()
    //     .collection('users')
    //     .doc(userCredential.user.uid)
    //     .get()

    if (userCredential.user.emailVerified) {
      return {
        success: true,
        user: userCredential.user,
        // otherInfo: userData.data(),
        message: 'Login successful!',
        // is_new_user: userData.data()?.isNewUser ?? true,
      };
    } else {
      await auth().signOut();
      return {
        success: false,
        message: 'Please verify your email before logging in.',
      };
    }
  } catch (error: any) {
    const userFriendlyMessage = getErrorMessage(error.code);
    throw error;
  }
};

export const checkEmailAndResendVerification = async (
  email: string,
  password: string,
) => {
  try {
    // Step 1: Check if the email is registered
    const signInMethods = await auth().fetchSignInMethodsForEmail(email);
    // Step 2: Temporarily sign in the user to check email verification status
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      // If email is not verified, resend the verification email
      await user.sendEmailVerification();
      await auth().signOut();
      return {
        success: true,
        message: 'Verification email resent. Please check your inbox.',
      };
    } else {
      // If email is already verified
      await auth().signOut();
      return {
        success: true,
        message: 'Email is already verified.',
      };
    }
  } catch (error: any) {
    // Handle errors (e.g., invalid credentials, network issues)
    console.error('Error during login check:', error.message);
    return {
      success: false,
      message: error.message || 'Something went wrong. Please try again.',
    };
  }
};

// Forgot password: Send password reset email
export const resetPasswordWithFirebase = async (email: string) => {
  try {
    console.log(`Attempting to send password reset email to: ${email}`);

    // Step 2: Send the password reset email
    await auth().sendPasswordResetEmail(email);
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error: any) {
    const userFriendlyMessage = getErrorMessage(error.code);
    return { success: false, message: userFriendlyMessage };
  }
};
