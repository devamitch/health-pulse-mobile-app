import { ColorScheme } from '@/constants/theme';
import { CelebrationEvent } from '@/systems/gamificationEngine';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  event: CelebrationEvent | null;
  onClose: () => void;
  Colors: ColorScheme;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  event,
  onClose,
  Colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible && event) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Run celebration animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after 4 seconds
      const timeout = setTimeout(onClose, 4000);
      return () => clearTimeout(timeout);
    }
  }, [visible, event]);

  if (!event) return null;

  const styles = createStyles(Colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Background Animation Effect */}
        {event.animation === 'confetti' && <ConfettiAnimation />}
        {event.animation === 'fireworks' && <FireworksAnimation />}
        {event.animation === 'sparkles' && <SparklesAnimation />}
        {event.animation === 'stars' && <StarsAnimation />}
        {event.animation === 'rainbow' && <RainbowAnimation />}

        {/* Main Content */}
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Animated.Text
              style={[
                styles.icon,
                {
                  transform: [
                    {
                      rotate: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {event.icon}
            </Animated.Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Message */}
          <Text style={styles.message}>{event.message}</Text>

          {/* Rewards */}
          {event.rewards && event.rewards.length > 0 && (
            <View style={styles.rewardsContainer}>
              {event.rewards.map((reward, index) => (
                <View key={index} style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>{reward.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>AWESOME!</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================================
// ANIMATION COMPONENTS
// ============================================================================

const ConfettiAnimation: React.FC = () => {
  const confetti = Array.from({ length: 30 }, (_, i) => i);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confetti.map((_, index) => (
        <ConfettiPiece key={index} delay={index * 50} />
      ))}
    </View>
  );
};

const ConfettiPiece: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(
    new Animated.Value(Math.random() * SCREEN_WIDTH),
  ).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT + 50,
        duration: 3000 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ),
    ]).start();
  }, []);

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: color,
        transform: [
          { translateX },
          { translateY },
          {
            rotate: rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}
    />
  );
};

const FireworksAnimation: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 5 }, (_, i) => (
        <FireworkBurst key={i} delay={i * 300} />
      ))}
    </View>
  );
};

const FireworkBurst: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const x = Math.random() * SCREEN_WIDTH;
    const y = Math.random() * SCREEN_HEIGHT * 0.6;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: Math.random() * SCREEN_WIDTH,
        top: Math.random() * SCREEN_HEIGHT * 0.5,
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFD700',
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

const SparklesAnimation: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 20 }, (_, i) => (
        <Sparkle key={i} delay={i * 100} />
      ))}
    </View>
  );
};

const Sparkle: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ]),
    ).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: Math.random() * SCREEN_WIDTH,
        top: Math.random() * SCREEN_HEIGHT,
        fontSize: 20,
        transform: [{ scale }],
        opacity,
      }}
    >
      ✨
    </Animated.Text>
  );
};

const StarsAnimation: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 15 }, (_, i) => (
        <Star key={i} delay={i * 150} />
      ))}
    </View>
  );
};

const Star: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 4000,
        delay,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1,
          delay,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: Math.random() * SCREEN_WIDTH,
        fontSize: 30,
        transform: [{ translateY }, { scale }],
      }}
    >
      ⭐
    </Animated.Text>
  );
};

const RainbowAnimation: React.FC = () => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        opacity,
      }}
      pointerEvents="none"
    >
      <View style={{ flex: 1, backgroundColor: '#FF0000' }} />
      <View style={{ flex: 1, backgroundColor: '#FF7F00' }} />
      <View style={{ flex: 1, backgroundColor: '#FFFF00' }} />
      <View style={{ flex: 1, backgroundColor: '#00FF00' }} />
      <View style={{ flex: 1, backgroundColor: '#0000FF' }} />
      <View style={{ flex: 1, backgroundColor: '#4B0082' }} />
      <View style={{ flex: 1, backgroundColor: '#9400D3' }} />
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '85%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    iconContainer: {
      marginBottom: 16,
    },
    icon: {
      fontSize: 80,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Nunito-ExtraBold',
      color: Colors.textColor,
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: 1,
    },
    message: {
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.greyColor,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 24,
    },
    rewardsContainer: {
      width: '100%',
      marginBottom: 20,
    },
    rewardItem: {
      backgroundColor: Colors.isDark ? '#2A2A2A' : '#F5F5F5',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      alignItems: 'center',
    },
    rewardLabel: {
      fontSize: 14,
      fontFamily: 'Nunito-Bold',
      color: Colors.primaryColor,
    },
    closeButton: {
      backgroundColor: Colors.primaryColor,
      borderRadius: 24,
      paddingVertical: 14,
      paddingHorizontal: 32,
      width: '100%',
    },
    closeButtonText: {
      fontSize: 16,
      fontFamily: 'Nunito-ExtraBold',
      color: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: 1.5,
    },
  });

export default CelebrationModal;
