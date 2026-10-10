import { ToastProvider } from '@/components/ui/ToastProvider';
import { useAppNavTheme } from '@/hooks/use-nav-theme';
// import useHealthConnect from '@/hooks/use-health-connect';
import TimerReconciliationSheet from '@/components/activity-scanner/TimerReconciliationSheet';
import TimerProvider from '@/providers/TimerProvider';
import { toastManager } from '@/utils/toast';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import appleAuth from '@invertase/react-native-apple-authentication';
import notifee, { EventType } from '@notifee/react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  LogBox,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoaderKitView from 'react-native-loader-kit';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { crashlytics } from './firebaseConfig';
import { darkTheme } from './src/constants/theme';
import MainRoute from './src/navigation/main_route';
import {
  endSession,
  logError,
  logScreenDuration,
} from './src/services/analyticsService';
import store, { persistor } from './src/services/mmkv-redux';
import {
  useAppDispatch,
  useAppSelector,
} from './src/services/mmkv-redux/hooks';
import {
  removeSessionTime,
  startSession,
} from './src/services/mmkv-redux/slices';

export const navigationRef: any = React.createRef();

LogBox.ignoreAllLogs(true);
type FontStyle = {
  fontFamily: string;
  fontWeight: any;
};

interface NativeTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  fonts: {
    regular: FontStyle;
    medium: FontStyle;
    bold: FontStyle;
    heavy: FontStyle;
  };
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const linking = {
  prefixes: ['HealthPulse://'],
  config: {
    screens: {
      ConnectDevice: 'spike/callback',
    },
  },
};

class AppErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    crashlytics().recordError(error);

    if (typeof logError === 'function') {
      logError(error.message, errorInfo.componentStack);
    }

    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We're sorry for the inconvenience. The app encountered an unexpected
            error.
          </Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.toString() || 'Unknown error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={this.resetError}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Toast initialization wrapper
const ToastInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ToastProvider
      onReady={context => {
        toastManager.setShowToast(context.showToast);
        toastManager.setShowSuccess(context.showSuccess);
        toastManager.setShowError(context.showError);
        toastManager.setShowWarning(context.showWarning);
        toastManager.setShowInfo(context.showInfo);
        toastManager.setShowConfetti(context.showConfetti);
        // toastManager.setShowToast(context.showToast);
        // toastManager.setShowSuccess(context.showSuccess);
        // toastManager.setShowError(context.showError);
        // toastManager.setShowWarning(context.showWarning);
        // toastManager.setShowInfo(context.showInfo);
        // toastManager.setShowConfetti(context.showConfetti); // ✅ FIXED: Added missing showConfetti
        // console.log('✅ Toast manager fully initialized');
      }}
    >
      {children}
    </ToastProvider>
  );
};

const ThemedApp = () => {
  const theme = useAppSelector(state => state.theme);
  const { sessionTime, lastFetch, userData } = useAppSelector(
    state => state.user,
  );
  const dispatch = useAppDispatch();
  const Colors = theme.colors;
  const [isReady, setIsReady] = useState(false);

  const MyCustomTheme = useAppNavTheme();

  // const { backgroundFetch } = useHealthConnect();

  useEffect(() => {
    const askForTrackingPermission = async () => {
      try {
        const status = await requestTrackingPermission();
        console.log('Tracking permission status:', status);
      } catch (error) {
        console.warn('Error requesting tracking permission:', error);
      }
    };

    askForTrackingPermission();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '806922605148-enn313eeun91f13vc5jk5cpsf2k7qdoe.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      iosClientId:
        '806922605148-1jeqi9lcf88ddk0cmudd0l24peqri14b.apps.googleusercontent.com',
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const unsubscribe = appleAuth.onCredentialRevoked(async () => {
        Alert.alert('Warning', 'User Credentials have been Revoked');
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    try {
      crashlytics().log('App mounted.');
      dispatch(startSession());
      setIsReady(true);

      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          if (sessionTime) {
            endSession(sessionTime);
            dispatch(removeSessionTime());
          }
        }
      };

      const subscription = AppState.addEventListener(
        'change',
        handleAppStateChange,
      );

      return () => subscription.remove();
    } catch (error) {
      if (error instanceof Error) {
        crashlytics().recordError(error);
      }
      console.error('Error in ThemedApp setup:', error);
    }
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (userData?.uid) {
  //       console.log('background fetch');
  //       await backgroundFetch();
  //     }
  //   }, 2 * 60 * 60 * 1000);

  //   return () => clearInterval(interval);
  // }, []);

  React.useEffect(() => {
    if (typeof global !== 'undefined') {
      (global as any).testDeepLinking = () => {
        console.log('🧪 Testing deep linking with MindfulScreen...');

        if (navigationRef.current && navigationRef.current.isReady()) {
          const currentState = navigationRef.current.getState();
          console.log('Current state:', JSON.stringify(currentState, null, 2));

          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'MindfulScreen' }],
          });

          console.log('✅ Navigation reset executed');
        } else {
          console.log('❌ Navigation ref not ready');
        }
      };
    }
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupNotificationListeners = () => {
      const handleNotificationEvent = async ({ type, detail }: any) => {
        console.log('🔔 Notification event received:', type, detail);

        if (type === EventType.PRESS) {
          const { notification } = detail;

          console.log(
            '📱 Notification data:',
            JSON.stringify(notification, null, 2),
          );

          if (notification?.data?.screen) {
            const targetScreen = notification.data.screen as string;
            console.log(
              `🔔 Notification pressed, navigating to: ${targetScreen}`,
            );

            if (navigationRef.current && navigationRef.current.isReady()) {
              console.log('✅ Navigation ref is ready, attempting reset...');

              try {
                const currentState = navigationRef.current.getState();
                console.log(
                  'Current navigation state:',
                  JSON.stringify(currentState, null, 2),
                );

                let routeParams: any = {};
                if (notification.data.screen === 'SuperfoodScreen') {
                  const { screen, ...params } = notification.data;
                  routeParams = params;
                }

                navigationRef.current.reset({
                  index: 0,
                  routes: [{ name: targetScreen, params: routeParams }],
                });

                console.log('✅ Navigation reset successful!');
              } catch (error) {
                console.error('❌ Navigation error:', error);
                try {
                  let routeParams: any = {};
                  if (notification.data.screen === 'SuperfoodScreen') {
                    const { screen, ...params } = notification.data;
                    routeParams = params;
                  }

                  navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: targetScreen, params: routeParams }],
                  });
                  console.log('✅ Fallback navigation reset successful!');
                } catch (resetError) {
                  console.error('❌ Reset navigation also failed:', resetError);
                }
              }
            } else {
              console.warn('❌ Navigation ref not ready for deep linking');
            }
          } else {
            console.log('ℹ️ Notification pressed but no screen data found');
          }
        }
      };

      notifee.onForegroundEvent(handleNotificationEvent);
      notifee.onBackgroundEvent(handleNotificationEvent);

      unsubscribe = () => {
        notifee.onForegroundEvent(async () => {});
        notifee.onBackgroundEvent(async () => {});
      };
    };

    setupNotificationListeners();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const initialNotification = await notifee.getInitialNotification();

      if (initialNotification) {
        const { notification } = initialNotification;
        console.log(
          'App launched by notification:',
          JSON.stringify(notification, null, 2),
        );

        if (notification?.data?.screen) {
          const screen = notification.data.screen as string;
          console.log(`Attempting to navigate to ${screen}`);

          const intervalId = setInterval(() => {
            if (navigationRef.current?.isReady()) {
              clearInterval(intervalId);

              let routeParams: any = {};
              if (
                initialNotification.notification?.data?.screen ===
                'SuperfoodScreen'
              ) {
                const { screen, ...params } =
                  initialNotification.notification.data;
                routeParams = params;
              }

              navigationRef.current.reset({
                index: 0,
                routes: [{ name: screen, params: routeParams }],
              });
              console.log(`Navigation to ${screen} successful`);
            }
          }, 100);
        }
      }
    }

    bootstrap();
  }, []);

  const currentScreen = useRef<string | null>(null);
  const startTime = useRef<number | null>(null);

  const handleNavigationStateChange = (state: NavigationState | undefined) => {
    try {
      if (!state) return;

      const route = state.routes[state.index];
      if (!route) return;
      const screenName = route.name;

      if (currentScreen.current && startTime.current) {
        const duration = Date.now() - startTime.current;
        logScreenDuration(currentScreen.current, duration);
      }

      currentScreen.current = screenName;
      startTime.current = Date.now();
    } catch (error) {
      if (error instanceof Error) {
        crashlytics().recordError(error);
      }
      console.error('Error in navigation state change:', error);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loaderContainer}>
        <LoaderKitView
          style={{ width: 50, height: 50 }}
          name={'LineScalePulseOutRapid'}
          animationSpeedMultiplier={1.0}
          color={Colors.primaryColor}
        />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
      theme={MyCustomTheme as any}
      fallback={<Text>Loading...</Text>}
    >
      <ToastInitializer>
        <TimerProvider>
          <StatusBar
            backgroundColor={Colors.gradientColor1}
            barStyle={Colors === darkTheme ? 'light-content' : 'dark-content'}
            translucent
          />

          <MainRoute />

          <TimerReconciliationSheet />
        </TimerProvider>
      </ToastInitializer>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              {/* <GameProgressionProvider> */}
              <ThemedApp />
              {/* </GameProgressionProvider> */}
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </PersistGate>
      </Provider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: '#343a40',
  },
  errorDetails: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#6c757d',
    padding: 12,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    width: '90%',
  },
  errorButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
