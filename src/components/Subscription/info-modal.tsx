'use client';

import { BlurView } from '@react-native-community/blur';
import type React from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from './colors';

type InfoModalProps = {
  isVisible: boolean;
  title: string;
  content: string;
  onClose: () => void;
  accentColor?: string;
};

const { height } = Dimensions.get('window');

const InfoModal: React.FC<InfoModalProps> = ({
  isVisible,
  title,
  content,
  onClose,
  accentColor = COLORS.primary,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, height, translateY, opacity, scale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.4}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
      style={styles.modal}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      propagateSwipe
      customBackdrop={
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropContainer}>
            <BlurView
              style={styles.backdropBlur}
              blurType="dark"
              blurAmount={Platform.OS === 'ios' ? 10 : 25}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.6)"
            />
          </View>
        </TouchableWithoutFeedback>
      }
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY }, { scale }],
            opacity,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 24,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragIndicator} />

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: accentColor }]}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.content}>{content}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: accentColor }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Got it</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  backdropContainer: {
    flex: 1,
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  contentContainer: {
    marginBottom: 24,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InfoModal;
