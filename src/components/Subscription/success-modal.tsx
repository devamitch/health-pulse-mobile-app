'use client';

import { BlurView } from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import type React from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from './colors';

type SuccessModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const { height } = Dimensions.get('window');

const SuccessModal: React.FC<SuccessModalProps> = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Create animated styles with proper transform syntax
  const animatedStyles = {
    transform: [{ scale }],
    opacity,
  };

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.4}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
      style={styles.modal}
      customBackdrop={
        <View style={styles.backdropContainer}>
          <BlurView
            style={styles.backdropBlur}
            blurType="dark"
            blurAmount={Platform.OS === 'ios' ? 10 : 25}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.6)"
          />
        </View>
      }
    >
      <Animated.View
        style={[
          styles.container,
          animatedStyles,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 24,
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <LottieView
            source={require('@/assets/animations/success.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />

          <Text style={styles.title}>Subscription Activated!</Text>

          <Text style={styles.message}>
            Welcome to premium! You now have access to all advanced features and
            personalized health insights.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Start Exploring</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropContainer: {
    flex: 1,
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  animation: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SuccessModal;
