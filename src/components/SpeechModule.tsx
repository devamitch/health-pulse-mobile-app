import Voice from '@react-native-voice/voice';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface SpeechModuleProps {
  onSendVoice: (text: string) => Promise<void>;
  onStopVoiceMode?: () => void;
}

const SpeechModule: React.FC<SpeechModuleProps> = ({
  onSendVoice,
  onStopVoiceMode,
}) => {
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(Date.now());
  const voiceTimeout = useRef<NodeJS.Timeout | null>(null);

  const onSpeechStart = useCallback((event: any) => {
    console.log('SpeechModule - Recording started:', event);
  }, []);

  const onSpeechResults = useCallback((event: any) => {
    const text = event.value[0];
    setUserInput(text);
    setLastSpeechTime(Date.now());
  }, []);

  const autoVoiceOptions = {
    EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
    EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
    EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1000,
  };

  const startAutoVoiceListener = useCallback(async () => {
    try {
      Keyboard.dismiss();
      setIsProcessingVoice(false);
      await Voice.start('en-US', autoVoiceOptions);
    } catch (error) {
      console.error('SpeechModule - Error starting voice recognition:', error);
    }
  }, []);

  const stopAutoVoiceListener = useCallback(async () => {
    try {
      if (voiceTimeout.current) {
        clearTimeout(voiceTimeout.current);
        voiceTimeout.current = null;
      }
      await Voice.stop();
      setIsProcessingVoice(false);
    } catch (error) {
      console.error('SpeechModule - Error stopping voice recognition:', error);
    }
  }, []);

  const handleClose = useCallback(async () => {
    await stopAutoVoiceListener();
    Tts.stop();
    if (onStopVoiceMode) {
      onStopVoiceMode();
    }
  }, [onStopVoiceMode, stopAutoVoiceListener]);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (error: any) =>
      console.error('SpeechModule - onSpeechError:', error);
    return () => {
      Voice.destroy().then(() =>
        console.log('SpeechModule - Voice module destroyed'),
      );
    };
  }, [onSpeechStart, onSpeechResults]);

  useEffect(() => {
    Tts.setDefaultVoice('com.apple.ttsbundle.Samantha-compact');
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultPitch(1.0);
    const ttsStartSubscription = (Tts.addEventListener as any)(
      'tts-start',
      () => console.log('SpeechModule - TTS started'),
    );
    const ttsFinishSubscription = (Tts.addEventListener as any)(
      'tts-finish',
      () => console.log('SpeechModule - TTS finished'),
    );
    const ttsCancelSubscription = (Tts.addEventListener as any)(
      'tts-cancel',
      () => console.log('SpeechModule - TTS cancelled'),
    );
    return () => {
      ttsStartSubscription.remove();
      ttsFinishSubscription.remove();
      ttsCancelSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (userInput && Date.now() - lastSpeechTime > 3000) {
        await onSendVoice(userInput);
        setUserInput('');
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userInput, lastSpeechTime, onSendVoice]);

  return (
    <View style={styles.container}>
      <Image
        style={styles.gradientCircleContainer}
        source={require('@/assets/images/chatblob.gif')}
      />
      <View style={styles.dotsContainer}>
        <Image
          style={styles.dotsContainer}
          source={require('@/assets/images/voice_indicator.gif')}
        />
      </View>
      <Text style={styles.text}>
        {isProcessingVoice ? 'Processing' : 'Listening'}
      </Text>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Icon name="close" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gradientCircleContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SpeechModule;
