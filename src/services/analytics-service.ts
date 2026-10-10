import analytics from '@react-native-firebase/analytics';
import { APP_CONFIG } from '../config/app-config';
import { Environment } from '../utils/environment';

// Analytics events
export enum AnalyticsEvent {
  // Authentication events
  LOGIN = 'login',
  SIGNUP = 'sign_up',
  PASSWORD_RESET = 'password_reset',

  // Navigation events
  SCREEN_VIEW = 'screen_view',

  // User action events
  BUTTON_TAP = 'button_tap',
  FEATURE_USE = 'feature_use',

  // Health tracking events
  HEALTH_METRIC_TRACKED = 'health_metric_tracked',
  HEALTH_GOAL_SET = 'health_goal_set',
  HEALTH_GOAL_ACHIEVED = 'health_goal_achieved',

  // App lifecycle events
  APP_OPEN = 'app_open',
  APP_UPDATE = 'app_update',

  // Subscription events
  SUBSCRIPTION_VIEW = 'subscription_view',
  SUBSCRIPTION_START = 'subscription_start',
  SUBSCRIPTION_RENEW = 'subscription_renew',
  SUBSCRIPTION_CANCEL = 'subscription_cancel',
  SUBSCRIPTION_RESTORE = 'subscription_restore',
}

// Initialize analytics
export const initializeAnalytics = async (): Promise<void> => {
  if (APP_CONFIG.ANALYTICS.enabled) {
    await analytics().setAnalyticsCollectionEnabled(true);

    // Set user properties
    const deviceId = await Environment.getDeviceId();
    await analytics().setUserProperty('device_id', deviceId);
    await analytics().setUserProperty(
      'app_version',
      Environment.getAppVersion(),
    );
    await analytics().setUserProperty('os_version', Environment.getOSVersion());
    await analytics().setUserProperty(
      'device_model',
      Environment.getDeviceModel(),
    );

    console.log('Analytics initialized');
  } else {
    await analytics().setAnalyticsCollectionEnabled(false);
    console.log('Analytics disabled');
  }
};

// Log button tap event
export const logButtonTap = async (
  buttonName: string,
  screenName?: string,
): Promise<void> => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  await analytics().logEvent(AnalyticsEvent.BUTTON_TAP, {
    button_name: buttonName,
    screen_name: screenName || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

// Log screen view event
export const logScreenView = (
  screenName: string,
  screenClass?: string,
): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
};

// Log feature use event
export const logFeatureUse = (
  featureName: string,
  parameters?: Record<string, any>,
): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logEvent(AnalyticsEvent.FEATURE_USE, {
    feature_name: featureName,
    ...parameters,
    timestamp: new Date().toISOString(),
  });
};

// Log subscription view event
export const logSubscriptionView = (productId?: string): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logEvent(AnalyticsEvent.SUBSCRIPTION_VIEW, {
    product_id: productId || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

// Log subscription start event
export const logSubscriptionStart = (
  productId: string,
  price: string,
  currency: string,
  trialPeriod?: number,
): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logEvent(AnalyticsEvent.SUBSCRIPTION_START, {
    product_id: productId,
    price,
    currency,
    trial_period: trialPeriod,
    timestamp: new Date().toISOString(),
  });
};

// Log subscription renew event
export const logSubscriptionRenew = (productId: string): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logEvent(AnalyticsEvent.SUBSCRIPTION_RENEW, {
    product_id: productId,
    timestamp: new Date().toISOString(),
  });
};

// Log subscription cancel event
export const logSubscriptionCancel = (
  productId: string,
  reason?: string,
): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logEvent(AnalyticsEvent.SUBSCRIPTION_CANCEL, {
    product_id: productId,
    reason: reason || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

// Log subscription restore event
export const logSubscriptionRestore = (productId: string): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().logEvent(AnalyticsEvent.SUBSCRIPTION_RESTORE, {
    product_id: productId,
    timestamp: new Date().toISOString(),
  });
};

// Set user ID for analytics
export const setAnalyticsUserId = (userId: string | null): void => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  analytics().setUserId(userId);
};

// Reset analytics data
export const resetAnalytics = async (): Promise<void> => {
  if (!APP_CONFIG.ANALYTICS.enabled) return;

  await analytics().resetAnalyticsData();
  await setAnalyticsUserId(null);
};
