'use client';

import { APP_CONFIG } from '@/config/app-config';
import { Toast } from '@/utils/toast';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

export const useAppleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Apple Sign In is available
  const isAppleSignInAvailable = Platform.OS === 'ios' && appleAuth.isSupported;

  // Sign in with Apple
  const signInWithApple = useCallback(async () => {
    // Check if we should prompt based on our cooldown logic
    if (!APP_CONFIG.APPLE_SIGN_IN.shouldPrompt()) {
      Toast('Please try again later');
      return null;
    }

    if (!isAppleSignInAvailable) {
      setError('Apple Sign In is not available on this device');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Perform the Apple authentication
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthResponse.identityToken) {
        throw new Error('Apple Sign In failed - no identity token returned');
      }

      // Create a Firebase credential from the Apple response
      const credential = auth.AppleAuthProvider.credential(
        appleAuthResponse.identityToken,
        appleAuthResponse.nonce,
      );

      // Sign in to Firebase with the Apple credential
      const userCredential = await auth().signInWithCredential(credential);

      // Update user profile with name if available and not already set
      if (appleAuthResponse.fullName && userCredential.user) {
        const { fullName } = appleAuthResponse;
        const displayName = userCredential.user.displayName;

        if (!displayName && (fullName.givenName || fullName.familyName)) {
          const newDisplayName = `${fullName.givenName || ''} ${
            fullName.familyName || ''
          }`.trim();

          if (newDisplayName) {
            await userCredential.user.updateProfile({
              displayName: newDisplayName,
            });
          }
        }
      }

      return userCredential.user;
    } catch (err: any) {
      // Only show error if it's not a user cancellation
      if (err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'An error occurred during Apple Sign In');
        Toast('Sign in failed. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAppleSignInAvailable]);

  return {
    signInWithApple,
    isAppleSignInAvailable,
    isLoading,
    error,
  };
};
