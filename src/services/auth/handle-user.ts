import { supabase } from '@/config/supabase-config';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';

type AuthResult = {
  user:
    | FirebaseAuthTypes.User
    | {
        uid: string;
        email?: string | null;
        emailVerified?: boolean;
        phoneNumber?: string | null;
        photoURL?: string | null;
        providerId?: string;
        displayName?: string | null;
      };
  additionalUserInfo?: {
    isNewUser?: boolean;
    providerId?: string;
    [key: string]: any;
  };
  session?: {
    access_token?: string;
    [key: string]: any;
  };
};

/**
 * User model
 */
export interface User {
  id: string;
  syncEnabled: boolean;
  paymentStatus: boolean;
  phoneNumber: string | null;
  tracksCycle: boolean;
  isNew: boolean;
}

export interface SupabaseUser{
  id: number; // bigint
  created_at: string; // timestamp with time zone, ISO string
  uuid?: string | null; // UUID, optional nullable
  is_sync_enabled?: boolean | null;
  payment_status?: boolean | null;
  phone_number?: string | null;
  is_menstrual_cycle_tracked?: boolean | null;
  is_new_user?: boolean | null;
  user_id: string; // text, not null
  updated_at?: string | null; // text, nullable (ideally should be timestamp)
  display_name: string; // text, not null
  last_db_backup?: Record<string, any> | null; // json, nullable
  subscription_status?: Record<string, any> | null; // json, nullable
}

/**
 * Create default user template
 */
export const createDefaultUser = (userId: string): User => ({
  id: userId,
  syncEnabled: false,
  paymentStatus: false,
  phoneNumber: null,
  tracksCycle: false,
  isNew: true,
});

export const createDefaultSupabaseUser = (userId: string, display_name: string): SupabaseUser => ({
  id: parseInt(userId),
  created_at: new Date().toISOString(),
  user_id: userId,
  display_name: display_name,
  is_sync_enabled: false,
  payment_status: false,
  phone_number: null,
  is_menstrual_cycle_tracked: false,
  is_new_user: true,
})
//
// ------------------------------
// 📦 Firestore operations
// ------------------------------
export const createUserInFirestore = async (user: User): Promise<void> => {
  try {
    // await firestore().collection('users').doc(user.id).set({
    //   uuid: user.id,
    //   isSyncEnabled: user.syncEnabled,
    //   paymentStatus: user.paymentStatus,
    //   phoneNumber: user.phoneNumber,
    //   isMenstrualCycleTracked: user.tracksCycle,
    //   isNewUser: user.isNew,
    // });
  } catch (error) {
    console.warn('Firestore create failed (ignored):', error);
  }
};

export const getUserFromFirestore = async (
  userId: string,
): Promise<User | null> => {
  try {
    return null;
    // const doc = await firestore().collection('users').doc(userId).get();
    // if (!doc.exists) return null;
    // const data = doc.data();

    // return {
    //   id: userId,
    //   syncEnabled: data?.isSyncEnabled ?? false,
    //   paymentStatus: data?.paymentStatus ?? false,
    //   phoneNumber: data?.phoneNumber ?? null,
    //   tracksCycle: data?.isMenstrualCycleTracked ?? false,
    //   isNew: data?.isNewUser ?? false,
    // };
  } catch (error) {
    console.warn('Firestore fetch failed (ignored):', error);
    return null;
  }
};

//
// ------------------------------
// 📦 Supabase operations
// ------------------------------
export const createUserInSupabase = async (user: SupabaseUser): Promise<void> => {
  try {
    const { error } = await supabase.from('profiles').insert(user);
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase create failed (ignored):', error);
  }
};

export const getUserFromSupabase = async (
  userId: string,
): Promise<SupabaseUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    
    return data as (SupabaseUser | null);
  } catch (error) {
    console.warn('Supabase fetch failed (ignored):', error);
    return null;
  }
};

export const handleSocialUserAuth = async (
  authResult: FirebaseAuthTypes.UserCredential,
) => {
  const userId = authResult.user.uid;
  const isNewUser = authResult.additionalUserInfo?.isNewUser ?? false;

  if (isNewUser) {
    const newUser = createDefaultUser(userId);
    const newSupabaseUser = createDefaultSupabaseUser(userId, '')

    await Promise.all([
      createUserInFirestore(newUser),
      createUserInSupabase(newSupabaseUser),
    ]);

    return newUser;
  }

  // Fetch from both, merge
  const [firestoreUser, supabaseUser] = await Promise.all([
    getUserFromFirestore(userId),
    getUserFromSupabase(userId),
  ]);

  return {
    id: userId,
    syncEnabled:
      firestoreUser?.syncEnabled ?? supabaseUser?.is_sync_enabled ?? false,
    paymentStatus:
      firestoreUser?.paymentStatus ?? supabaseUser?.payment_status ?? false,
    phoneNumber:
      firestoreUser?.phoneNumber ?? supabaseUser?.phone_number ?? null,
    tracksCycle:
      firestoreUser?.tracksCycle ?? supabaseUser?.is_menstrual_cycle_tracked ?? false,
    isNew: firestoreUser?.isNew ?? supabaseUser?.is_new_user ?? false,
  };
};
// Utility functions (add these to your user-operations.ts)
export const updateUserInFirestore = async (
  userId: string,
  updates: Partial<SupabaseUser>,
) => {
  try {
    // await firestore().collection('users').doc(userId).update(updates);
  } catch (error) {
    console.warn('Firestore update failed:', error);
    throw error;
  }
};

export const updateUserInSupabase = async (
  userId: string,
  updates: Partial<SupabaseUser>,
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase update failed:', error);
    throw error;
  }
};
