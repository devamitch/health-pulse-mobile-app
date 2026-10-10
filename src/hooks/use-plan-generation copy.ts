import { completeDay } from '@/services/mmkv-redux/slices/game_engine_slice';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import {
  generatePlanResponseClaude,
  PlanChatFuntionProps,
} from '../services/api/claude_client';
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
  savePlanActivitiesMessage,
  savePlanSuperfoodMessage,
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

export const usePlanScreen = ({ navigation }: UsePlanScreenProps) => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const date = moment().format('YYYY-MM-DD');

  // Redux selectors
  const {
    weeklyWorkoutPlan,
    haptic_level,
    isPrefeencesOn,
    CategorisedPreferences,
    quiz,
    routineGeneratedAt,
    prompt,
  } = useAppSelector(state => state.message);

  const { isNewUser } = useAppSelector(state => state.user);

  const { todayPlan } = useAppSelector(state => state.gameProgression);

  // State management
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

  // Refs
  const abortController = useRef<AbortController | null>(null);
  const scrollViewRef = useRef(null);
  const supplementsRef = useRef(null);
  const superfoodRef = useRef(null);
  const activityRef = useRef(null);

  // Memoized user information
  const userInformation = useMemo(
    () =>
      quiz.reduce<Record<string, string | number | boolean>>((acc, item) => {
        acc[item.questionTag] = item.answer;
        return acc;
      }, {}),
    [quiz],
  );

  // PanResponder for subscription modal
  const createPanResponder = (onClose: () => void) =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          onClose();
        }
      },
    });

  const subscriptionModalPanResponder = useMemo(
    () =>
      createPanResponder(() => {
        setModalVisible(false);
        navigation.goBack();
      }),
    [navigation],
  );

  // Menu items
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

  // Structure routine data
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
      console.error(e);
      return [];
    }
  };

  // Group routine data by date
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

  // Fetch current routines
  const fetchRoutines = async () => {
    const date = moment().format('YYYY-MM-DD');

    const diet_routine = await fetchDietRecordByDate(date);
    const supplement_routine = await fetchSupplementRecordByDate(date);
    const gym_routine = await fetchActivitiesRecordByDate(date);

    setSuperFoodList(routineStructurer(diet_routine));
    setsSupplementsList(routineStructurer(supplement_routine));
    setActivitesList(routineStructurer(gym_routine));
  };

  // Fetch past records
  const fetchPastRecords = async () => {
    const start_date = moment().subtract(8, 'days').format('YYYY-MM-DD');
    const end_date = moment().subtract(1, 'days').format('YYYY-MM-DD');

    console.log(start_date, end_date);

    const dietRecord = await fetchDietRecordWithDateRange(start_date, end_date);
    const activitiesRecord = await fetchActivitiesRecordWithDateRange(
      start_date,
      end_date,
    );

    setDietRecord(groupRoutineData(dietRecord));
    setActivitiesRecord(groupRoutineData(activitiesRecord));
  };

  // Generate AI response
  const generateResponse = async (
    plan: 'superfood' | 'supplement' | 'activity',
    userInput: PlanChatFuntionProps['userInput'],
    records: RoutineRecord[],
  ) => {
    try {
      setLoading(true);
      abortController.current = new AbortController();

      const preferences =
        CategorisedPreferences?.[
          plan === 'activity'
            ? 'Activities'
            : plan === 'superfood'
            ? 'Diet'
            : 'Supplement'
        ] ?? [];

      const response = await generatePlanResponseClaude({
        plan,
        chatMemory: [],
        userInformation,
        userInput,
        preferences,
        records,
      });

      return (response?.content[0] as any).text as string;
    } catch (error) {
      if (abortController.current?.signal.aborted) {
        console.log('Request was aborted');
      } else {
        console.error('Error:', error);
      }
      return 'Something went wrong. Please try again.';
    } finally {
      setLoading(false);
      abortController.current = null;
    }
  };

  // Save plan
  const savePlan = async (plan: string, routine = selectedList) => {
    haptic(haptic_level);
    const date = moment().format('YYYY-MM-DD');

    if (plan === 'diet') {
      setSuperFoodList(routine);
      await saveSuperfoodRoutine(routine, date);
      dispatch(updateRoutineDate({ routine: plan, date }));
    } else if (plan === 'supplement') {
      setsSupplementsList(routine);
      await saveSupplementRoutine(routine, date);
      dispatch(updateRoutineDate({ routine: plan, date }));
    } else if (plan === 'activities') {
      setActivitesList(routine);
      await saveActivitiesRoutine(routine, date);
      dispatch(updateRoutineDate({ routine: plan, date }));
    } else {
      console.error(plan);
    }
    setIsEditModalVisible(false);
  };

  // Display plan as formatted text
  const displayPlan = (data: Routine[]): string => {
    let string = '';
    data.map(item => {
      string += `${item.routine}:\n`;
      item.routine_items.map(element => {
        string += `   ◉ ${element.item}\n`;
      });
      string += '\n';
    });
    return string.slice(0, -1);
  };

  // Toggle preferences
  const togglePreferences = () => {
    setMenuVisible(false);
    dispatch(changePreferenceOn());
  };

  // Open preferences modal
  const openPreferencesModal = () => {
    setMenuVisible(false);
    setPreferenceModalVisible(true);
  };

  // Handle supplement plan creation
  const handleSupplementPlanCreation = () => {
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
  };

  const generateUserPlan = async (
    plan: 'superfood' | 'activity',
    requirement: Record<string, any>,
  ) => {
    haptic(haptic_level);
    setLoading(true);

    const records = plan === 'activity' ? dietRecord : activitiesRecord;

    const res = await generateResponse(
      plan,
      { ...requirement, todayPlan },
      records,
    );

    if (plan === 'superfood') {
      await savePlanSuperfoodMessage('system', res);
      // } else if (promptList === supplementPrompts) {
      //   await savePlanSupplementMessage('system', res);
    } else if (plan === 'activity') {
      await savePlanActivitiesMessage('system', res);
    }

    const data = JSON.parse(res);
    if (data.type === 'message') {
      setMessage(data[data.type]);
      setIsMessageModalVisible(true);
    } else {
      setSelectedList(data[data.type]);
      setIsEditModalVisible(true);
      setPlanType(data.type);
    }
    setLoading(false);
  };

  const generateAndSaveRoutine = async (
    plan: 'superfood' | 'activity',
    routines: RoutineRecord[],
    date: string,
  ) => {
    // const res = await generateResponseClaude(prompts, routines);
    let requirement: Record<string, any> = {};

    if (plan === 'activity') requirement = { weeklyWorkoutPlan };

    const res = await generateResponse(plan, requirement, routines);

    if (plan === 'superfood') {
      await savePlanSuperfoodMessage('system', res);
      // } else if (prompts === supplementPrompts) {
      //   await savePlanSupplementMessage('system', res);
    } else if (plan === 'activity') {
      await savePlanActivitiesMessage('system', res);
    }

    const data = JSON.parse(res);
    const routine = data.type;
    await savePlan(routine, data[routine]);

    dispatch(updateRoutineDate({ routine, date }));
  };

  // Effects
  useEffect(() => {
    if (isScrollingToActivities) {
      const timer = setTimeout(() => {
        setIsScrollingToActivities(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return;
  }, [isScrollingToActivities]);

  const generateAllRoutines = async (date: string) => {
    try {
      await generateAndSaveRoutine('superfood', dietRecord, date);
      // await generateAndSaveRoutine(supplementPrompts, supplementRecord, date);
      await generateAndSaveRoutine('activity', activitiesRecord, date);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // if (
    //   prompt &&
    //   isNewUser != true &&
    //   (routineGeneratedAt.diet !== date ||
    //     // routineGeneratedAt.supplement !== date ||
    //     routineGeneratedAt.activities !== date)
    // )
    //   generateAllRoutines(date);

    if (routineGeneratedAt.userPlan !== date) {
      dispatch(completeDay());
      dispatch(updateRoutineDate({ routine: 'userPlan', date }));
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchRoutines();
      fetchPastRecords();
    }
  }, [isFocused]);

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

    // Functions
    generatePlan: generateUserPlan,
    savePlan,
    displayPlan,
    togglePreferences,
    openPreferencesModal,
    handleSupplementPlanCreation,
    generateUserPlan,
  };
};
