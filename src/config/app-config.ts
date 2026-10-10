import { Platform } from 'react-native';

declare const __DEV__: boolean;

const env = process.env;
// Helper function to safely get environment variables with defaults
const getEnv = <T extends string>(value: T | undefined, defaultValue: T): T => {
  return value !== undefined && value !== '' ? value : defaultValue;
};

// Cache Apple Sign In attempts to prevent repeated prompts
const APPLE_SIGN_IN_CACHE = {
  hasAttempted: false,
  lastAttempt: 0,
  cooldownPeriod: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

export const APP_CONFIG = {
  // Authentication
  FIREBASE_CONFIG: {
    apiKey: getEnv(env?.FIREBASE_API_KEY, 'YOUR_FIREBASE_API_KEY'),
    authDomain: getEnv(env?.FIREBASE_AUTH_DOMAIN, 'your-app.firebaseapp.com'),
    projectId: getEnv(env?.FIREBASE_PROJECT_ID, 'your-app-id'),
    storageBucket: getEnv(env?.FIREBASE_STORAGE_BUCKET, 'your-app.appspot.com'),
    messagingSenderId: getEnv(
      env?.FIREBASE_MESSAGING_SENDER_ID,
      'YOUR_MESSAGING_SENDER_ID',
    ),
    appId: getEnv(env?.FIREBASE_APP_ID, 'YOUR_APP_ID'),
    measurementId: getEnv(env?.FIREBASE_MEASUREMENT_ID, 'YOUR_MEASUREMENT_ID'),
  },

  // Apple Sign In (iOS only)
  APPLE_SIGN_IN: {
    // This should be your Apple Services ID for web authentication
    webClientId: getEnv(env?.APPLE_SERVICE_ID, 'com.your.app.service'),
    // Cache to prevent repeated prompts
    cache: APPLE_SIGN_IN_CACHE,
    // Only prompt on iOS devices
    shouldPrompt: () => {
      // Don't prompt if not on iOS
      if (Platform.OS !== 'ios') return false;

      // Check if we've already attempted recently
      const now = Date.now();
      if (
        APPLE_SIGN_IN_CACHE.hasAttempted &&
        now - APPLE_SIGN_IN_CACHE.lastAttempt <
          APPLE_SIGN_IN_CACHE.cooldownPeriod
      ) {
        return false;
      }

      // Update cache and allow prompt
      APPLE_SIGN_IN_CACHE.hasAttempted = true;
      APPLE_SIGN_IN_CACHE.lastAttempt = now;
      return true;
    },
  },

  // Google Sign In
  GOOGLE_SIGN_IN: {
    // iOS client ID from Google Cloud Console
    iosClientId: getEnv(
      env?.GOOGLE_IOS_CLIENT_ID,
      'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    ),
    // Web client ID from Google Cloud Console
    webClientId: getEnv(
      env?.GOOGLE_WEB_CLIENT_ID,
      'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    ),
  },

  // App Store (for subscriptions/purchases)
  APP_STORE: {
    // Now using the environment variable from @env
    SECRET: getEnv(env?.APP_STORE_SECRET, 'APP_STORE_SECRET_PLACEHOLDER'),
  },

  // API Configuration
  API: {
    baseUrl: getEnv(env?.API_BASE_URL, 'https://api.skyphealth.com'),
    key: getEnv(env?.API_KEY, 'your_api_key'),
  },

  // Performance settings
  PERFORMANCE: {
    // Enable hardware acceleration
    useHardwareAcceleration: true,
    // Limit animation frame rate on lower-end devices
    limitAnimationFPS: Platform.OS === 'android' && Platform.Version < 24,
    // Batch state updates for better performance
    batchStateUpdates: true,
    // Debounce time for input fields (ms)
    inputDebounce: 300,
    // Throttle time for scroll events (ms)
    scrollThrottle: 16,
    // Memory management
    aggressiveMemoryManagement: Platform.OS === 'android',
  },

  // Analytics
  ANALYTICS: {
    enabled: true,
    debugMode: __DEV__,
    // Batch analytics events to reduce network calls
    batchEvents: true,
    batchInterval: 30000, // 30 seconds
  },

  // App Information
  APP_INFO: {
    name: 'Skyp Health',
    version: '1.0.0',
    description:
      'AI-powered health app designed to make health monitoring simple, smart, and secure.',
    privacyPolicyUrl: 'https://skyphealth.com/privacy',
    termsOfServiceUrl: 'https://skyphealth.com/terms',
    supportEmail: 'support@skyphealth.com',
  },
};
