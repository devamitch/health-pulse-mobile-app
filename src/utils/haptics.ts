// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
// import { Platform } from 'react-native';

// type HapticType =
//   | 'impactLight'
//   | 'impactMedium'
//   | 'impactHeavy'
//   | 'notificationSuccess'
//   | 'notificationWarning'
//   | 'notificationError';

// const options = {
//   enableVibrateFallback: true,
//   ignoreAndroidSystemSettings: false,
// };

// /**
//  * Provides haptic feedback based on the specified type
//  * @param type The type of haptic feedback to trigger
//  */
// export const hapticFeedback = (type: HapticType): void => {
//   if (Platform.OS === 'android' || Platform.OS === 'ios') {
//     ReactNativeHapticFeedback.trigger(type, options);
//   }
// };

import { Platform, Vibration } from 'react-native';

type HapticType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError';

/**
 * Provides haptic feedback using React Native's built-in Vibration API
 * @param type The type of haptic feedback to trigger
 */
export const hapticFeedback = (type: HapticType): void => {
  if (Platform.OS === 'android') {
    // Android vibration patterns (in ms)
    switch (type) {
      case 'impactLight':
        Vibration.vibrate(20);
        break;
      case 'impactMedium':
        Vibration.vibrate(40);
        break;
      case 'impactHeavy':
        Vibration.vibrate(60);
        break;
      case 'notificationSuccess':
        Vibration.vibrate([0, 40, 60, 40]);
        break;
      case 'notificationWarning':
        Vibration.vibrate([0, 30, 60, 30, 60]);
        break;
      case 'notificationError':
        Vibration.vibrate([0, 50, 100, 50, 100, 50]);
        break;
      default:
        Vibration.vibrate(20);
    }
  } else if (Platform.OS === 'ios') {
    // iOS doesn't support custom vibration patterns through the Vibration API
    // We'll use a simple vibration for all types
    Vibration.vibrate();
  }
};
