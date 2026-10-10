import { supabase } from '@/config/supabase-config';
import {
  SignInWithIdTokenCredentials,
  SignInWithOAuthCredentials,
  SignInWithPasswordlessCredentials,
} from '@supabase/supabase-js';

// Types
export type SupabaseUser = {
  id: string;
  email?: string;
  phone?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  created_at: string;
  email_confirmed_at?: string | null;
};

export type SupabaseAuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
  refresh_token: string;
  user: SupabaseUser;
};

export type SupabaseSignInCredentials = {
  email: string;
  password: string;
};

export type SupabaseSignUpCredentials = SupabaseSignInCredentials & {
  userMetadata?: Record<string, unknown>;
};

/**
 * Checks if the current user's email is verified
 */
export const supabaseCheckEmailVerified = async (): Promise<boolean> => {
  try {
    const user = await supabaseGetUser();
    return !!user.email_confirmed_at;
  } catch (error) {
    throw new Error('Failed to check email verification status');
  }
};

/**
 * Resends email verification to the current user
 */
export const supabaseResendVerificationEmail = async (
  email: string,
  options?: {
    redirectTo?: string;
  },
): Promise<void> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options,
  });

  if (error) throw error;
};

/**
 * Signs up a new user with email and password
 */
export const supabaseSignUpWithEmail = async (
  credentials: SupabaseSignUpCredentials,
): Promise<{ user: SupabaseUser; session: SupabaseAuthSession }> => {
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) throw error;
  if (!data.user || !data.session) throw new Error('Signup failed');
  return { user: data.user, session: data.session };
};

/**
 * Signs in with an ID token (for third-party auth)
 */
export const supabaseSignInWithIdToken = async (
  credentials: SignInWithIdTokenCredentials,
): Promise<{ user: SupabaseUser; session: SupabaseAuthSession }> => {
  const { data, error } = await supabase.auth.signInWithIdToken(credentials);
  if (error) throw error;
  if (!data.user || !data.session) throw new Error('Sign in failed');
  return { user: data.user, session: data.session };
};

/**
 * Signs in with email and password
 */
export const supabaseSignInWithEmail = async (
  credentials: SupabaseSignInCredentials,
): Promise<{ user: SupabaseUser; session: SupabaseAuthSession }> => {
  const { email, password } = credentials;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user || !data.session) throw new Error('Sign in failed');
  return { user: data.user, session: data.session };
};

/**
 * Signs out the current user
 */
export const supabaseSignOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Gets the current session
 */
export const supabaseGetSession =
  async (): Promise<SupabaseAuthSession | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session ?? null;
  };

/**
 * Gets the current user
 */
export const supabaseGetUser = async (): Promise<SupabaseUser> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('No user found');
  return data.user;
};

/**
 * Listens for auth state changes
 */
export const supabaseOnAuthStateChange = (
  callback: (
    event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED',
    session: SupabaseAuthSession | null,
  ) => void,
) => {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
};

/**
 * Sends password reset email
 */
export const supabaseResetPasswordForEmail = async (
  email: string,
  options?: { redirectTo?: string },
) => {
  const { error, ...data } = await supabase.auth.resetPasswordForEmail(
    email,
    options,
  );
  if (error) throw error;
  return data;
};

/**
 * Updates user password
 */
export const supabaseUpdateUserPassword = async (
  newPassword: string,
): Promise<SupabaseUser> => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Password update failed');
  return data.user;
};

/**
 * Sends magic link to email (passwordless login)
 */
export const supabaseSignInWithMagicLink = async (
  credentials: SignInWithPasswordlessCredentials,
): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp(credentials);
  if (error) throw error;
};

/**
 * Signs in with OAuth provider
 */
export const supabaseSignInWithOAuth = async (
  credentials: SignInWithOAuthCredentials,
): Promise<{ user: SupabaseUser; session: SupabaseAuthSession }> => {
  const { data, error } = await supabase.auth.signInWithOAuth(credentials);
  if (error) throw error;
  if (!data.user || !data.session) throw new Error('OAuth sign in failed');
  return { user: data.user, session: data.session };
};

/**
 * Verifies OTP code
 */
export const supabaseVerifyOtp = async (params: {
  email: string;
  token: string;
  type: 'email' | 'phone' | 'recovery' | 'invite';
}): Promise<{ user: SupabaseUser; session: SupabaseAuthSession }> => {
  const { email, token, type } = params;
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
  if (error) throw error;
  if (!data.user || !data.session) throw new Error('OTP verification failed');
  return { user: data.user, session: data.session };
};
