import analytics from '@react-native-firebase/analytics';

/**
 * Log a button tap event
 */
export async function logButtonTap(buttonName: string): Promise<void> {
  try {
    await analytics().logEvent('button_tap', { button_name: buttonName });
  } catch (error) {
    console.error('Failed to log button tap:', error);
  }
}

/**
 * Log a conversion event (when a user completes a significant action)
 */
export async function logConversion(campaignId?: string): Promise<void> {
  try {
    const params: any = {};
    if (campaignId) {
      params.campaign_id = campaignId;
    }
    await analytics().logEvent('conversion', params);
  } catch (error) {
    console.error('Failed to log conversion:', error);
  }
}

/**
 * Log screen views
 */
export async function logScreenView(screenName: string): Promise<void> {
  try {
    await analytics().logEvent('screen_view', { screen_name: screenName });
  } catch (error) {
    console.error('Failed to log screen view:', error);
  }
}

/**
 * Log user engagement (time spent, feature usage)
 */
export async function logUserEngagement(
  featureName: string,
  duration?: number,
): Promise<void> {
  try {
    const params: any = { feature_name: featureName };
    if (duration !== undefined) {
      params.engagement_time = duration;
    }
    await analytics().logEvent('user_engagement', params);
  } catch (error) {
    console.error('Failed to log user engagement:', error);
  }
}

/**
 * Log custom event
 */
export async function logCustomEvent(
  eventName: string,
  parameters?: Record<string, any>,
): Promise<void> {
  try {
    await analytics().logEvent(eventName, parameters || {});
  } catch (error) {
    console.error('Failed to log custom event:', error);
  }
}

/**
 * End session
 */
export async function endSession(): Promise<void> {
  try {
    await analytics().logEvent('end_session');
  } catch (error) {
    console.error('Failed to log end session:', error);
  }
}

/**
 * Log error
 */
export async function logError(error: Error): Promise<void> {
  try {
    await analytics().logEvent('error_occurred', {
      error_message: error.message,
      error_name: error.name,
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

/**
 * Log screen duration
 */
export async function logScreenDuration(
  screenName: string,
  duration: number,
): Promise<void> {
  try {
    await analytics().logEvent('screen_duration', {
      screen_name: screenName,
      duration_seconds: duration,
    });
  } catch (error) {
    console.error('Failed to log screen duration:', error);
  }
}
