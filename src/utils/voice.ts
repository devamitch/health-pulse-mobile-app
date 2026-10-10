import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

export const initVoice = async () => {
  await Voice.destroy();
  Voice.removeAllListeners();
  Tts.setDefaultLanguage('en-US');
};

export const startVoiceRecognition = async () => {
  try {
    await Voice.start('en-US');
    return true;
  } catch (error) {
    console.log('Voice start error:', error);
    return false;
  }
};

export const stopVoiceRecognition = async () => {
  try {
    await Voice.stop();
    return true;
  } catch (error) {
    console.log('Voice stop error:', error);
    return false;
  }
};

export const speak = (text: string) => {
  Tts.stop();
  Tts.speak(text);
};

export const cleanUpVoice = async () => {
  await Voice.destroy();
  Voice.removeAllListeners();
  Tts.stop();
};
