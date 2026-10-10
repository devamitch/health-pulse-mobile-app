import LinearGradient from '@/components/base/LinearGradient';
import { ComparisonCard } from '@/components/home/activityProgress/comparison-card';
import {
  CATEGORY_TO_TASK_TYPE,
  getActivityScannerParams,
} from '@/components/home/tasktray/task-tray-card';
import BackButton from '@/components/ui/buttons/back-button';
import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import useGameProgression from '@/hooks/useGameProgression';
import { ProgressType } from '@/types/home/activityProgress';
import { Task } from '@/utils/gamification/game-plan-generator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, SvgProps } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function SvgComponent({
  color,
  size = 191,
  ...props
}: SvgProps & { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={'0 0 191 191'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Circle
        opacity={0.64}
        cx={95.5007}
        cy={95.4978}
        r={70.4353}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.1 16"
      />
      <Circle
        opacity={0.32}
        cx={95.5017}
        cy={95.5008}
        r={80.3093}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.1 24"
      />
      <Circle
        opacity={0.16}
        cx={95.5}
        cy={95.5}
        r={91.5}
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.1 32"
      />
    </Svg>
  );
}

export const getGamingDesign = (Colors: ColorScheme) => ({
  colors: {
    diet: {
      primary: Colors.isDark ? '#4ADE80' : '#16A34A',
      gradient: Colors.isDark
        ? (['#86EFAC', '#4ADE80', '#22C55E'] as [string, string, string])
        : (['#86EFAC', '#4ADE80', '#16A34A'] as [string, string, string]),
    },
    activity: {
      primary: Colors.isDark ? '#F87171' : '#DC2626',
      gradient: Colors.isDark
        ? (['#FCA5A5', '#F87171', '#EF4444'] as [string, string, string])
        : (['#FCA5A5', '#EF4444', '#DC2626'] as [string, string, string]),
    },
    stress: {
      primary: Colors.isDark ? '#A78BFA' : '#7C3AED',
      gradient: Colors.isDark
        ? (['#C4B5FD', '#A78BFA', '#8B5CF6'] as [string, string, string])
        : (['#DDD6FE', '#A78BFA', '#7C3AED'] as [string, string, string]),
    },
    gaming: {
      cardBg: Colors.surface,
      border: Colors.border,
      text: Colors.textColor,
      textSecondary: Colors.textSecondary,
      textTertiary: Colors.textTertiary,
    },
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  typography: {
    title: {
      fontSize: 26,
      fontFamily: FONT_FAMILIES.nunitoBold,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    caption: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
  },
  radius: {
    md: 16,
    lg: 18,
    xl: 22,
    full: 9999,
  },
  shadow: {
    soft: {
      shadowColor: Colors.isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Colors.isDark ? 0.3 : 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  },
});

interface ProgressSummaryRouteParams {
  type: ProgressType;
}

const CATEGORY_CONFIG: Record<ProgressType, { title: string; icon: string }> = {
  diet: {
    title: 'Diet Quest',
    icon: 'food-apple',
  },
  activity: {
    title: 'Activity Quest',
    icon: 'run-fast',
  },
  stress: {
    title: 'Calm Quest',
    icon: 'meditation',
  },
};

const TYPE_COLORS: Record<
  ProgressType,
  {
    gradientStart: string;
    gradientEnd: string;
    circleText: string;
  }
> = {
  diet: {
    gradientStart: 'rgba(226, 248, 239, 1)',
    gradientEnd: 'rgba(226, 248, 239, 0)',
    circleText: '#27A864',
  },
  activity: {
    gradientStart: 'rgba(247, 227, 229, 1)',
    gradientEnd: 'rgba(247, 227, 229, 0)',
    circleText: 'rgba(198, 63, 44, 1)',
  },
  stress: {
    gradientStart: 'rgba(235, 225, 250, 1)',
    gradientEnd: 'rgba(235, 225, 250, 0)',
    circleText: 'rgba(124, 96, 200, 1)',
  },
};

interface QuestItemProps extends Task {
  icon: string;
  title: string;
  description: string;
  completed: boolean;
  coins: number;
  color: string;
  gradientColors: [string, string, string];
  index: number;
  Colors: ColorScheme;
  DESIGN: ReturnType<typeof getGamingDesign>;
}

const QuestItem: React.FC<QuestItemProps> = ({
  icon,
  title,
  description,
  completed,
  coins,
  color,
  gradientColors,
  index,
  Colors,
  DESIGN,
  ...props
}) => {
  const navigation = useNavigation();
  const taskType = CATEGORY_TO_TASK_TYPE[title];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
  }));

  const onPress = () => {
    try {
      const params = getActivityScannerParams(
        {
          ...props,
          icon,
          title,
          description,
          completed,
          coins,
          color,
          gradientColors,
        },
        taskType,
      );
      navigation.navigate('ActivityScanner', params);
    } catch {}
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 60).springify()}
      style={[{ marginBottom: DESIGN.spacing.sm }, animatedStyle]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View
          style={{
            backgroundColor: DESIGN.colors.gaming.cardBg,
            borderRadius: DESIGN.radius.lg,
            padding: DESIGN.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: completed ? color + '30' : Colors.border,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: DESIGN.radius.md,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: DESIGN.spacing.md,
              backgroundColor: completed
                ? color + '20'
                : Colors.isDark
                ? Colors.surfaceHover
                : Colors.greyColor100,
            }}
          >
            <Icon
              name={completed ? 'check-circle' : 'circle-outline'}
              size={22}
              color={completed ? color : Colors.textTertiary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                DESIGN.typography.body,
                {
                  color: completed
                    ? DESIGN.colors.gaming.textSecondary
                    : DESIGN.colors.gaming.text,
                  textDecorationLine: completed ? 'line-through' : 'none',
                  fontFamily: FONT_FAMILIES.nunitoSemiBold,
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                DESIGN.typography.caption,
                { color: DESIGN.colors.gaming.textTertiary, marginTop: 2 },
              ]}
            >
              {description}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: DESIGN.radius.full,
              minWidth: 55,
              alignItems: 'center',
              backgroundColor: completed
                ? color + '20'
                : Colors.isDark
                ? Colors.surfaceHover
                : Colors.greyColor100,
            }}
          >
            <Text
              style={[
                DESIGN.typography.caption,
                {
                  color: completed ? color : DESIGN.colors.gaming.textSecondary,
                  fontFamily: FONT_FAMILIES.nunitoSemiBold,
                  fontSize: 12,
                },
              ]}
            >
              +{coins}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProgressSummaryInteractive: React.FC = () => {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ params: ProgressSummaryRouteParams }, 'params'>>();
  const insets = useSafeAreaInsets();

  const type: ProgressType = route.params?.type || 'diet';
  const config = CATEGORY_CONFIG[type];

  const { Colors } = useAppTheme();
  const DESIGN = useMemo(() => getGamingDesign(Colors), [Colors]);
  const theme = DESIGN.colors[type];

  const {
    tasks,
    dietProgress,
    activityProgress,
    stressProgress,
    completedDietTasksCount,
    completedActivityTasksCount,
    completedStressTasksCount,
    loading,
  } = useGameProgression();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -8],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const progressData = useMemo(() => {
    switch (type) {
      case 'diet':
        return {
          progress: dietProgress,
          completed: completedDietTasksCount,
          total: tasks.filter(t => t.category === 'diet').length || 5,
          remaining: Math.max(
            0,
            (tasks.filter(t => t.category === 'diet').length || 5) -
              completedDietTasksCount,
          ),
        };
      case 'activity':
        return {
          progress: activityProgress,
          completed: completedActivityTasksCount,
          total: tasks.filter(t => t.category === 'activity').length || 5,
          remaining: Math.max(
            0,
            (tasks.filter(t => t.category === 'activity').length || 5) -
              completedActivityTasksCount,
          ),
        };
      case 'stress':
        return {
          progress: stressProgress,
          completed: completedStressTasksCount,
          total: tasks.filter(t => t.category === 'stress').length || 5,
          remaining: Math.max(
            0,
            (tasks.filter(t => t.category === 'stress').length || 5) -
              completedStressTasksCount,
          ),
        };
      default:
        return {
          progress: 0,
          completed: 0,
          total: 5,
          remaining: 5,
        };
    }
  }, [
    type,
    dietProgress,
    activityProgress,
    stressProgress,
    completedDietTasksCount,
    completedActivityTasksCount,
    completedStressTasksCount,
    tasks,
  ]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => task.category === type)
      .map(task => ({
        ...task,
        icon: config.icon,
      }));
  }, [tasks, type, config.icon]);

  const yesterdayProgress = useMemo(() => {
    return Math.max(0, progressData.progress - 0.15);
  }, [progressData.progress]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.backgroundColor,
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={[
            DESIGN.typography.body,
            { color: Colors.textSecondary, marginTop: 16 },
          ]}
        >
          Loading your {type} progress...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[styles.container, { backgroundColor: Colors.backgroundColor }]}
      >
        <Animated.View style={styles.fixedHeaderGradient}>
          <LinearGradient
            colors={[
              TYPE_COLORS[type].gradientStart,
              TYPE_COLORS[type].gradientEnd,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + 12 },
            headerAnimatedStyle,
          ]}
        >
          <BackButton
            onPress={handleBackPress}
            iconColor="rgba(128, 128, 128, 1)"
          />
          <Text style={[styles.headerTitle, { color: Colors.textColor }]}>
            {config.title}
          </Text>
          <View style={{ width: 50, height: 50 }} />
        </Animated.View>

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + DESIGN.spacing.xxl,
          }}
        >
          <View style={styles.introContainer}>
            <Text style={[styles.greetingText, { color: Colors.textColor }]}>
              Great Job! 🎉
            </Text>
            <Text style={[styles.greetingSubText, { color: Colors.textColor }]}>
              Your Daily Quests Almost Done!
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <View
              style={{
                marginHorizontal: DESIGN.spacing.md,
                borderRadius: DESIGN.radius.xl,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  padding: DESIGN.spacing.sm,
                  paddingTop: 0,
                  paddingBottom: DESIGN.spacing.xxl,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 183,
                    height: 183,
                    borderRadius: 183 / 2,
                    marginVertical: 24,
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <SvgComponent
                      color={TYPE_COLORS[type].circleText}
                      size={183}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: FONT_FAMILIES.nunitoMedium,
                      color: TYPE_COLORS[type].circleText,
                      fontSize: 60,
                      zIndex: 1,
                    }}
                  >
                    {Math.round(progressData.progress * 100)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    padding: DESIGN.spacing.xs,
                  }}
                >
                  {[
                    { label: 'Completed', value: progressData.completed },
                    { label: 'Remaining', value: progressData.remaining },
                    { label: 'Total', value: progressData.total },
                  ].map((stat, idx) => (
                    <View
                      key={idx}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderLeftWidth: idx > 0 ? 1 : 0,
                        borderLeftColor: 'rgba(231, 229, 228, 1)',
                      }}
                    >
                      <Text
                        style={[
                          DESIGN.typography.title,
                          { color: Colors.textColor, fontSize: 20 },
                        ]}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          color: '#57534E',
                          fontFamily: FONT_FAMILIES.nunitoRegular,
                          marginTop: 2,
                          fontSize: 14,
                        }}
                      >
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>

          <ComparisonCard
            yesterdayProgress={yesterdayProgress}
            todayProgress={progressData.progress}
            color={theme.primary}
            gradientColors={theme.gradient}
            Colors={Colors}
            DESIGN={DESIGN}
          />

          <View
            style={{
              marginHorizontal: DESIGN.spacing.lg,
              marginBottom: DESIGN.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: DESIGN.spacing.md,
              }}
            >
              <Icon
                name="clipboard-check"
                size={20}
                color={theme.primary}
                style={{ marginRight: DESIGN.spacing.xs }}
              />
              <Text
                style={[
                  DESIGN.typography.subtitle,
                  { color: DESIGN.colors.gaming.text, flex: 1 },
                ]}
              >
                Today's Quests
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: DESIGN.radius.full,
                  backgroundColor: theme.primary + '20',
                }}
              >
                <Text
                  style={[DESIGN.typography.caption, { color: theme.primary }]}
                >
                  {progressData.completed}/{progressData.total}
                </Text>
              </View>
            </View>

            {filteredTasks.length > 0 ? (
              filteredTasks.map((quest, idx) => (
                <QuestItem
                  {...quest}
                  key={quest.id}
                  icon={quest.icon}
                  title={quest.title}
                  description={quest.description || 'Complete'}
                  completed={quest.isDone}
                  coins={quest.coins || 50}
                  color={theme.primary}
                  gradientColors={theme.gradient}
                  index={idx}
                  Colors={Colors}
                  DESIGN={DESIGN}
                />
              ))
            ) : (
              <View
                style={{
                  backgroundColor: DESIGN.colors.gaming.cardBg,
                  borderRadius: DESIGN.radius.lg,
                  padding: DESIGN.spacing.xl,
                  alignItems: 'center',
                  borderColor: Colors.border,
                  ...DESIGN.shadow.soft,
                }}
              >
                <Icon
                  name="clipboard-text-outline"
                  size={44}
                  color={theme.primary}
                  style={{ opacity: 0.4, marginBottom: 12 }}
                />
                <Text
                  style={[
                    DESIGN.typography.body,
                    {
                      color: DESIGN.colors.gaming.textSecondary,
                      textAlign: 'center',
                    },
                  ]}
                >
                  No Quests available. Generate a plan to get started!
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              margin: DESIGN.spacing.lg,
              borderRadius: DESIGN.radius.lg,
              overflow: 'hidden',
            }}
          >
            <Image
              source={require('@/assets/images/mock-comingsoon.png')}
              style={{
                width: '100%',
                height: undefined,
                aspectRatio: 1,
              }}
              resizeMode="contain"
            />
          </View>
        </Animated.ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  fixedHeaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    zIndex: 0,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
  },
  introContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginVertical: 12,
  },
  greetingText: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    lineHeight: 20,
  },
  greetingSubText: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    lineHeight: 20,
  },
});

export default ProgressSummaryInteractive;
