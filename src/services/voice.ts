import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import type { VoiceEvent, VoiceOptions } from '../types/voice';

const VoiceModule = NativeModules.Voice as {
  startSpeech: (
    locale: string,
    options: any,
    callback: (error?: string) => void,
  ) => void;
  stopSpeech: (callback: (error?: string) => void) => void;
  cancelSpeech: (callback: (error?: string) => void) => void;
  destroySpeech: (callback: (error?: string) => void) => void;
  isSpeechAvailable: (
    callback: (isAvailable: number, error?: string) => void,
  ) => void;
  isRecognizing: (callback: (isRecognizing: number) => void) => void;
};

const voiceEmitter =
  Platform.OS !== 'web' ? new NativeEventEmitter(VoiceModule as any) : null;

/**
 * Request microphone permission
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'App needs access to your microphone',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions differently
};

/**
 * Initialize voice recognition with event listeners
 */
export const initVoiceRecognition = (
  options: VoiceOptions = {},
): { destroy: () => void } => {
  if (!voiceEmitter) {
    return { destroy: () => {} };
  }

  const eventListener = voiceEmitter.addListener(
    'onVoiceEvent',
    (event: VoiceEvent) => {
      options.onEvent?.(event);
    },
  );

  return {
    destroy: () => {
      eventListener.remove();
    },
  };
};

/**
 * Start voice recognition
 */
export const startVoiceRecognition = async (
  options: VoiceOptions = {},
): Promise<void> => {
  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    throw new Error('Microphone permission not granted');
  }

  return new Promise((resolve, reject) => {
    const locale = options.locale || 'en-US';

    if (Platform.OS === 'android') {
      VoiceModule.startSpeech(
        locale,
        {
          EXTRA_LANGUAGE_MODEL:
            options.android?.extraLanguageModel || 'LANGUAGE_MODEL_FREE_FORM',
          EXTRA_MAX_RESULTS: options.android?.extraMaxResults || 5,
          REQUEST_PERMISSIONS_AUTO:
            options.android?.requestPermissionsAuto ?? true,
        },
        error => (error ? reject(new Error(error)) : resolve()),
      );
    } else {
      (VoiceModule as any)?.startSpeech(locale, error =>
        error ? reject(new Error(error)) : resolve(),
      );
    }
  });
};

/**
 * Stop voice recognition
 */
export const stopVoiceRecognition = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    VoiceModule.stopSpeech(error =>
      error ? reject(new Error(error)) : resolve(),
    );
  });
};

/**
 * Check if voice recognition is available
 */
export const checkVoiceRecognitionAvailable = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    VoiceModule.isSpeechAvailable((isAvailable: number, error?: string) => {
      error ? reject(new Error(error)) : resolve(Boolean(isAvailable));
    });
  });
};
