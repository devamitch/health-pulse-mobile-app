import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { setFCMToken } from '@/services/mmkv-redux/slices';

export function useDeviceToken(onTokenUpdate?: (token: string) => Promise<void>) {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const { fcmToken, userData } = useAppSelector(state => state.user)
  const [deviceToken, setDeviceToken] = useState<string | null>(fcmToken ?? null);
  const dispatch = useAppDispatch();

  const userId = userData?.uid;

  const requestPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      setPermissionGranted(enabled);

      if (!enabled) {
        Alert.alert('Permission required', 'Please enable notifications in settings.');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const getAndSyncFcmToken = async () => {
    try {
      const newToken = await messaging().getToken();

      if (newToken && newToken !== fcmToken) {
        console.log('🔄 New FCM token detected:', newToken);
        dispatch(setFCMToken(newToken));
        setDeviceToken(newToken);

        if (userId && onTokenUpdate) {
          await onTokenUpdate(newToken);
        }
      } else {
        setDeviceToken(fcmToken ?? null);
      }
    } catch (error) {
      console.error('Error fetching FCM token:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(async token => {
      console.log('♻️ FCM token refreshed:', token);
      dispatch(setFCMToken(token));
      setDeviceToken(token);

      if (userId && onTokenUpdate) {
        await onTokenUpdate(token);
      }
    });

    return unsubscribe;
  }, [userId, onTokenUpdate]);

  useEffect(() => {
    (async () => {
      const granted = await requestPermission();
      if (granted) {
        await getAndSyncFcmToken();
      }
    })();
  }, [userId]);

  return { fcmToken: deviceToken, permissionGranted };
}
