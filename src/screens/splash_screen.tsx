import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';
import { useAppSelector } from '../services/mmkv-redux/hooks';
import { initializeDatabase } from '../services/sqlite/vitals';

const SplashScreen = (props: any) => {
  const { isLogin, token, isLaunched } = useAppSelector(state => state.user);

  useEffect(() => {
    console.log(token);
    init();
    setTimeout(() => {
      if (isLogin) {
        props.navigation.replace('NavigationTab');
      } else {
        if (isLaunched) {
          props.navigation.replace('WelcomeScreen');
        } else {
          props.navigation.replace('OnboardingScreen');
        }
      }
    }, 1000);
  }, []);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const init = async () => {
    await initializeDatabase();
    await requestUserPermission();
  };

  async function requestUserPermission() {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  return (
    <View style={styles.container}>
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      <Image
        source={require('@/assets/images/splash.png')}
        style={styles.imageStyle}
      />
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    imageStyle: {
      width: 250,
      height: 250,
      resizeMode: 'contain',
    },
  });
};

export default SplashScreen;
