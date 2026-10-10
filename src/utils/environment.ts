import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

declare const __DEV__: boolean;

// Environment detection and information
export const Environment = {
  // Is this a development build?
  isDevelopment: __DEV__,

  // Get app version
  getAppVersion: (): string => {
    return DeviceInfo.getVersion();
  },

  // Get app build number
  getBuildNumber: (): string => {
    return DeviceInfo.getBuildNumber();
  },

  // Get device unique ID (for analytics/tracking)
  getDeviceId: async (): Promise<string> => {
    return await DeviceInfo.getUniqueId();
  },

  // Get device model
  getDeviceModel: (): string => {
    return DeviceInfo.getModel();
  },

  // Get OS version
  getOSVersion: (): string => {
    return DeviceInfo.getSystemVersion();
  },

  // Get platform name
  getPlatform: (): string => {
    return Platform.OS;
  },

  // Get bundle ID
  getBundleId: (): string => {
    return DeviceInfo.getBundleId();
  },

  // Is this a tablet?
  isTablet: (): boolean => {
    return DeviceInfo.isTablet();
  },

  // Get device locale
  getLocale: (): string => {
    return DeviceInfo?.getDeviceLocale() ?? 'en-US';
  },

  // Get timezone
  getTimezone: (): string => {
    return DeviceInfo?.getTimezone();
  },

  // Get carrier name
  getCarrier: async (): Promise<string> => {
    return await DeviceInfo.getCarrier();
  },

  // Is this an emulator?
  isEmulator: async (): Promise<boolean> => {
    return await DeviceInfo.isEmulator();
  },
};
