import { reduxStorage } from '@/services/mmkv-redux/storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://zhktekkrsiwiswizdsyu.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoa3Rla2tyc2l3aXN3aXpkc3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzI4MDYsImV4cCI6MjA2OTUwODgwNn0.LENYyA8Jtf6RqFQcp1UwqICYFZJUuN8M3riYBxh5UYU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: reduxStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const CALLBACKURLS =
  'https://zhktekkrsiwiswizdsyu.supabase.co/auth/v1/callback';
