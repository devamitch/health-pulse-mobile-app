import { BlurView } from '@react-native-community/blur';
import React from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  SlideInUp,
  SlideOutDown,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import TaskCard from './task-card';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExpandedTaskViewProps {
  isExpanded: boolean;
  data: TaskCardData[];
  panGesture: ReturnType<typeof Gesture.Pan>;
  expandProgress: SharedValue<number>;
  headerHeight: number;
  onClose: () => void;
  onCardPress: (card: TaskCardData, index: number) => void;
  onSwipeLeft?: (card: TaskCardData) => void;
  userData: any;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  truncateUsername: (name: string) => string;
  navigation?: any;
}

const ExpandedTaskView: React.FC<ExpandedTaskViewProps> = ({
  isExpanded,
  data,
  panGesture,
  expandProgress,
  headerHeight,
  onClose,
  onCardPress,
  onSwipeLeft,
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 1], [0, 1]),
  }));

  const expandedContainerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 0.3, 1], [0, 0.5, 1]),
    transform: [
      {
        translateY: interpolate(expandProgress.value, [0, 1], [50, 0]),
      },
      {
        scale: interpolate(expandProgress.value, [0, 1], [0.95, 1]),
      },
    ],
  }));

  if (!isExpanded) return null;

  return (
    <>
      {/* <HomeContent
        {...{
          userData,
          onNotificationPress,
          onProfilePress,
          truncateUsername,
          navigation,
        }}
      /> */}
      {/* Blur Background with Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            position: 'absolute',
            top: 0,

            left: 0,
            right: 0,
            bottom: 0,
            // top: headerHeight,
            zIndex: 1,
            overflow: 'hidden',
          },
          blurStyle,
        ]}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={Platform.OS === 'ios' ? 15 : 8}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.9)"
        />
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
        />
      </Animated.View>

      {/* Cards Container */}
      <Animated.View
        style={[
          styles.expandedContainer,
          {
            top: headerHeight,
            maxHeight: SCREEN_HEIGHT - headerHeight - insets.bottom,
            zIndex: 12000,
          },
          expandedContainerStyle,
        ]}
      >
        {/* Scrollable Cards */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={true}
        >
          {data.map((card, index) => (
            <Animated.View
              key={card.id}
              entering={SlideInUp.delay(index * 60)
                .duration(500)
                .springify()
                .damping(15)
                .stiffness(100)}
              exiting={SlideOutDown.duration(250)}
            >
              <Animated.View
                entering={FadeIn.delay(index * 80 + 50).duration(300)}
                exiting={FadeOut.duration(200)}
              >
                <Pressable
                  onPress={() => onCardPress(card, index)}
                  style={styles.expandedCard}
                >
                  <TaskCard
                    data={card}
                    onSwipeLeft={() => onSwipeLeft?.(card)}
                    marginHorizontal={24}
                  />
                </Pressable>
              </Animated.View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Gesture Handle at Bottom */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={styles.gestureHandle}
            entering={FadeIn.delay(300).duration(200)}
            exiting={FadeOut.duration(150)}
          >
            <View style={styles.handleBar} />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </>
  );
};

export default ExpandedTaskView;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  expandedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1001,
    // paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  gestureHandle: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 60,
  },
  expandedCard: {
    // Additional styling if needed
  },
});
