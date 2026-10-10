import { useAppTheme } from '@/hooks/themeHook';
import { toastManager } from '@/utils/toast';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import ToastComponent, { ToastConfig } from './ToastComponent';

interface ToastContextType {
  showToast: (config: ToastConfig | string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  showConfetti: (message: string) => void;
  clearAll: () => void;
  getToastCount: () => number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface Toast extends ToastConfig {
  id: string;
  index: number;
  position: 'top' | 'bottom';
  createdAt: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  verticalOffset?: number;
  horizontalOffset?: number;
  toastSpacing?: number;
  enableStacking?: boolean;
  defaultDuration?: number;
  defaultPosition?: 'top' | 'bottom';
  onReady?: (context: ToastContextType) => void;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 3,
  verticalOffset = 60,
  horizontalOffset = 20,
  toastSpacing = 10,
  enableStacking = true,
  defaultDuration = 3000,
  defaultPosition = 'bottom',
  onReady,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const theme = useAppTheme();

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const getToastCount = useCallback(() => {
    return toasts.length;
  }, [toasts]);

  const showToast = useCallback(
    (config: ToastConfig | string) => {
      const toastConfig: ToastConfig =
        typeof config === 'string' ? { message: config } : config;

      const id = Date.now().toString() + Math.random().toString(36);
      const position = toastConfig.position || defaultPosition;
      const duration = toastConfig.duration || defaultDuration;

      let index = 0;
      if (enableStacking) {
        const samePositionToasts = toasts.filter(t => t.position === position);
        index = samePositionToasts.length;
      }

      const newToast: Toast = {
        ...toastConfig,
        id,
        index,
        position,
        duration,
        createdAt: Date.now(),
      };

      setToasts(prev => {
        const samePositionToasts = prev.filter(
          t => t.position === newToast.position,
        );

        if (samePositionToasts.length >= maxToasts) {
          const oldestToast = samePositionToasts.sort(
            (a, b) => a.createdAt - b.createdAt,
          )[0];

          const filtered = prev.filter(t => t.id !== oldestToast.id);

          const reindexed = filtered.map(t => ({
            ...t,
            index:
              t.position === newToast.position
                ? Math.max(0, t.index - 1)
                : t.index,
          }));

          return [...reindexed, newToast];
        }

        return [...prev, newToast];
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [
      toasts,
      maxToasts,
      enableStacking,
      defaultPosition,
      defaultDuration,
      removeToast,
    ],
  );

  const showSuccess = useCallback(
    (message: string) => {
      return showToast({ message, type: 'success' });
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string) => {
      return showToast({ message, type: 'error' });
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string) => {
      return showToast({ message, type: 'warning' });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string) => {
      return showToast({ message, type: 'info' });
    },
    [showToast],
  );

  const showConfetti = useCallback(
    (message: string) => {
      return showToast({
        message,
        type: 'confetti',
        duration: 4000,
        icon: 'party-popper',
      });
    },
    [showToast],
  );

  useEffect(() => {
    toastManager.setShowToast(showToast);
    toastManager.setShowSuccess(showSuccess);
    toastManager.setShowError(showError);
    toastManager.setShowWarning(showWarning);
    toastManager.setShowInfo(showInfo);
    toastManager.setShowConfetti(showConfetti);
  }, [showToast, showSuccess, showError, showWarning, showInfo, showConfetti]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfetti,
    clearAll,
    getToastCount,
  };

  useEffect(() => {
    if (onReady) {
      onReady(contextValue);
    }
  }, [onReady]);

  const getToastPosition = (toast: Toast) => {
    const basePosition =
      toast.position === 'top' ? verticalOffset : verticalOffset;

    if (!enableStacking) {
      return toast.position === 'top'
        ? { top: basePosition }
        : { bottom: basePosition };
    }

    const offset = toast.index * (70 + toastSpacing);

    return toast.position === 'top'
      ? { top: basePosition + offset }
      : { bottom: basePosition + offset };
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* ✅ FIXED: Changed from GestureHandlerRootView to Animated.View
           
           Why? GestureHandlerRootView should ONLY be at app root (App.tsx).
           Having it here creates a duplicate wrapper causing gesture conflicts!
           
           Toasts don't need gesture handling - they just need to display.
           Animated.View works perfectly for positioning and animations.
      */}
      <Animated.View style={styles.container} pointerEvents="box-none">
        {toasts.map(toast => {
          const positionStyle = getToastPosition(toast);
          const zIndex = 9999 - toast.index;

          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toastContainer,
                positionStyle,
                {
                  zIndex,
                  paddingHorizontal: horizontalOffset,
                },
              ]}
              pointerEvents="box-none"
            >
              <ToastComponent
                {...toast}
                onDismiss={() => removeToast(toast.id)}
                theme={theme}
              />
            </Animated.View>
          );
        })}
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    pointerEvents: 'box-none',
  },
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
