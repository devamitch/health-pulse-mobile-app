import Workout from '@/assets/svg/workout.svg';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import WorkoutRoutineModal from '@/components/modals/workout-routine-modal';
import { StatusList } from '@/components/status/layout-list/animated-list';
import { useStatusActivitiesChat } from '@/hooks/chat/useStatusActivitiesChat';
import useGameProgression from '@/hooks/useGameProgression';
import { addStatusRecord } from '@/services/sqlite/vitals';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomCheckbox from '../../components/CustomCheckBox';
import YoutubePlayer from '../../components/YoutubePlayer';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { useAppSelector } from '../../services/mmkv-redux/hooks';
import { Message, Routine } from '../../services/mmkv-redux/slices';
import {
  fetchActivitiesRecordByDate,
  fetchActivitiesRecordWithDateRange,
  fetchGymMessages,
  updateActivitiesRecord,
} from '../../services/sqlite/message';
import { haptic } from '../../utils';
import { saveActivitiesRoutine } from '../../utils/routinePlanHandler';

const GymScreen = (props: any) => {
  const timeframe = props.route?.params?.timeframe;
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const {
    loading,
    userInput,
    setUserInput,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
  } = useStatusActivitiesChat({ timeframe, date });

  const { Colors, DEffect } = useAppTheme();
  const { weeklyWorkoutPlan } = useAppSelector(state => state.message);

  const [gymMessages, setGymMessages] = useState<Message[]>([]);
  const [qrScanVisiable, setQRScanVisiable] = useState(false);
  const [list, setList] = useState<{ item: string; checked: boolean }[]>([]);
  const [routineList, setRoutineList] = useState<Routine[]>([]);
  const [routineListDateRange, setRoutineListDateRange] = useState<
    { date: string; routine: Routine[] }[]
  >([]);
  const [weeklyWorkoutPlanDay, setWeeklyWorkoutPlan] =
    useState<{ day: string; routine: string }[]>(weeklyWorkoutPlan);
  const [isWorkOutRoutineModalVisible, setWorkoutRoutineModalVisible] =
    useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedList, setSelectedList] = useState<any>([]);
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const routine = props.route?.params?.topic ?? 'Evening Gym';

  const styles = createStyle(Colors, DEffect);

  // Gamification
  // const { quickFeedback, completeTask, dismissQuickFeedback } =
  //   useGamification();

  const {
    quickFeedback,
    // completeActivityTask,
    dismissQuickFeedback,
  } = useGameProgression();

  const handleNotification = async () => {
    props.navigation.navigate('Notifications');
  };

  const routineStructurer = (routine_data: any) => {
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
          notification_days: item.notification_days,
        };
        routine.push(value);
      });
      return routine;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const transformRecords = (data: any[]) => {
    return data.reduce((acc, item) => {
      const routineItems = JSON.parse(item.routine_list);

      let existingDate = acc.find(
        (entry: { date: any }) => entry.date === item.date,
      );

      if (!existingDate) {
        existingDate = {
          date: item.date,
          routine: [],
        };
        acc.push(existingDate);
      }

      const value: Routine = {
        routine: item.routine,
        routine_items: routineItems,
        time: item.time,
        notification_message: item.notification_message,
        notification_days: item.notification_days,
      };

      existingDate.routine.push(value);

      return acc;
    }, []);
  };

  const fetchListRoutine = async () => {
    const date = moment().format('YYYY-MM-DD');
    // Fetch all activities for today, not just one specific routine
    const list = await fetchActivitiesRecordByDate(date);
    if (list.length !== 0) {
      // If there's a specific routine parameter, try to find it
      if (routine) {
        const specificRoutine = list.find(
          (item: any) => item.routine === routine,
        );
        if (specificRoutine) {
          setList(JSON.parse(specificRoutine.routine_list));
        } else {
          // If the specific routine is not found, show the first one
          setList(JSON.parse(list[0].routine_list));
        }
      } else {
        // If no specific routine, show the first one
        setList(JSON.parse(list[0].routine_list));
      }
    }
    // Also populate the routineList to show all routines
    setRoutineList(routineStructurer(list));
  };

  const fetchListDateRange = async (start_date: string) => {
    const end_date = moment().format('YYYY-MM-DD');
    const list = await fetchActivitiesRecordWithDateRange(start_date, end_date);
    setRoutineListDateRange(transformRecords(list));
  };

  useEffect(() => {
    fetchGymMessages(props?.route?.params?.date, date).then(messages => {
      setGymMessages(messages);
    });
    fetchListRoutine();
    if (timeframe === 'week') {
      const start_date = moment(props.route?.params?.date).format('YYYY-MM-DD');
      fetchListDateRange(start_date);
    } else if (timeframe === 'month') {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      fetchListDateRange(moment(date).format('YYYY-MM-DD'));
    }
  }, []);

  const handleBulletChange = async (index: number) => {
    const updatedList = [...list];
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (updatedList[index]) {
      const wasUnchecked = !updatedList[index].checked;
      if (wasUnchecked) {
        setIsConfettiVisible(true);
        // completeActivityTask(list[index]?.item, routine);
        // Award XP for completing the exercise
        // const currentHour = new Date().getHours();
        // await completeTask('exercise', 'workout', {
        //   isEarly: currentHour < 8,
        //   inCombo: false,
        // });
      }
      updatedList[index] = {
        item: updatedList[index].item,
        checked: !updatedList[index].checked,
      };
    }
    setList(updatedList);
    updateActivitiesRecord(
      moment(date).format('YYYY-MM-DD'),
      routine,
      JSON.stringify(updatedList),
    );
  };

  const handleEditWeeklyRoutine = (value: string, index: number) => {
    const newList = [...weeklyWorkoutPlanDay];
    if (newList[index])
      newList[index] = { day: newList[index].day, routine: value };
    setWeeklyWorkoutPlan(newList);
  };

  const savePlan = async (selectedList: Routine[]) => {
    haptic(haptic_level);
    const date = moment().format('YYYY-MM-DD');
    await saveActivitiesRoutine(selectedList, date);
    // Refresh the list to show updated routines
    fetchListRoutine();
    setEditModalVisible(false);
  };

  const handleLongPress = (message: string) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const getCurrentExercise = () => {
    if (list && list.length > 0) {
      const currentExercise = list.find(item => !item.checked);
      if (currentExercise) {
        return currentExercise.item;
      }
    }
    return 'gym workout';
  };

  const pinToStatus = (message: string) => {
    addStatusRecord(message, 0, 'popup', '');
    setModalVisible(false);
  };

  const renderFooter = () => (
    <View>
      <View style={[styles.card, styles.videoRecorderWrapper]}>
        {qrScanVisiable ? (
          <View style={styles.videoRecorder}>
            <YoutubePlayer
              exercise={getCurrentExercise()}
              onClose={() => setQRScanVisiable(false)}
            />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setQRScanVisiable(true)}>
            <Image
              source={require('../../assets/images/play.png')}
              style={{ height: 100, width: 100 }}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* <View style={[styles.card, styles.videoRecorderWrapper]}>
        {qrScanVisiable ? (
          <View style={styles.videoRecorder}>
            <VideoRecorder />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setQRScanVisiable(true)}>
            <Image
              source={require('../../assets/images/streaming.png')}
              style={{
                height: 100,
                width: 100,
              }}
            />
          </TouchableOpacity>
        )}
      </View> */}
      <View style={[styles.card, { padding: 4, marginTop: 20 }]}>
        {/* Show all routines for today when no specific timeframe or timeframe is 'day' */}
        {(!timeframe || timeframe === 'day') && routineList.length > 0
          ? routineList.map((element, index) => (
              <View
                key={index}
                style={[styles.card, { padding: 12, marginVertical: 7 }]}
              >
                <Text style={styles.headerText}>{element.routine}</Text>
                {element.routine_items.map((item, ind) => (
                  <CustomCheckbox
                    key={ind}
                    label={item.item}
                    onChange={async () => {
                      const updatedRoutineList = [...routineList];
                      const currentRoutine = updatedRoutineList[index];
                      const currentItem = currentRoutine?.routine_items[ind];

                      if (currentRoutine && currentItem) {
                        const wasUnchecked = !currentItem.checked;
                        currentItem.checked = !currentItem.checked;
                        setRoutineList(updatedRoutineList);
                        const date = moment().format('YYYY-MM-DD');
                        updateActivitiesRecord(
                          date,
                          element.routine,
                          JSON.stringify(currentRoutine.routine_items),
                        );
                        if (wasUnchecked) {
                          setIsConfettiVisible(true);
                          // completeActivityTask(currentItem.item, routine)
                          // Award XP for completing the exercise
                          // const currentHour = new Date().getHours();
                          // await completeTask('exercise', 'workout', {
                          //   isEarly: currentHour < 8,
                          //   inCombo: false,
                          // });
                        }
                      }
                    }}
                    checked={item.checked}
                  />
                ))}
              </View>
            ))
          : /* Show the specific routine items when a routine is specified */
            list.map((item, index) => (
              <CustomCheckbox
                key={index}
                label={item.item}
                onChange={() => handleBulletChange(index)}
                checked={item.checked}
              />
            ))}
        {/* Show date range routines */}
        {routineListDateRange.map((ele, index) => (
          <View key={index} style={[styles.card]}>
            <Text style={styles.headerText}>
              {new Date(ele.date).toDateString()}
            </Text>
            {ele.routine.map((element, index) => (
              <View
                key={index}
                style={[styles.card, { padding: 12, marginVertical: 7 }]}
              >
                <Text style={styles.headerText}>{element.routine}</Text>
                {element.routine_items.map((item, ind) => (
                  <CustomCheckbox
                    key={ind}
                    label={item.item}
                    checked={item.checked}
                  />
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={Workout}
        angle={126.57}
        gradientColors={['#76000B', '#DC0014']} // Red gradient for activities
        title="Today's Activities"
        subtitle="Let's get moving!"
        description="Every step counts - make today your most active day yet."
        loading={loading}
        handleClearChat={handleClearChat}
        handleNotification={handleNotification}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        messages={[...gymMessages]}
        animatedText={animatedText}
        onLongPress={handleLongPress}
        onAddPlan={savePlan}
        onEditPlan={data => {
          setSelectedList(data);
          setEditModalVisible(true);
        }}
        hapticLevel={haptic_level}
        messageFeedback={messageFeedback}
        onFeedbackSubmit={handleFeedbackSubmit}
        ListFooterComponent={renderFooter}
        otherMenuItems={[
          {
            title: 'Weekly Workout Plan',
            onPress: () => setWorkoutRoutineModalVisible(true),
          },
        ]}
        expandedHeight={200}
      />

      {isConfettiVisible && (
        <ConfettiCannon
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: 50 }}
          autoStart={true}
          onAnimationEnd={() => setIsConfettiVisible(false)}
        />
      )}

      <EditPlanModal
        isVisible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        savePlan={() => savePlan(selectedList)}
      />

      <WorkoutRoutineModal
        visible={isWorkOutRoutineModalVisible}
        onClose={() => setWorkoutRoutineModalVisible(false)}
        weeklyWorkoutPlanDay={weeklyWorkoutPlanDay}
        handleEditWeeklyRoutine={handleEditWeeklyRoutine}
      />

      <ChatMessageModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={selectedMessage}
        onPinToStatus={() => pinToStatus(selectedMessage)}
      />

      {/* Gamification Quick Feedback */}
      {/* {quickFeedback?.visible && quickFeedback.xpEarned !== undefined && (
        <QuickFeedbackToast
          visible={quickFeedback.visible}
          message={quickFeedback.message}
          xpEarned={quickFeedback.xpEarned}
          emoji={quickFeedback.emoji || '💪'}
          onHide={dismissQuickFeedback}
          Colors={Colors}
        />
      )} */}
    </GestureHandlerRootView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    headerText: {
      marginLeft: 8,
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      ...DEffect,
    },
    videoRecorderWrapper: {
      marginTop: 12,
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoRecorder: {
      height: 300,
      width: '100%',
      alignItems: 'center',
      borderRadius: 20,
      overflow: 'hidden',
    },
  });
};

export default GymScreen;
