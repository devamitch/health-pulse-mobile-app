import { useAppTheme } from '@/hooks/themeHook';
import { TaskData, TaskDetailNavigationProp } from '@/navigation/types';
import { logButtonTap } from '@/services/analyticsService';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TaskDetailScreenProps {
  navigation: TaskDetailNavigationProp;
  route: {
    params: {
      taskId: string;
      task: TaskData;
      category: string;
    };
  };
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { task } = route.params;
  const { Colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const scrollY = useSharedValue(0);
  const progressValue = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Calculate progress
  useEffect(() => {
    const totalSteps = task.steps?.length || 0;
    const completed = completedSteps.size;
    const newProgress = totalSteps > 0 ? (completed / totalSteps) * 100 : 0;
    progressValue.value = withSpring(newProgress);
  }, [completedSteps, task.steps]);

  const handleStepToggle = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  const handleCompleteTask = useCallback(async () => {
    await logButtonTap(`Complete Task: ${task.title}`);
    // Navigate back and trigger completion modal
    navigation.goBack();
    // Trigger TaskCompletedModal from parent
  }, [task.title, navigation]);

  const headerStyle = useAnimatedStyle(() => {
    const opacity = withTiming(scrollY.value > 50 ? 1 : 0);
    return { opacity };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  const allStepsCompleted =
    task.steps && completedSteps.size === task.steps.length;

  return (
    <View
      style={[styles.container, { backgroundColor: Colors.backgroundColor }]}
    >
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: task.accentColor },
          headerStyle,
        ]}
      >
        <RectButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </RectButton>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.headerRight} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[
            styles.heroSection,
            { backgroundColor: task.backgroundColor },
          ]}
        >
          <View style={styles.heroContent}>
            {task.illustration && (
              <View style={styles.illustration}>{task.illustration}</View>
            )}
            <View style={styles.heroTextContainer}>
              <Text style={[styles.taskTitle, { color: task.accentColor }]}>
                {task.title}
              </Text>
              <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              <View style={styles.taskMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color={task.accentColor}
                  />
                  <Text style={styles.metaText}>{task.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Image
                    source={require('@/assets/images/coin-2.png')}
                    style={styles.coinIcon}
                  />
                  <Text style={styles.metaText}>+{task.xpReward} XP</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        {task.steps && task.steps.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.progressSection}
          >
            <View style={styles.progressHeader}>
              <Text style={[styles.sectionTitle, { color: Colors.textColor }]}>
                Progress
              </Text>
              <Text style={styles.progressText}>
                {completedSteps.size} / {task.steps.length} completed
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { backgroundColor: task.accentColor },
                  progressStyle,
                ]}
              />
            </View>
          </Animated.View>
        )}

        {/* Description */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: Colors.textColor }]}>
            About This Task
          </Text>
          <Text style={[styles.description, { color: Colors.textColor }]}>
            {task.description}
          </Text>
        </Animated.View>

        {/* Steps */}
        {task.steps && task.steps.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: Colors.textColor }]}>
              Steps to Complete
            </Text>
            <View style={styles.stepsContainer}>
              {task.steps.map((step, index) => (
                <Animated.View
                  key={step.id}
                  entering={SlideInRight.delay(500 + index * 100).duration(400)}
                >
                  <RectButton
                    onPress={() => handleStepToggle(step.id)}
                    style={[
                      styles.stepItem,
                      {
                        backgroundColor: Colors.white,
                        borderColor: completedSteps.has(step.id)
                          ? task.accentColor
                          : Colors.greyColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.stepCheckbox,
                        {
                          borderColor: task.accentColor,
                          backgroundColor: completedSteps.has(step.id)
                            ? task.accentColor
                            : 'transparent',
                        },
                      ]}
                    >
                      {completedSteps.has(step.id) && (
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: Colors.textColor },
                          completedSteps.has(step.id) &&
                            styles.stepTitleCompleted,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepDescription}>
                        {step.description}
                      </Text>
                      {step.duration && (
                        <Text style={styles.stepDuration}>{step.duration}</Text>
                      )}
                    </View>
                  </RectButton>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Benefits */}
        {task.benefits && task.benefits.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: Colors.textColor }]}>
              Benefits
            </Text>
            <View style={styles.benefitsContainer}>
              {task.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={task.accentColor}
                  />
                  <Text
                    style={[styles.benefitText, { color: Colors.textColor }]}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Tips */}
        {task.tips && task.tips.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: Colors.textColor }]}>
              Pro Tips
            </Text>
            <View style={styles.tipsContainer}>
              {task.tips.map((tip, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipItem,
                    { backgroundColor: task.backgroundColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lightbulb-on"
                    size={20}
                    color={task.accentColor}
                  />
                  <Text style={[styles.tipText, { color: Colors.textColor }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Complete Button */}
      <Animated.View
        entering={FadeIn.delay(800).duration(600)}
        style={[
          styles.completeButtonContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <RectButton
          onPress={handleCompleteTask}
          enabled={allStepsCompleted}
          style={[
            styles.completeButton,
            { opacity: allStepsCompleted ? 1 : 0.5 },
          ]}
        >
          <LinearGradient
            colors={[task.accentColor, task.accentColor + 'CC']}
            style={styles.completeButtonGradient}
          >
            <Text style={styles.completeButtonText}>
              {allStepsCompleted ? 'Complete Task' : 'Complete All Steps First'}
            </Text>
            <Image
              source={require('@/assets/images/coin-2.png')}
              style={styles.completeButtonIcon}
            />
          </LinearGradient>
        </RectButton>
      </Animated.View>
    </View>
  );
};

// @/screens/home/task-detail-screen.tsx (continued)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  heroSection: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  illustration: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  taskSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  coinIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.3,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    lineHeight: 24,
    marginTop: 12,
  },
  stepsContainer: {
    marginTop: 16,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    marginBottom: 4,
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  stepDuration: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#9CA3AF',
    marginTop: 6,
  },
  benefitsContainer: {
    marginTop: 16,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    lineHeight: 22,
  },
  tipsContainer: {
    marginTop: 16,
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    lineHeight: 20,
  },
  completeButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  completeButtonIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default TaskDetailScreen;
