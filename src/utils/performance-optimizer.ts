import { APP_CONFIG } from '@/config/app-config';
import { InteractionManager, Platform } from 'react-native';

/**
 * Utility to optimize performance in React Native apps
 */
export const PerformanceOptimizer = {
  /**
   * Run a task after interactions have completed to avoid UI jank
   * @param task Function to run after interactions
   * @param timeout Optional timeout in ms
   */
  runAfterInteractions: (task: () => any, timeout = 300): void => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(task, timeout);
    });
  },

  /**
   * Debounce a function to prevent excessive calls
   * @param func Function to debounce
   * @param wait Wait time in ms
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait = APP_CONFIG.PERFORMANCE.inputDebounce,
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>): void => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  },

  /**
   * Throttle a function to limit how often it can be called
   * @param func Function to throttle
   * @param limit Limit in ms
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit = APP_CONFIG.PERFORMANCE.scrollThrottle,
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;

    return (...args: Parameters<T>): void => {
      const now = Date.now();

      if (now - lastCall >= limit) {
        func(...args);
        lastCall = now;
      }
    };
  },

  /**
   * Optimize image loading to reduce memory usage
   * @param uri Image URI
   * @param width Desired width
   * @param height Desired height
   */
  optimizeImageUri: (uri: string, width?: number, height?: number): string => {
    if (!uri) return uri;

    // Add dimensions to image URLs for CDNs that support it
    if (uri.includes('cloudinary.com') && (width || height)) {
      const params = [];
      if (width) params.push(`w_${width}`);
      if (height) params.push(`h_${height}`);

      return uri.replace('/upload/', `/upload/${params.join(',')}/`);
    }

    return uri;
  },

  /**
   * Check if the device is low-end and might need performance optimizations
   */
  isLowEndDevice: (): boolean => {
    // Simple heuristic based on platform and version
    if (Platform.OS === 'android' && Platform.Version < 24) {
      return true;
    }

    return false;
  },

  /**
   * Get optimized animation configuration based on device capabilities
   */
  getAnimationConfig: () => {
    return {
      useNativeDriver: APP_CONFIG.PERFORMANCE.useHardwareAcceleration,
      limitFPS: PerformanceOptimizer.isLowEndDevice(),
    };
  },
};
