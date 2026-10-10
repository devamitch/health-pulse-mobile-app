import BlurView from '@/components/base/BlurView';
import { QuestCompletedModal } from '@/components/modals/quest_completed_modal';
import useGameProgression from '@/hooks/useGameProgression';
import { logButtonTap } from '@/services/analyticsService';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { sortTasksByNearestTime } from '@/utils/gamification/task-sorter';
import { Toast } from '@/utils/toast';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView as GHScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCardData } from '../types';
import HomeContent from './home-content';
import TaskCard from './task-card';
import {
  CATEGORY_TO_TASK_TYPE,
  getActivityScannerParams,
} from './task-tray-card';

const HEADER_BASE_HEIGHT = 220;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 500;
const FADE_DURATION = 200;

interface SwipeableCardProps {
  card: TaskCardData;
  index: number;
  onPress: (card: TaskCardData, index: number) => void;
  onDismiss: () => void;
  globalOpacity: Animated.SharedValue<number>;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  card,
  index,
  onPress,
  onDismiss,
  globalOpacity,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const dismissCard = useCallback(() => {
    'worklet';
    // Smooth fade out
    globalOpacity.value = withTiming(
      0,
      {
        duration: FADE_DURATION,
        easing: Easing.out(Easing.ease),
      },
      finished => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      },
    );
  }, [onDismiss, globalOpacity]);

  const cardPanGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-20, 20])
    .onUpdate(event => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
        scale.value = interpolate(
          event.translationY,
          [0, -150],
          [1, 0.92],
          Extrapolate.CLAMP,
        );

        // Fade as swiping
        globalOpacity.value = interpolate(
          event.translationY,
          [0, -SCREEN_HEIGHT / 2],
          [1, 0],
          Extrapolate.CLAMP,
        );
      }
    })
    .onEnd(event => {
      const shouldDismiss =
        event.translationY < -SWIPE_THRESHOLD ||
        event.velocityY < -VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        dismissCard();
      } else {
        // Smooth spring back
        translateY.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
        globalOpacity.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = Math.max(0.7, Math.min(1.3, event.scale));
    })
    .onEnd(() => {
      if (scale.value < 0.85) {
        dismissCard();
      } else {
        scale.value = withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
      }
    });

  const combinedGesture = Gesture.Simultaneous(cardPanGesture, pinchGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const handleCardPress = useCallback(() => {
    onPress(card, index);
  }, [card, index, onPress]);

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[animatedCardStyle]}>
        <Pressable
          style={{ marginHorizontal: 24, marginBottom: 16 }}
          onPress={handleCardPress}
        >
          <TaskCard data={card} marginHorizontal={0} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

interface ExpandedScreenModalProps {
  visible: boolean;
  onClose: () => void;
  userData: any;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  truncateUsername: (name: string) => string;
}

const ExpandedScreenModal: React.FC<ExpandedScreenModalProps> = ({
  visible,
  onClose,
  userData,
  onNotificationPress,
  onProfilePress,
  truncateUsername,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { tasks, handleTaskPress } = useGameProgression();
  const dispatch = useAppDispatch();

  const { userProfile } = useAppSelector(state => state.gameProgression);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    questName: '',
    questType: 'activity' as 'activity' | 'diet' | 'stress',
    xpGained: 0,
  });

  // Single opacity control for entire modal
  const globalOpacity = useSharedValue(1);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      globalOpacity.value = withTiming(1, {
        duration: FADE_DURATION,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible]);

  // JS close function
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Smooth close animation
  const closeModalSmooth = useCallback(() => {
    'worklet';
    globalOpacity.value = withTiming(
      0,
      {
        duration: FADE_DURATION,
        easing: Easing.out(Easing.ease),
      },
      finished => {
        if (finished) {
          runOnJS(handleClose)();
        }
      },
    );
  }, [handleClose, globalOpacity]);

  // Screen pan gesture - only for background
  const screenPanGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-20, 20])
    .onUpdate(event => {
      if (event.translationY < 0) {
        globalOpacity.value = interpolate(
          event.translationY,
          [0, -SCREEN_HEIGHT / 2],
          [1, 0],
          Extrapolate.CLAMP,
        );
      }
    })
    .onEnd(event => {
      const shouldDismiss =
        event.translationY < -SWIPE_THRESHOLD ||
        event.velocityY < -VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        closeModalSmooth();
      } else {
        globalOpacity.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  // Animated style
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: globalOpacity.value,
    };
  });

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    closeModalSmooth();
  }, [closeModalSmooth]);

  // Segregate tasks by category
  const categorizedTasks = useMemo(() => {
    const activityTasks = sortTasksByNearestTime(
      tasks.filter(task => task.category === 'activity' && !task.isDone),
    );
    const dietTasks = sortTasksByNearestTime(
      tasks.filter(task => task.category === 'diet' && !task.isDone),
    );
    const stressTasks = sortTasksByNearestTime(
      tasks.filter(task => task.category === 'stress' && !task.isDone),
    );

    return {
      activity: activityTasks[0] || null,
      diet: dietTasks[0] || null,
      stress: stressTasks[0] || null,
      allActivity: activityTasks,
      allDiet: dietTasks,
      allStress: stressTasks,
    };
  }, [tasks]);

  const data: TaskCardData[] = useMemo(() => {
    if (!categorizedTasks) {
      return [];
    }

    const cards: TaskCardData[] = [];

    // Activity Quest
    const activityTask = categorizedTasks.activity;
    const allActivityDone = categorizedTasks.allActivity.length === 0;

    cards.push({
      ...activityTask,
      id: activityTask?.id || 'activity-completed',
      title: 'Activity Quest',
      subtitle: 'Ignite your energy with a short burst of movement',
      duration: allActivityDone
        ? 'All tasks completed'
        : activityTask?.title || 'No tasks available',
      buttonText: allActivityDone
        ? 'Completed!'
        : `Earn ${activityTask?.coins || 0}+ XP`,
      image: require('@/assets/images/activity-quest.png'),
      accentColor: '#C63F2C',
      category: 'power',
      task: activityTask,
      completed: allActivityDone,
    });

    // Diet Quest
    const dietTask = categorizedTasks.diet;
    const allDietDone = categorizedTasks.allDiet.length === 0;

    cards.push({
      ...dietTask,
      id: dietTask?.id || 'diet-completed',
      title: 'Diet Quest',
      subtitle: 'Prime your system with a clean, mindful intake',
      duration: allDietDone
        ? 'All tasks completed'
        : dietTask?.title || 'No tasks available',
      buttonText: allDietDone
        ? 'Completed!'
        : `Earn ${dietTask?.coins || 0}+ XP`,
      image: require('@/assets/images/diet-quest.png'),
      accentColor: '#1E8F57',
      category: 'fuel',
      task: dietTask,
      completed: allDietDone,
    });

    // Calm Quest
    const stressTask = categorizedTasks.stress;
    const allStressDone = categorizedTasks.allStress.length === 0;

    cards.push({
      id: stressTask?.id || 'stress-completed',
      title: 'Calm Quest',
      subtitle: 'Calm your breath for a short focus reset',
      duration: allStressDone
        ? 'All tasks completed'
        : stressTask?.title || 'No tasks available',
      buttonText: allStressDone
        ? 'Completed!'
        : `Earn ${stressTask?.coins || 0}+ XP`,
      image: require('@/assets/images/calm-quest.png'),
      accentColor: '#7C60C8',
      category: 'calm',
      task: stressTask,
      completed: allStressDone,
    });

    return cards;
  }, [categorizedTasks]);

  const handleCardPress = useCallback(
    async (card: TaskCardData, index: number) => {
      console.log('[Modal] Quest card pressed:', card.title);
      await logButtonTap(`Quest Card Pressed: ${card.title}`);

      if (card.completed) {
        Toast.info('All tasks in this category are completed!');
        return;
      }

      if (!card.task) {
        Toast.info('No task available for this category');
        return;
      }

      const taskType = CATEGORY_TO_TASK_TYPE[card.title];

      if (!taskType) {
        console.error('Unknown card title:', card.title);
        return;
      }

      const params = getActivityScannerParams(card, taskType);

      console.log('[Modal] Navigating to Activity with params:', params);

      // Smooth close first
      globalOpacity.value = withTiming(0, {
        duration: FADE_DURATION,
        easing: Easing.out(Easing.ease),
      });

      // Close modal and navigate
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          if (navigation?.navigate) {
            navigation.navigate('ActivityScanner', params);
          }
        }, 50);
      }, FADE_DURATION);
    },
    [navigation, onClose, globalOpacity],
  );

  const handleTaskCompleteWithModal = useCallback(
    (task: TaskCardData) => {
      try {
        let questType: 'activity' | 'diet' | 'stress' = 'activity';
        if (task.title === 'Diet Quest') questType = 'diet';
        else if (task.title === 'Calm Quest') questType = 'stress';

        setCompletionData({
          questName: task.title || task.title || 'any',
          questType,
          xpGained: task.coins || 20,
        });

        setShowCompletedModal(true);
        try {
          handleTaskPress(task);
        } catch {}
      } catch {}
    },
    [handleTaskPress],
  );

  const handleModalCloseInternal = useCallback(() => {
    setShowCompletedModal(false);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BlurView style={{ flex: 1 }} blurAmount={20}>
          <GestureDetector gesture={screenPanGesture}>
            <Animated.View style={[styles.fullScreen, animatedContainerStyle]}>
              {/* Header */}
              <View style={styles.container} pointerEvents="box-none">
                <View
                  style={[
                    styles.headerBackground,
                    {
                      height: HEADER_BASE_HEIGHT,
                      backgroundColor: '#1857C1',
                      paddingTop: insets.top,
                    },
                  ]}
                />

                <HomeContent
                  {...{
                    userData,
                    onNotificationPress,
                    onProfilePress,
                    truncateUsername,
                    navigation,
                  }}
                />
              </View>

              {/* Scrollable Cards */}
              <GHScrollView
                style={[
                  styles.scrollView,
                  {
                    top: insets.top + 90,
                  },
                ]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEventThrottle={1}
                simultaneousHandlers={screenPanGesture}
              >
                {/* Top spacing - tappable */}
                <Pressable onPress={handleBackdropPress}>
                  <View style={{ height: 12 }} />
                </Pressable>

                {data.map((card, index) => (
                  <View key={card.id}>
                    {index > 0 && (
                      <Pressable onPress={handleBackdropPress}>
                        <View style={{ height: 4 }} />
                      </Pressable>
                    )}

                    <SwipeableCard
                      card={card}
                      index={index}
                      onPress={handleCardPress}
                      onDismiss={handleClose}
                      globalOpacity={globalOpacity}
                    />
                  </View>
                ))}

                {/* Bottom spacing - tappable */}
                <Pressable onPress={handleBackdropPress}>
                  <View style={{ height: 100 }} />
                </Pressable>
              </GHScrollView>
            </Animated.View>
          </GestureDetector>

          <QuestCompletedModal
            visible={showCompletedModal}
            onClose={handleModalCloseInternal}
            questName={completionData.questName}
            questType={completionData.questType}
            xpGained={completionData.xpGained}
          />
        </BlurView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scrollView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  scrollContent: {
    paddingBottom: 0,
  },
});

export default ExpandedScreenModal;
