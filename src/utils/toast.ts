import { ToastConfig } from '@/components/ui/ToastComponent';

class ToastManager {
  private static instance: ToastManager;
  private showToastFn: ((config: ToastConfig | string) => void) | null = null;
  private showSuccessFn: ((message: string) => void) | null = null;
  private showErrorFn: ((message: string) => void) | null = null;
  private showWarningFn: ((message: string) => void) | null = null;
  private showInfoFn: ((message: string) => void) | null = null;
  private showConfettiFn: ((message: string) => void) | null = null;

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setShowToast(fn: (config: ToastConfig | string) => void) {
    this.showToastFn = fn;
  }

  setShowSuccess(fn: (message: string) => void) {
    this.showSuccessFn = fn;
  }

  setShowError(fn: (message: string) => void) {
    this.showErrorFn = fn;
  }

  setShowWarning(fn: (message: string) => void) {
    this.showWarningFn = fn;
  }

  setShowInfo(fn: (message: string) => void) {
    this.showInfoFn = fn;
  }

  setShowConfetti(fn: (message: string) => void) {
    this.showConfettiFn = fn;
  }

  show(config: ToastConfig | string) {
    if (this.showToastFn) {
      this.showToastFn(config);
    } else {
      console.error(
        '❌ Toast not initialized. Wrap your app with ToastProvider',
      );
    }
  }

  success(message: string) {
    if (this.showSuccessFn) {
      this.showSuccessFn(message);
    } else {
      this.show({ message, type: 'success' });
    }
  }

  error(message: string) {
    if (this.showErrorFn) {
      this.showErrorFn(message);
    } else {
      this.show({ message, type: 'error' });
    }
  }

  warning(message: string) {
    if (this.showWarningFn) {
      this.showWarningFn(message);
    } else {
      this.show({ message, type: 'warning' });
    }
  }

  info(message: string) {
    if (this.showInfoFn) {
      this.showInfoFn(message);
    } else {
      this.show({ message, type: 'info' });
    }
  }

  confetti(message: string) {
    if (this.showConfettiFn) {
      this.showConfettiFn(message);
    } else {
      this.show({
        message,
        type: 'confetti',
        duration: 4000,
        icon: 'party-popper',
      });
    }
  }
}

const toastManager = ToastManager.getInstance();

/**
 * Toast utility with BlurView-based design
 *
 * Light Theme: Matte/frosted glass appearance
 * Dark Theme: Vibrant colored toasts
 *
 * Usage:
 * ```ts
 * // Simple message
 * Toast('Hello World');
 *
 * // Typed messages
 * Toast.success('Files uploaded successfully');
 * Toast.error('Files are larger than 5 MB');
 * Toast.warning('Please be careful');
 * Toast.info('Did you know?');
 * Toast.confetti('🎉 Achievement Unlocked!');
 *
 * // Advanced usage
 * Toast.show({
 *   message: 'Custom toast',
 *   type: 'success',
 *   duration: 5000,
 *   icon: 'heart',
 *   action: {
 *     label: 'Undo',
 *     onPress: () => console.log('Undo pressed')
 *   },
 *   position: 'top'
 * });
 * ```
 */
export const Toast = Object.assign(
  // Main function
  (text: string) => {
    toastManager.show(text);
  },
  {
    // Core methods
    show: (config: ToastConfig | string) => {
      toastManager.show(config);
    },
    success: (message: string) => {
      toastManager.success(message);
    },
    error: (message: string) => {
      toastManager.error(message);
    },
    warning: (message: string) => {
      toastManager.warning(message);
    },
    info: (message: string) => {
      toastManager.info(message);
    },
    confetti: (message: string) => {
      toastManager.confetti(message);
    },

    // Common helpers
    networkError: () => {
      toastManager.error('No internet connection');
    },
    serverError: () => {
      toastManager.error('Server error. Please try again');
    },
    validationError: (field: string) => {
      toastManager.error(`Please enter a valid ${field}`);
    },
    copied: () => {
      toastManager.success('Copied to clipboard');
    },
    saved: () => {
      toastManager.success('Saved successfully');
    },
    deleted: () => {
      toastManager.success('Deleted successfully');
    },
    updated: () => {
      toastManager.success('Updated successfully');
    },

    // Gamification helpers
    levelUp: (level: number) => {
      toastManager.confetti(`🎉 Level ${level} Unlocked!`);
    },
    xpEarned: (amount: number) => {
      toastManager.confetti(`+${amount} XP`);
    },
    achievementUnlocked: (title: string) => {
      toastManager.confetti(`🏆 ${title}`);
    },
    questComplete: (questName: string, xp: number) => {
      toastManager.confetti(`✅ ${questName} (+${xp} XP)`);
    },
    streak: (days: number) => {
      toastManager.confetti(`🔥 ${days}-Day Streak!`);
    },
    milestone: (milestone: string) => {
      toastManager.confetti(`🎯 ${milestone}`);
    },
  },
);

// Export the manager for provider setup
export { toastManager };

// Type exports
export type { ToastConfig };
