import BlurView from '@/components/base/BlurView';
import { QuestCompletedModal } from '@/components/modals/quest_completed_modal';
import useGameProgression from '@/hooks/useGameProgression';
import { logButtonTap } from '@/services/analyticsService';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { sortTasksByNearestTime } from '@/utils/gamification/task-sorter';
import { Toast } from '@/utils/toast';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView as GHScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
const SWIPE_THRESHOLD = 50; // Lower threshold for card swipes
const SCREEN_SWIPE_THRESHOLD = 60; // Screen-level swipe threshold
const VELOCITY_THRESHOLD = 400;
const DISMISS_ANIMATION_DURATION = 250;

interface SwipeableCardProps {
  card: TaskCardData;
  index: number;
  onPress: (card: TaskCardData, index: number) => void;
  onDismiss: () => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  card,
  index,
  onPress,
  onDismiss,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const dismissCard = useCallback(() => {
    'worklet';
    translateY.value = withTiming(
      -SCREEN_HEIGHT,
      { duration: DISMISS_ANIMATION_DURATION },
      finished => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      },
    );
  }, [onDismiss]);

  // Individual card pan gesture
  const cardPanGesture = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-15, 15])
    .onUpdate(event => {
      // Only allow upward swipes
      if (event.translationY < 0) {
        translateY.value = event.translationY;
        // Subtle scale effect
        scale.value = interpolate(
          event.translationY,
          [0, -100],
          [1, 0.95],
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
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        scale.value = withSpring(1);
      }
    });

  // Pinch gesture for additional interaction
  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = Math.max(0.8, Math.min(1.2, event.scale));
    })
    .onEnd(() => {
      if (scale.value < 0.9) {
        // Small pinch dismisses
        dismissCard();
      } else {
        scale.value = withSpring(1);
      }
    });

  // Combine gestures - pan and pinch can work simultaneously
  const combinedGesture = Gesture.Simultaneous(cardPanGesture, pinchGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: interpolate(
        translateY.value,
        [0, -SCREEN_HEIGHT / 2],
        [1, 0],
        Extrapolate.CLAMP,
      ),
    };
  });

  const handleCardPress = useCallback(() => {
    onPress(card, index);
  }, [card, index, onPress]);

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[animatedCardStyle]}>
        <Animated.View
          entering={SlideInUp.delay(index * 60)
            .duration(400)
            .springify()
            .damping(20)
            .stiffness(120)}
          exiting={SlideOutDown.duration(200)}
        >
          <Animated.View
            entering={FadeIn.delay(index * 80 + 50).duration(250)}
            exiting={FadeOut.duration(150)}
          >
            <Pressable
              style={{ marginHorizontal: 24 }}
              onPress={handleCardPress}
            >
              <TaskCard data={card} marginHorizontal={0} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const ExpandedScreen = () => {
  const { userData } = useAppSelector(state => state.user);
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

  // Animated values for smooth gestures
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const backdropOpacity = useSharedValue(0.3);

  const goBackAnimated = useCallback(() => {
    'worklet';
    opacity.value = withTiming(0, { duration: DISMISS_ANIMATION_DURATION });
    backdropOpacity.value = withTiming(0, {
      duration: DISMISS_ANIMATION_DURATION,
    });
    translateY.value = withTiming(
      -SCREEN_HEIGHT,
      { duration: DISMISS_ANIMATION_DURATION },
      finished => {
        if (finished) {
          runOnJS(navigation.goBack)();
        }
      },
    );
  }, [navigation]);

  // Screen-level pan gesture (for areas outside cards)
  const screenPanGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-20, 20])
    .onUpdate(event => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(
          event.translationY,
          [0, -SCREEN_HEIGHT / 3],
          [0.3, 0],
          Extrapolate.CLAMP,
        );
      }
    })
    .onEnd(event => {
      const shouldDismiss =
        event.translationY < -SCREEN_SWIPE_THRESHOLD ||
        event.velocityY < -VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        goBackAnimated();
      } else {
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 350,
          mass: 0.5,
        });
        backdropOpacity.value = withSpring(0.3);
      }
    });

  // Animated style for the main container
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // Animated backdrop style
  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const truncateUsername = useCallback((name: string): string => {
    return name?.split(' ')[0] || 'User';
  }, []);

  const profilehandle = useCallback(async () => {
    await logButtonTap('View Profile');
    navigation.navigate('Profile');
  }, [navigation]);

  const notificationHandle = useCallback(async () => {
    await logButtonTap('View Roadmap');
    navigation.navigate('RoadMap', { currentLevel: 5 });
  }, [navigation]);

  // Handle backdrop press (clicking outside cards)
  const handleBackdropPress = useCallback(() => {
    goBackAnimated();
  }, [goBackAnimated]);

  // Segregate tasks by category and get latest incomplete task for each
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

    // Active Quest (activity category)
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

    // Diet Quest (diet category)
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

    // Mind Quest (stress category)
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
      console.log('[Enhanced] Quest card pressed:', card.title);
      await logButtonTap(`Quest Card Pressed: ${card.title}`);

      // Skip if task is completed
      if (card.completed) {
        Toast.info('All tasks in this category are completed!');
        return;
      }

      // Skip if no task available
      if (!card.task) {
        Toast.info('No task available for this category');
        return;
      }

      // Get the task type from the card title
      const taskType = CATEGORY_TO_TASK_TYPE[card.title];

      if (!taskType) {
        console.error('Unknown card title:', card.title);
        return;
      }

      // Get navigation params for ActivityScanner
      const params = getActivityScannerParams(card, taskType);

      console.log(
        '[Enhanced] Navigating to ActivityScanner with params:',
        params,
      );

      if (navigation?.navigate) {
        navigation.navigate('Activity', params);
      } else {
        console.error('[Enhanced] Navigation object not available');
      }
    },
    [navigation],
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

  const handleModalClose = useCallback(() => {
    setShowCompletedModal(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BlurView style={{ flex: 1 }} blurAmount={20}>
        <GestureDetector gesture={screenPanGesture}>
          <Animated.View style={[{ flex: 1 }, animatedContainerStyle]}>
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
                  onNotificationPress: notificationHandle,
                  onProfilePress: profilehandle,
                  truncateUsername,
                  navigation,
                }}
              />
            </View>

            {/* Scrollable content area */}
            <GHScrollView
              style={[
                StyleSheet.absoluteFillObject,
                {
                  position: 'absolute',
                  top: insets.top + 90,
                  zIndex: 10000,
                },
              ]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              scrollEventThrottle={16}
              simultaneousHandlers={screenPanGesture}
            >
              {/* Top spacing - tappable to dismiss */}
              <Pressable onPress={handleBackdropPress}>
                <View style={{ height: 12 }} />
              </Pressable>

              {data.map((card, index) => (
                <View key={card.id} style={{ zIndex: 1 }}>
                  {/* Gap before card - tappable to dismiss */}
                  {index > 0 && (
                    <Pressable onPress={handleBackdropPress}>
                      <View style={{ height: 16 }} />
                    </Pressable>
                  )}

                  <SwipeableCard
                    card={card}
                    index={index}
                    onPress={handleCardPress}
                    onDismiss={goBackAnimated}
                  />

                  {/* Gap after card - tappable to dismiss */}
                  {index === data.length - 1 && (
                    <Pressable onPress={handleBackdropPress}>
                      <View style={{ height: 80 }} />
                    </Pressable>
                  )}
                </View>
              ))}
            </GHScrollView>
          </Animated.View>
        </GestureDetector>

        <QuestCompletedModal
          visible={showCompletedModal}
          onClose={handleModalClose}
          questName={completionData.questName}
          questType={completionData.questType}
          xpGained={completionData.xpGained}
        />
      </BlurView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
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
  scrollContent: {
    paddingBottom: 0,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
});

export default ExpandedScreen;
