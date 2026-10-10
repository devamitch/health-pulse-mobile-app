import analytics from '@react-native-firebase/analytics';
import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';

export const firebaseConfig = {
  apiKey: 'AIzaSyB5t-jrDrXbuQwYqpXH5NWOOhPIUK3L9Uw',
  authDomain: 'AuraCore-app-cc6d4.firebaseapp.com',
  databaseURL: 'https://AuraCore-app-cc6d4-default-rtdb.firebaseio.com',
  projectId: 'AuraCore-app-cc6d4',
  storageBucket: 'AuraCore-app-cc6d4.firebasestorage.app',
  messagingSenderId: '806922605148',
  appId: '1:806922605148:web:9b8b523ebc4d469ffa8c99',
  measurementId: 'G-8N08QVD202',
};

if (!app.apps.length) {
  app.initializeApp(firebaseConfig);
}

if (!__DEV__) {
  crashlytics().setCrashlyticsCollectionEnabled(true);
}

const setFirebaseUser = async user => {
  await Promise.all([
    crashlytics().setUserId(user.uid),
    analytics().setUserId(user.uid),
  ]);
};
crashlytics().setCrashlyticsCollectionEnabled(true);

export { analytics, app, auth, crashlytics, setFirebaseUser };
