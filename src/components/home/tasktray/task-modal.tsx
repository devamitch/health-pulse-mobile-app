import { BlurView } from '@react-native-community/blur';
import React from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import TaskCard from './task-card';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TaskModalProps {
  visible: boolean;
  data: TaskCardData[];
  onClose: () => void;
  onCardPress: (card: TaskCardData, index: number) => void;
  onSwipeLeft?: (card: TaskCardData) => void;
}

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  data,
  onClose,
  onCardPress,
  onSwipeLeft,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Simple swipe gesture - up or down closes modal
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateY.value = event.translationY;
      // Fade out as user swipes
      const progress = Math.abs(event.translationY) / 100;
      opacity.value = Math.max(0.5, 1 - progress);
    })
    .onEnd(event => {
      const shouldClose =
        Math.abs(event.translationY) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityY) > VELOCITY_THRESHOLD;

      if (shouldClose) {
        // Close modal
        translateY.value = withTiming(
          event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
          { duration: 250 },
        );
        opacity.value = withTiming(0, { duration: 250 });
        runOnJS(onClose)();
      } else {
        // Reset position
        translateY.value = withSpring(0, { damping: 20, stiffness: 120 });
        opacity.value = withSpring(1, { damping: 20, stiffness: 120 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.5, 1], [0, 1]),
  }));

  React.useEffect(() => {
    if (visible) {
      translateY.value = 0;
      opacity.value = 1;
    }
  }, [visible]);

  const width = useWindowDimensions().width;
  return (
    <Modal
      isVisible={visible}
      onDismiss={onClose}
      statusBarTranslucent
      style={{ width }}
    >
      {/* Backdrop with blur */}
      <View style={[StyleSheet.absoluteFill]}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="light"
          blurAmount={Platform.OS === 'ios' ? 15 : 8}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.9)"
        />
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
        />
      </View>

      {/* Modal Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              paddingTop: insets.top + 100,
              paddingBottom: insets.bottom + 20,
            },
            animatedStyle,
          ]}
        >
          {/* Scrollable Cards */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="never"
          >
            {data.map((card, index) => (
              <View key={card.id} style={styles.cardWrapper}>
                <Pressable onPress={() => onCardPress(card, index)}>
                  <TaskCard
                    data={card}
                    onSwipeLeft={() => onSwipeLeft?.(card)}
                    marginHorizontal={24}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
};

export default TaskModal;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  handleContainer: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  handleBar: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingVertical: 8,
  },
  cardWrapper: {
    // Additional styling if needed
  },
});
