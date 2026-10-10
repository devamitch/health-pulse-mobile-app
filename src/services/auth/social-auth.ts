import appleAuth, {
  AppleCredentialState,
} from '@invertase/react-native-apple-authentication';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  photo: string | null;
  authToken: string | null;
  idToken: string | null;
  provider: 'google' | 'apple';
};

export type AuthError = {
  code: string;
  message: string;
};

// Apple Auth Utilities
export const isAppleSupported = appleAuth.isSupported;
export const isAppleSignUpButtonSupported = appleAuth.isSignUpButtonSupported;

export const appleAuthentication = async () => {
  if (!isAppleSupported) {
    throw new Error('Apple authentication is not supported on this device');
  }

  const appleAuthRequestResponse = await appleAuth?.performRequest({
    requestedOperation: 1,
    requestedScopes: [0, 1],
  });

  // appleAuthRequestResponse?.
  const credentialState = await appleAuth?.getCredentialStateForUser(
    appleAuthRequestResponse.user,
  );

  if (credentialState !== 1) {
    throw new Error('Apple authentication not authorized');
  }

  return {
    id: appleAuthRequestResponse.user,
    email: appleAuthRequestResponse.email ?? undefined,
    name:
      appleAuthRequestResponse.fullName?.givenName &&
      appleAuthRequestResponse.fullName?.familyName
        ? `${appleAuthRequestResponse.fullName.givenName} ${appleAuthRequestResponse.fullName.familyName}`
        : undefined,
    photo: undefined,
    authToken: appleAuthRequestResponse.identityToken ?? undefined,
    idToken: appleAuthRequestResponse.identityToken ?? undefined,
    provider: 'apple',
    nonce: appleAuthRequestResponse?.nonce ?? undefined,
  };
};

export const checkAppleAuthState = async (userId: string): Promise<boolean> => {
  if (!isAppleSupported) return false;

  try {
    const credentialState = await appleAuth.getCredentialStateForUser(userId);
    return credentialState === AppleCredentialState.AUTHORIZED;
  } catch {
    return false;
  }
};

export const googleAuth = async () => {
  const hasPlayServices = await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  if (!hasPlayServices) {
    throw new Error('Google Play services not available');
  }

  const userInfo = await GoogleSignin.signIn();
  const { idToken, accessToken } = await GoogleSignin.getTokens();

  return {
    id: userInfo?.data?.user?.id ?? undefined,
    email: userInfo?.data?.user?.email,
    name: userInfo?.data?.user?.name ?? undefined,
    photo: userInfo?.data?.user?.photo ?? undefined,
    authToken: accessToken,
    idToken: idToken,
    provider: 'google',
  };
};

export const googleSignOut = async (): Promise<void> => {
  await GoogleSignin.signOut();
};

export const getCurrentGoogleUser = async () => {
  const userInfo = await GoogleSignin.getCurrentUser();
  if (!userInfo) throw new Error('No User found');
  const { idToken, accessToken } = await GoogleSignin.getTokens();

  return {
    id: userInfo.user.id,
    email: userInfo.user.email,
    name: userInfo.user.name || null,
    photo: userInfo.user.photo || null,
    authToken: accessToken,
    idToken: idToken,
    provider: 'google',
  };
};
