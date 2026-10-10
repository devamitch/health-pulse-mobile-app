import { supabase } from '@/config/supabase-config';
import { hapticFeedback } from '@/utils/haptics';
import { Toast } from '@/utils/toast';
import { logEvent } from '@react-native-firebase/analytics';
import { useState } from 'react';
import { auth } from '../../../../firebaseConfig';

type VerificationResult = {
  success: boolean;
  message: string;
  provider?: 'firebase' | 'supabase';
};

export const useVerificationEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tryFirebaseVerification = async (
    email: string,
    password: string,
  ): Promise<VerificationResult> => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        await user.sendEmailVerification();
        await auth().signOut();
        return {
          success: true,
          message: 'Firebase verification email sent',
          provider: 'firebase',
        };
      }

      await auth().signOut();
      return {
        success: true,
        message: 'Firebase email already verified',
        provider: 'firebase',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Firebase verification failed',
      };
    }
  };

  const trySupabaseVerification = async (
    email: string,
  ): Promise<VerificationResult> => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email_confirmed_at')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error(userError?.message || 'Supabase user not found');
      }

      if (!userData.email_confirmed_at) {
        await supabase.auth.resend({
          type: 'signup',
          email,
        });
        return {
          success: true,
          message: 'Supabase verification email sent',
          provider: 'supabase',
        };
      }

      return {
        success: true,
        message: 'Supabase email already verified',
        provider: 'supabase',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Supabase verification failed',
      };
    }
  };

  const sendVerificationEmail = async (
    email: string,
    password?: string,
  ): Promise<VerificationResult> => {
    hapticFeedback('impactLight');
    setIsLoading(true);
    setError(null);
    logEvent('verification_email_attempt', { email });

    try {
      // Try both providers in parallel
      const results = await Promise.allSettled([
        password
          ? tryFirebaseVerification(email, password)
          : Promise.resolve({
              success: false,
              message: 'Skipped Firebase (no password provided)',
            }),
        trySupabaseVerification(email),
      ]);

      const [firebaseResult, supabaseResult] = results;
      const successfulResults: VerificationResult[] = [];

      if (
        firebaseResult.status === 'fulfilled' &&
        firebaseResult.value.success
      ) {
        successfulResults.push(firebaseResult.value);
      }

      if (
        supabaseResult.status === 'fulfilled' &&
        supabaseResult.value.success
      ) {
        successfulResults.push(supabaseResult.value);
      }

      if (successfulResults.length > 0) {
        const message = successfulResults.map(r => r.message).join(' | ');
        const result = {
          success: true,
          message,
          provider: successfulResults?.[0]?.provider,
        };
        Toast(message);
        return result;
      }

      const errorMessage =
        [
          firebaseResult.status === 'rejected' ? 'Firebase failed' : '',
          supabaseResult.status === 'rejected' ? 'Supabase failed' : '',
        ]
          .filter(Boolean)
          .join(' and ') || 'Verification failed';

      setError(errorMessage);
      Toast(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } catch (error) {
      const errorMessage = 'Failed to send verification email';
      setError(errorMessage);
      Toast(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendVerificationEmail,
    isLoading,
    error,
    resetError: () => setError(null),
  };
};
