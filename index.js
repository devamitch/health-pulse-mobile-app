/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import 'react-native-url-polyfill/auto';
import App from './App';
import { name as appName } from './app.json';
global.Buffer = require('buffer').Buffer;

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in background:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
