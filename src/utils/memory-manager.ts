import { APP_CONFIG } from '@/config/app-config';
import { InteractionManager, Platform } from 'react-native';

/**
 * Utility to manage memory usage in the app
 */
export const MemoryManager = {
  /**
   * Cache for storing references to objects that should be released
   */
  _cache: new Map<string, any>(),

  /**
   * Register an object to be managed
   * @param key Unique identifier for the object
   * @param object The object to manage
   */
  register: (key: string, object: any): void => {
    MemoryManager._cache.set(key, object);
  },

  /**
   * Release an object from memory
   * @param key Unique identifier for the object
   */
  release: (key: string): void => {
    const object = MemoryManager._cache.get(key);

    if (object) {
      // Handle specific object types
      if (object.release && typeof object.release === 'function') {
        object.release();
      }

      MemoryManager._cache.delete(key);
    }
  },

  /**
   * Clear all managed objects
   */
  clearAll: (): void => {
    MemoryManager._cache.forEach((object, key) => {
      MemoryManager.release(key);
    });

    MemoryManager._cache.clear();
  },

  /**
   * Optimize memory usage when app goes to background
   */
  optimizeOnBackground: (): void => {
    if (APP_CONFIG.PERFORMANCE.aggressiveMemoryManagement) {
      // Release non-essential resources
      MemoryManager._cache.forEach((object, key) => {
        // Keep only critical objects
        if (!key.includes('critical')) {
          MemoryManager.release(key);
        }
      });

      // Force garbage collection on Android
      if (Platform.OS === 'android' && global.gc) {
        try {
          global.gc();
        } catch (e) {
          console.log('Unable to force garbage collection');
        }
      }
    }
  },

  /**
   * Schedule a memory cleanup task
   */
  scheduleCleanup: (): void => {
    InteractionManager.runAfterInteractions(() => {
      // Clear image caches and other memory-intensive resources
      // that are no longer needed
      MemoryManager._cache.forEach((object, key) => {
        if (key.includes('temp') || key.includes('cache')) {
          MemoryManager.release(key);
        }
      });
    });
  },
};
