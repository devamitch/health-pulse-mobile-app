import { completeDay } from '@/services/mmkv-redux/slices/game_engine_slice';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import { useAppDispatch, useAppSelector } from '../services/mmkv-redux/hooks';
import {
  changePreferenceOn,
  Routine,
  RoutineRecord,
  updateRoutineDate,
} from '../services/mmkv-redux/slices';
import {
  fetchActivitiesRecordByDate,
  fetchActivitiesRecordWithDateRange,
  fetchDietRecordByDate,
  fetchDietRecordWithDateRange,
  fetchSupplementRecordByDate,
} from '../services/sqlite/message';
import { haptic } from '../utils';
import {
  saveActivitiesRoutine,
  saveSuperfoodRoutine,
  saveSupplementRoutine,
} from '../utils/routinePlanHandler';

interface UsePlanScreenProps {
  navigation?: any;
}

// ============================================================================
// HELPER FUNCTIONS (outside component to prevent recreation)
// ============================================================================

const routineStructurer = (routine_data: any): Routine[] => {
  try {
    const routine: Routine[] = [];
    routine_data.map((item: any) => {
      const value: Routine = {
        id: item.id,
        date: item.date,
        routine_items: JSON.parse(item.routine_list),
        routine: item.routine,
        time: item.time,
        notification_message: item.notification_message,
        notification_days: JSON.parse(item.notification_days),
      };
      routine.push(value);
    });
    return routine;
  } catch (e) {
    console.error('routineStructurer error:', e);
    return [];
  }
};

const groupRoutineData = (data: any): RoutineRecord[] => {
  return data.reduce(
    (
      acc: RoutineRecord[],
      entry: { date: string; routine_list: string; routine: any },
    ) => {
      const date = entry.date.split('T')[0] as string;
      const routineList = JSON.parse(entry.routine_list);

      const suggestedItems = routineList.map(
        (item: { item: any }) => item.item,
      );
      const doneItems = routineList
        .filter((item: { checked: any }) => item.checked)
        .map((item: { item: any }) => item.item);

      let dateEntry = acc.find((d: { date: any }) => d.date === date);
      if (!dateEntry) {
        dateEntry = { date, routines: [] };
        acc.push(dateEntry);
      }

      dateEntry.routines.push({
        routine: entry.routine,
        suggested_items: suggestedItems,
        done_items: doneItems,
      });

      return acc;
    },
    [],
  );
};

// ============================================================================
// MAIN HOOK (NO CLAUDE API CALLS)
// ============================================================================

export const usePlanScreen = ({ navigation }: UsePlanScreenProps) => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  // ========== MEMOIZED DATE ==========
  const date = useMemo(() => moment().format('YYYY-MM-DD'), []);

  // ========== REDUX SELECTORS (memoized) ==========
  const {
    weeklyWorkoutPlan,
    haptic_level,
    isPrefeencesOn,
    CategorisedPreferences,
    quiz,
    routineGeneratedAt,
  } = useAppSelector(state => state.message);

  const { isNewUser } = useAppSelector(state => state.user);
  const { todayPlan } = useAppSelector(state => state.gameProgression);

  // ========== STATE ==========
  const [superFoodsList, setSuperFoodList] = useState<Routine[]>([]);
  const [supplementsList, setsSupplementsList] = useState<Routine[]>([]);
  const [activitesList, setActivitesList] = useState<Routine[]>([]);
  const [dietRecord, setDietRecord] = useState<RoutineRecord[]>([]);
  const [activitiesRecord, setActivitiesRecord] = useState<RoutineRecord[]>([]);
  const [selectedList, setSelectedList] = useState<Routine[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isPreferenceModalVisible, setPreferenceModalVisible] = useState(false);
  const [isBuildMealModalVisible, setBuildMealModalVisible] = useState(false);
  const [isBuildWorkoutModalVisible, setBuildWorkoutModalVisible] =
    useState(false);
  const [planType, setPlanType] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScrollingToActivities, setIsScrollingToActivities] = useState(false);

  // ========== REFS ==========
  const scrollViewRef = useRef(null);
  const supplementsRef = useRef(null);
  const superfoodRef = useRef(null);
  const activityRef = useRef(null);
  const fetchInProgressRef = useRef(false);

  // ========== MEMOIZED USER INFORMATION ==========
  const userInformation = useMemo(
    () =>
      quiz.reduce<Record<string, string | number | boolean>>((acc, item) => {
        acc[item.questionTag] = item.answer;
        return acc;
      }, {}),
    [quiz],
  );

  // ========== MEMOIZED PAN RESPONDER ==========
  const subscriptionModalPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 20;
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx > 100) {
            setModalVisible(false);
            navigation?.goBack();
          }
        },
      }),
    [navigation],
  );

  // ========== MEMOIZED MENU ITEMS ==========
  const menuItems = useMemo(
    () => [
      {
        title: `Turn ${isPrefeencesOn ? 'Off' : 'On'} Preferences`,
        onPress: () => {
          setMenuVisible(false);
          dispatch(changePreferenceOn());
        },
      },
      {
        title: 'Manage Preferences',
        onPress: () => {
          setMenuVisible(false);
          setPreferenceModalVisible(true);
        },
      },
    ],
    [isPrefeencesOn, dispatch],
  );

  // ========== STABLE CALLBACKS ==========

  const fetchRoutines = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      return;
    }

    fetchInProgressRef.current = true;
    try {
      const currentDate = moment().format('YYYY-MM-DD');

      const [diet_routine, supplement_routine, gym_routine] = await Promise.all(
        [
          fetchDietRecordByDate(currentDate),
          fetchSupplementRecordByDate(currentDate),
          fetchActivitiesRecordByDate(currentDate),
        ],
      );

      setSuperFoodList(routineStructurer(diet_routine));
      setsSupplementsList(routineStructurer(supplement_routine));
      setActivitesList(routineStructurer(gym_routine));
    } catch (error) {
      console.error('fetchRoutines error:', error);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, []);

  const fetchPastRecords = useCallback(async () => {
    try {
      const start_date = moment().subtract(8, 'days').format('YYYY-MM-DD');
      const end_date = moment().subtract(1, 'days').format('YYYY-MM-DD');

      const [dietRecord, activitiesRecord] = await Promise.all([
        fetchDietRecordWithDateRange(start_date, end_date),
        fetchActivitiesRecordWithDateRange(start_date, end_date),
      ]);

      setDietRecord(groupRoutineData(dietRecord));
      setActivitiesRecord(groupRoutineData(activitiesRecord));
    } catch (error) {
      console.error('fetchPastRecords error:', error);
    }
  }, []);

  const savePlan = useCallback(
    async (plan: string, routine = selectedList) => {
      haptic(haptic_level);
      const currentDate = moment().format('YYYY-MM-DD');

      try {
        if (plan === 'diet') {
          setSuperFoodList(routine);
          await saveSuperfoodRoutine(routine, currentDate);
          dispatch(updateRoutineDate({ routine: plan, date: currentDate }));
        } else if (plan === 'supplement') {
          setsSupplementsList(routine);
          await saveSupplementRoutine(routine, currentDate);
          dispatch(updateRoutineDate({ routine: plan, date: currentDate }));
        } else if (plan === 'activities') {
          setActivitesList(routine);
          await saveActivitiesRoutine(routine, currentDate);
          dispatch(updateRoutineDate({ routine: plan, date: currentDate }));
        } else {
          console.error('Unknown plan type:', plan);
        }
        setIsEditModalVisible(false);
      } catch (error) {
        console.error('savePlan error:', error);
      }
    },
    [selectedList, haptic_level, dispatch],
  );

  const displayPlan = useCallback((data: Routine[]): string => {
    let string = '';
    data.forEach(item => {
      string += `${item.routine}:\n`;
      item.routine_items.forEach(element => {
        string += `   ◉ ${element.item}\n`;
      });
      string += '\n';
    });
    return string.slice(0, -1);
  }, []);

  const togglePreferences = useCallback(() => {
    setMenuVisible(false);
    dispatch(changePreferenceOn());
  }, [dispatch]);

  const openPreferencesModal = useCallback(() => {
    setMenuVisible(false);
    setPreferenceModalVisible(true);
  }, []);

  const handleSupplementPlanCreation = useCallback(() => {
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
  }, []);

  // ========== DISABLED: CLAUDE API CALLS ==========
  // These functions are disabled per user request
  // Users will manually create plans through the UI

  /**
   * DISABLED: No automatic plan generation with Claude
   * Users should use manual plan creation features instead
   */
  const generateUserPlan = useCallback(
    async (
      plan: 'superfood' | 'activity',
      requirement: Record<string, any>,
    ) => {
      console.log('[Plan Generation] Disabled - Use manual plan creation');
      setMessage(
        'Plan generation is currently disabled. Please create plans manually.',
      );
      setIsMessageModalVisible(true);
    },
    [],
  );

  /**
   * DISABLED: No automatic routine generation
   * Keep for interface compatibility but don't execute
   */
  const generateAndSaveRoutine = useCallback(
    async (
      plan: 'superfood' | 'activity',
      routines: RoutineRecord[],
      targetDate: string,
    ) => {
      console.log('[Routine Generation] Disabled');
      // Do nothing - manual creation only
    },
    [],
  );

  /**
   * DISABLED: No automatic all-routines generation
   * Keep for interface compatibility but don't execute
   */
  const generateAllRoutines = useCallback(async (targetDate: string) => {
    console.log('[All Routines Generation] Disabled');
    // Do nothing - manual creation only
  }, []);

  // ========== EFFECTS ==========

  // Scroll animation cleanup
  useEffect(() => {
    if (isScrollingToActivities) {
      const timer = setTimeout(() => {
        setIsScrollingToActivities(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isScrollingToActivities]);

  // Handle user plan completion once per day
  useEffect(() => {
    if (routineGeneratedAt.userPlan !== date) {
      dispatch(completeDay());
      dispatch(updateRoutineDate({ routine: 'userPlan', date }));
    }
  }, [date, routineGeneratedAt.userPlan, dispatch]);

  // Fetch data when screen is focused
  useEffect(() => {
    if (isFocused) {
      fetchRoutines();
      fetchPastRecords();
    }
  }, [isFocused, fetchRoutines, fetchPastRecords]);

  // ========== RETURN ==========

  return {
    // State
    superFoodsList,
    supplementsList,
    activitesList,
    dietRecord,
    activitiesRecord,
    selectedList,
    setSelectedList,
    isEditModalVisible,
    setIsEditModalVisible,
    isMessageModalVisible,
    setIsMessageModalVisible,
    isModalVisible,
    setModalVisible,
    isMenuVisible,
    setMenuVisible,
    isPreferenceModalVisible,
    setPreferenceModalVisible,
    isBuildMealModalVisible,
    setBuildMealModalVisible,
    isBuildWorkoutModalVisible,
    setBuildWorkoutModalVisible,
    planType,
    setPlanType,
    message,
    loading,
    setLoading,
    isScrollingToActivities,

    // Refs
    scrollViewRef,
    supplementsRef,
    superfoodRef,
    activityRef,

    // Redux data
    weeklyWorkoutPlan,
    haptic_level,
    isPrefeencesOn,
    CategorisedPreferences,

    // PanResponder
    subscriptionModalPanResponder,

    // Menu
    menuItems,

    // Functions (Claude generation disabled)
    generatePlan: generateUserPlan, // Shows disabled message
    savePlan,
    displayPlan,
    togglePreferences,
    openPreferencesModal,
    handleSupplementPlanCreation,
    generateUserPlan, // Shows disabled message
  };
};
