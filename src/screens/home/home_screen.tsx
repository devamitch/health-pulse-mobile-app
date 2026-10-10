import BloodDrop from '@/assets/svg/blood-drop.svg';
import Food from '@/assets/svg/food.svg';
import Lotus from '@/assets/svg/lotus.svg';
import Medicine from '@/assets/svg/medicine.svg';
import Night from '@/assets/svg/night.svg';
import { StatusScreenIcon } from '@/assets/svg/status-screen-icon';
import Workout from '@/assets/svg/workout.svg';
import { QuickFeedbackToast } from '@/components/gamification/QuickFeedbackToast';
import { GoalProgressItem } from '@/components/goal-progress-card';
import GoalProgressCard from '@/components/GoalProgressCard';
import HomeActionButton from '@/components/home/action-button';
import HomeHeader from '@/components/home/home-header';
import HomeLayout from '@/components/home/home-layout';
import PriorityVitalsModal from '@/components/home/priority-vital-modal';
import BuildMealModal from '@/components/modals/build-meal-modal';
import BuildWorkoutModal from '@/components/modals/build-workout-modal';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import PlanMessageModal from '@/components/modals/plan-message-modal';
import { TaskCompletedModal } from '@/components/modals/task_completed_modal';
import Loader from '@/constants/loader';
import { FONT_FAMILIES } from '@/constants/typography';
import { usePlanScreen } from '@/hooks/use-plan-generation';
import useGameProgression from '@/hooks/useGameProgression';
import Stars from '@/icons/stars';
import { DayRoutineProps } from '@/utils/interfaces';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientCard from '../../components/GradientCard';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { logButtonTap } from '../../services/analyticsService';
import { useAppSelector } from '../../services/mmkv-redux/hooks';
import { PriorityVital } from '../../services/mmkv-redux/slices';
import { Vital } from '../../services/sqlite/interface';
import {
  fetchActivitiesRecordByDate,
  fetchDietRecordByDate,
  fetchSupplementRecordByDate,
  initializeMessagesDatabase,
} from '../../services/sqlite/message';
import { getPrioritizedVitalData } from '../../services/sqlite/queries';
import {
  addVitalToDB,
  getStatusFromDB,
  initializeDatabase,
} from '../../services/sqlite/vitals';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const HomeScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { userData } = useAppSelector(state => state.user);
  const { pinYourStatus, prioritizedVitals, quiz } = useAppSelector(
    state => state.message,
  );

  // Single loading state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State
  const [priorityVital, setPriorityVital] = useState<PriorityVital | null>(
    null,
  );
  const [statusList, setStatusList] = useState<any>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [todayRoutine, setTodayRoutine] = useState<DayRoutineProps[]>([]);
  const [metrics, setMetrics] = useState<Record<string, string>>({});

  // Modal states
  const [isVitalModalVisible, setVitalModalVisible] = useState(false);
  const [isTaskCompletedModalVisible, setTaskCompletedModalVisible] =
    useState(false);
  const [currentCelebration, setCurrentCelebration] = useState<any>(null);

  // Refs to prevent duplicate calls
  const isLoadingRef = useRef(false);
  const initializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCelebrationIdRef = useRef<string | null>(null);

  const {
    dietProgress,
    activityProgress,
    stressProgress,
    celebrations,
    dismissCelebration,
    quickFeedback,
    dismissQuickFeedback,
  } = useGameProgression();

  const {
    isBuildMealModalVisible,
    setBuildMealModalVisible,
    isBuildWorkoutModalVisible,
    setBuildWorkoutModalVisible,
    isEditModalVisible,
    setIsEditModalVisible,
    selectedList,
    setSelectedList,
    savePlan,
    planType,
    isMessageModalVisible,
    setIsMessageModalVisible,
    message,
    setPlanType,
    loading: planLoading,
    generateUserPlan,
    activitesList,
    superFoodsList,
    setLoading: setPlanLoading,
  } = usePlanScreen({});

  const { Colors, DEffect, dark } = useAppTheme();
  const styles = useMemo(() => createStyle(Colors, DEffect), [Colors, DEffect]);

  // Memoized priority vital tags
  const priorityVitalTags = useMemo(
    () =>
      prioritizedVitals?.map(vital =>
        vital.metrics.length > 1
          ? vital.title
          : vital?.metrics[0]?.metric ?? 'Vital Tag',
      ) ?? [],
    [prioritizedVitals],
  );

  // Memoized goal progress data - FIXED onPress handlers
  const goalProgressData: GoalProgressItem[] = useMemo(
    () => [
      {
        label: 'Diet',
        progress: dietProgress,
        percentage: dietProgress,
        colorKey: 'diet',
        color: 'rgba(39, 168, 100, 1)',
        background: dark ? '#121212' : '#E6F6F1',
        gradientColors: ['#34D399', '#27A864', '#059669'],
        glowColor: 'rgba(52, 211, 153, 0.4)',
        onPress: () => {
          console.log('Diet pressed');
          props.navigation.navigate('ProgressSummaryScreen', {
            type: 'diet',
          });
        },
      },
      {
        label: 'Activity',
        progress: activityProgress,
        percentage: activityProgress,
        color: 'rgba(198, 63, 44, 1)',
        background: dark ? '#121212' : '#F8E9E9',
        colorKey: 'activity',
        gradientColors: ['#dc5246', '#C63F2C', '#DC2626'],
        glowColor: 'rgba(251, 146, 60, 0.4)',
        onPress: () => {
          console.log('Activity pressed');
          props.navigation.navigate('ProgressSummaryScreen', {
            type: 'activity',
          });
        },
      },
      {
        colorKey: 'stress',
        label: 'Calm',
        progress: stressProgress,
        percentage: stressProgress,
        color: 'rgba(124, 96, 200, 1)',
        background: dark ? '#121212' : '#E6E0F2',
        gradientColors: ['#A78BFA', '#7C60C8', '#7C3AED'],
        glowColor: 'rgba(167, 139, 250, 0.4)',
        onPress: () => {
          console.log('Stress pressed');
          props.navigation.navigate('ProgressSummaryScreen', {
            type: 'stress',
          });
        },
      },
    ],
    [dietProgress, activityProgress, stressProgress, props.navigation],
  );

  // Utility functions
  const convertTimeToNumber = useCallback((time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours as number) * 60 + (minutes as number);
  }, []);

  const sortByNearestTime = useCallback(
    (routines: DayRoutineProps[]) => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      return routines.slice().sort((a, b) => {
        const timeA = convertTimeToNumber(a.time);
        const timeB = convertTimeToNumber(b.time);
        const diffA = Math.abs(timeA - nowMinutes);
        const diffB = Math.abs(timeB - nowMinutes);
        return diffA - diffB;
      });
    },
    [convertTimeToNumber],
  );

  // Optimized routine list fetcher
  const getRoutineList = useCallback(async (): Promise<DayRoutineProps[]> => {
    try {
      const date = moment().format('YYYY-MM-DD');
      let id = 0;

      const [diet_routine, supplement_routine, gym_routine] = await Promise.all(
        [
          fetchDietRecordByDate(date),
          fetchSupplementRecordByDate(date),
          fetchActivitiesRecordByDate(date),
        ],
      );

      const superFoodArray: DayRoutineProps[] = [];
      const supplementArray: DayRoutineProps[] = [];
      const activitiesArray: DayRoutineProps[] = [];

      diet_routine.forEach((item: any) => {
        const routineType = item.routine.split(' - ')[0];
        let isCompleted = false;
        try {
          const items = JSON.parse(item.routine_list);
          if (Array.isArray(items) && items.length > 0) {
            isCompleted = items.every((i: any) => i.checked);
          }
        } catch (e) {
          console.error('Error parsing diet routine:', e);
        }

        superFoodArray.push({
          description: `Superfood ${
            routineType.charAt(0).toUpperCase() + routineType.slice(1)
          }`,
          screen: 'SuperfoodScreen',
          data: { topic: item.routine },
          time: item.time,
          id: id++,
          message: item.notification_message,
          colors: ['#76D176', '#3E7F3E'],
          component: <Food />,
          isCompleted,
        });
      });

      supplement_routine.forEach((item: any) => {
        let isCompleted = false;
        try {
          const items = JSON.parse(item.routine_list);
          if (Array.isArray(items) && items.length > 0) {
            isCompleted = items.every((i: any) => i.checked);
          }
        } catch (e) {
          console.error('Error parsing supplement routine:', e);
        }

        supplementArray.push({
          description: `${item.routine}`,
          screen: 'SupplementScreen',
          data: { topic: item.routine },
          time: item.time,
          id: id++,
          message: item.notification_message,
          colors: ['#AC5B00', '#FEDD00'],
          component: <Medicine />,
          isCompleted,
        });
      });

      if (gym_routine.length > 0) {
        const overallCompleted = gym_routine.some((item: any) => {
          try {
            const items = JSON.parse(item.routine_list);
            return (
              Array.isArray(items) &&
              items.length > 0 &&
              items.every((i: any) => i.checked)
            );
          } catch (e) {
            return false;
          }
        });

        activitiesArray.push({
          description: `Today's Workout`,
          screen: 'GymScreen',
          data: { topic: 'Workout Plan' },
          time: '17:00',
          id: id++,
          message:
            gym_routine[0]?.notification_message?.trim() ||
            "Time to get moving! Let's crush today's workout.",
          colors: ['#76000B', '#DC0014'],
          component: <Workout />,
          isCompleted: overallCompleted,
        });
      }

      const routines = [
        {
          description: 'Mindful Morning',
          screen: 'MindfulScreen',
          data: { topic: 'Mindful Morning' },
          time: '06:00',
          id: id++,
          message:
            'A new day, a fresh start. Pause, stretch, and embrace the present moment.',
          colors: ['#1E6EF4', '#11408E'],
          component: <Lotus />,
        },
        ...supplementArray,
        ...superFoodArray,
        {
          description: 'Evening Wind Down',
          screen: 'WindScreen',
          data: { topic: 'Evening Wind Down' },
          time: '18:00',
          id: id++,
          message:
            'The day is winding down—take a deep breath, relax, and enjoy a peaceful evening.',
          colors: ['#7A47C3', '#3A225D'],
          component: <Night />,
        },
        ...activitiesArray,
      ] as DayRoutineProps[];

      return sortByNearestTime(routines);
    } catch (error) {
      console.error('Error fetching routines:', error);
      return sortByNearestTime([
        {
          description: 'Mindful Morning',
          screen: 'MindfulScreen',
          data: { topic: 'Mindful Morning' },
          time: '06:00',
          id: 0,
          message:
            'A new day, a fresh start. Pause, stretch, and embrace the present moment.',
          colors: ['#1E6EF4', '#11408E'],
          component: <Lotus />,
        },
        {
          description: 'Evening Wind Down',
          screen: 'WindScreen',
          data: { topic: 'Evening Wind Down' },
          time: '18:00',
          id: 1,
          message:
            'The day is winding down—take a deep breath, relax, and enjoy a peaceful evening.',
          colors: ['#7A47C3', '#3A225D'],
          component: <Night />,
        },
      ]);
    }
  }, [sortByNearestTime]);

  // Consolidated data fetching function
  const fetchAllData = useCallback(
    async (forceRefresh = false) => {
      if (isLoadingRef.current && !forceRefresh) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      isLoadingRef.current = true;
      setIsRefreshing(true);

      try {
        const [fetchedVitals, statusData, routineList] = await Promise.all([
          getPrioritizedVitalData(priorityVitalTags),
          getStatusFromDB(),
          getRoutineList(),
        ]);

        setVitals(fetchedVitals);

        const status = pinYourStatus.map(element => ({
          description: element,
        }));
        setStatusList([...status, ...statusData]);

        setTodayRoutine(routineList);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching data:', error);
          Alert.alert('Error', 'Failed to load data. Please try again.');
        }
      } finally {
        isLoadingRef.current = false;
        setIsRefreshing(false);
        setIsInitializing(false);
      }
    },
    [priorityVitalTags, pinYourStatus, getRoutineList],
  );

  // Initialize database only once
  useEffect(() => {
    const initializeApp = async () => {
      if (initializedRef.current) return;

      try {
        await Promise.all([initializeDatabase(), initializeMessagesDatabase()]);
        initializedRef.current = true;
        await fetchAllData();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitializing(false);
      }
    };

    initializeApp();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllData]);

  // Handle screen focus
  useFocusEffect(
    useCallback(() => {
      if (initializedRef.current) {
        fetchAllData(true);
      }
    }, [fetchAllData]),
  );

  // Handle celebrations
  useEffect(() => {
    if (celebrations.length > 0 && celebrations[0]) {
      const newCelebration = celebrations[0];
      const celebrationId = `${newCelebration.type}-${newCelebration.taskId}-${newCelebration.timestamp}`;

      if (celebrationId !== lastCelebrationIdRef.current) {
        lastCelebrationIdRef.current = celebrationId;
        setCurrentCelebration(newCelebration);
        setTaskCompletedModalVisible(true);
      }
    }
  }, [celebrations]);

  const handleCelebrationModalClose = useCallback(() => {
    setTaskCompletedModalVisible(false);
    setTimeout(() => {
      if (currentCelebration) {
        dismissCelebration(currentCelebration.id);
      }
    }, 300);
  }, [currentCelebration, dismissCelebration]);

  // Memoized callbacks
  const saveRoutinePlan = useCallback(
    async (type: string) => {
      savePlan(type);
      try {
        const list = await getRoutineList();
        setTodayRoutine(list);
      } catch (error) {
        console.error('Error saving routine plan:', error);
      }
    },
    [savePlan, getRoutineList],
  );

  const saveVitals = useCallback(async () => {
    let vital_type = Object.keys(metrics)[0] as string;
    let value = Object.values(metrics)[0] as string;

    const metricValues = Object.values(metrics);
    if (metricValues.length > 1 && priorityVital) {
      vital_type = priorityVital.title;
      value = `${metricValues[0]}/${metricValues[1]}`;
    }

    try {
      await addVitalToDB({
        vital_type,
        value,
        unit: priorityVital?.metrics[0]?.unit,
      });

      const fetchedVitals = await getPrioritizedVitalData(priorityVitalTags);
      setVitals(fetchedVitals);
      setVitalModalVisible(false);
      setMetrics({});
    } catch (error) {
      console.error('Error saving vitals:', error);
      Alert.alert('Error', 'Failed to save vitals');
    }
  }, [metrics, priorityVital, priorityVitalTags]);

  const handleOpenPress = useCallback(
    (screen: string) => {
      if (screen === 'GymScreen') {
        setBuildWorkoutModalVisible(true);
      } else if (screen === 'SuperfoodScreen') {
        setBuildMealModalVisible(true);
      } else if (screen === 'SupplementScreen') {
        setSelectedList([
          {
            routine: 'Morning Supplement',
            routine_items: [],
            time: '8:00',
            notification_message:
              'Start your morning strong Take your supplement now.',
            notification_days: [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ],
          },
          {
            routine: 'Afternoon Supplement',
            routine_items: [],
            time: '13:00',
            notification_message:
              "Afternoon boost time! Don't forget your supplement.",
            notification_days: [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ],
          },
          {
            routine: 'Evening Supplement',
            routine_items: [],
            time: '19:00',
            notification_message:
              'A healthy end to a healthy day. Time for your supplement!',
            notification_days: [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ],
          },
        ]);
        setPlanType('supplement');
        setIsEditModalVisible(true);
      }
    },
    [
      setBuildMealModalVisible,
      setBuildWorkoutModalVisible,
      setSelectedList,
      setPlanType,
      setIsEditModalVisible,
    ],
  );

  const truncateUsername = useCallback((name: string): string => {
    return name?.split(' ')[0] || 'User';
  }, []);

  const profilehandle = useCallback(async () => {
    await logButtonTap('View Profile');
    props.navigation.navigate('ProfileScreen');
  }, [props.navigation]);

  const notificationHandle = useCallback(async () => {
    await logButtonTap('View Roadmap');
    props.navigation.navigate('RoadmapScreen', { currentLevel: 5 });
  }, [props.navigation]);

  // Show full screen loader during initialization
  if (isInitializing) {
    return (
      <View
        style={[
          styles.mainContainer,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <StatusBar
          backgroundColor={Colors.primaryDark}
          barStyle="light-content"
        />
        <Loader loading />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFF" />

      <HomeLayout
        backgroundColor={Colors.backgroundColor}
        headerComponent={scrollY => (
          <HomeHeader
            userData={userData}
            onNotificationPress={notificationHandle}
            onProfilePress={profilehandle}
            truncateUsername={truncateUsername}
            navigation={props.navigation}
          />
        )}
      >
        {/* Goal Progress Section */}
        {goalProgressData.length > 0 && (
          <>
            <Text style={[styles.labelStyle, { margin: 24, marginBottom: 0 }]}>
              Goal Progress
            </Text>
            <GoalProgressCard progressData={goalProgressData} Colors={Colors} />
          </>
        )}

        <Text style={[styles.labelStyle, { marginHorizontal: 24 }]}>Today</Text>

        {/* Today's card section */}
        <View>
          {todayRoutine[0] && (
            <View style={{ width: '100%', alignSelf: 'center' }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={async () => {
                  await logButtonTap(todayRoutine[0]?.screen as string);
                  props.navigation.navigate(
                    todayRoutine[0]?.screen,
                    todayRoutine[0]?.data,
                  );
                }}
              >
                <GradientCard
                  angle={298.16}
                  colors={todayRoutine[0].colors}
                  text={todayRoutine[0].description}
                  textComponent={todayRoutine[0].message}
                  imageComponent={todayRoutine[0]?.component}
                  isOpenButtonVisible={
                    todayRoutine[0].screen === 'GymScreen' ||
                    todayRoutine[0].screen === 'SuperfoodScreen' ||
                    todayRoutine[0].screen === 'SupplementScreen'
                  }
                  onOpenPress={async () => {
                    handleOpenPress(todayRoutine[0]?.screen as string);
                  }}
                  title={todayRoutine[0].title as string}
                  isCircleVisible={
                    todayRoutine[0].description !== 'Feminine Health'
                  }
                  isCompleted={todayRoutine[0].isCompleted ?? false}
                  xpAmount={50}
                  xpBadgeColors={todayRoutine[0].colors}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 10 }} />

          {todayRoutine.slice(1).map(({ screen, data, description }, idx) => {
            const isOpenButtonVisible =
              screen === 'GymScreen' ||
              screen === 'SuperfoodScreen' ||
              screen === 'SupplementScreen';

            return (
              <RectButton
                key={`routine-${idx}-${screen}`}
                onPress={async () => {
                  await logButtonTap(screen);
                  props.navigation.navigate(screen, data);
                }}
              >
                <View style={styles.statusContainer}>
                  <StatusScreenIcon screen={screen} height={48} width={48} />
                  <Text style={styles.contentContainerTextStyle}>
                    {description}
                  </Text>
                  {isOpenButtonVisible && (
                    <RectButton
                      onPress={() => handleOpenPress(screen)}
                      style={styles.buttons}
                    >
                      <Stars height={20} width={20} />
                    </RectButton>
                  )}
                </View>
              </RectButton>
            );
          })}
        </View>

        {/* <ToastTester /> */}
        {statusList?.map((element: any, index: number) => (
          <RectButton
            key={`status-${index}-${element.description}`}
            onPress={async () => {
              if (element.screen) {
                await logButtonTap(element.screen);
                props.navigation.navigate(element.screen, element.data);
              }
            }}
          >
            <View style={styles.statusContainer}>
              {element.icon ? (
                <Image source={element.icon} style={styles.documentImg} />
              ) : (
                <BloodDrop />
              )}
              <Text style={styles.contentContainerTextStyle}>
                {element?.description}
              </Text>
            </View>
          </RectButton>
        ))}
        <View style={{ height: 80 }} />
      </HomeLayout>

      <HomeActionButton
        priorityVitalTags={priorityVitalTags}
        setVitals={setVitals}
      />

      <PriorityVitalsModal
        visible={isVitalModalVisible}
        onClose={() => setVitalModalVisible(false)}
        priorityVital={priorityVital}
        metrics={metrics}
        setMetrics={setMetrics}
        saveVitals={saveVitals}
      />

      <EditPlanModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        savePlan={() => saveRoutinePlan(planType)}
      />

      <PlanMessageModal
        isVisible={isMessageModalVisible}
        onClose={() => setIsMessageModalVisible(false)}
        description={message}
        Colors={Colors}
        onShare={() => {
          props.navigation.navigate('QuizScreen');
          setIsMessageModalVisible(false);
        }}
      />

      <BuildMealModal
        isVisible={isBuildMealModalVisible}
        onClose={() => setBuildMealModalVisible(false)}
        onGeneratePress={async requirement =>
          await generateUserPlan('superfood', requirement)
        }
        onEditPress={() => {
          setSelectedList(superFoodsList);
          setPlanType('diet');
          setIsEditModalVisible(true);
        }}
      />

      <BuildWorkoutModal
        isVisible={isBuildWorkoutModalVisible}
        onClose={() => setBuildWorkoutModalVisible(false)}
        onGeneratePress={async requirement =>
          await generateUserPlan('activity', requirement)
        }
        existingWorkoutList={activitesList}
        onEditPress={() => {
          setSelectedList(activitesList);
          setPlanType('activities');
          setIsEditModalVisible(true);
        }}
      />

      <TaskCompletedModal
        visible={isTaskCompletedModalVisible}
        onClose={handleCelebrationModalClose}
        celebration={currentCelebration}
      />

      {quickFeedback?.visible && quickFeedback.xpEarned !== undefined && (
        <QuickFeedbackToast
          visible={quickFeedback.visible}
          message={quickFeedback.message}
          xpEarned={quickFeedback.xpEarned}
          emoji={quickFeedback.emoji || '⭐'}
          onHide={dismissQuickFeedback}
          Colors={Colors}
        />
      )}
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors?.backgroundColor,
    },
    labelStyle: {
      color: Colors.textColor,
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      alignSelf: 'flex-start',
      paddingBottom: 15,
    },
    contentContainerTextStyle: {
      color: Colors.textColor,
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      marginLeft: 15,
      textAlign: 'justify',
      letterSpacing: 0.7,
      margin: 4,
      flex: 1,
    },
    statusContainer: {
      height: 70,
      alignItems: 'center',
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      marginTop: 4,
      marginBottom: 8,
      paddingVertical: 20,
      paddingHorizontal: 12,
      borderRadius: 28,
      flexDirection: 'row',
      borderWidth: Colors?.isDark ? 1 : 0,
      borderColor: Colors?.isDark ? Colors.greyColor : 'transparent',
      ...DEffect,
    },
    documentImg: {
      height: 24,
      width: 24,
      marginHorizontal: 8,
      marginVertical: 4,
      resizeMode: 'contain',
    },
    buttons: {
      height: 40,
      width: 40,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    RoadMapButton: {
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#FFEB71',
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: 'center',
    },
  });

export default HomeScreen;
