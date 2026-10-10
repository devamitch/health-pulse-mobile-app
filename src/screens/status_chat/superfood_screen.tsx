import SuperFood from '@/assets/svg/superfood.svg';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import { StatusList } from '@/components/status/layout-list/animated-list';
import ProductScanner from '@/components/status/product-scanner';
import { useStatusSuperfoodChat } from '@/hooks/chat/useStatusSuperfoodChat';
import useGameProgression from '@/hooks/useGameProgression';
import { addStatusRecord } from '@/services/sqlite/vitals';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomCheckbox from '../../components/CustomCheckBox';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { claudeCheckItemHelper } from '../../services/api/claude_client';
import { Routine } from '../../services/mmkv-redux/slices';
import {
  fetchDietRecordByDate,
  fetchDietRecordWithDateRange,
  updateDietRecord,
} from '../../services/sqlite/message';
import { haptic } from '../../utils';
import { saveSuperfoodRoutine } from '../../utils/routinePlanHandler';

const SuperfoodScreen = (props: any) => {
  const timeframe = props.route?.params?.timeframe;
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const {
    loading: isChatLoading,
    userInput,
    setUserInput,
    superfoodMessages,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
    setLoading,
  } = useStatusSuperfoodChat({ timeframe, date });

  const {
    quickFeedback,
    dismissQuickFeedback,
    // completeDietTask,
    loading: gameEngineLoading,
  } = useGameProgression();

  const loading = useMemo(
    () => isChatLoading || gameEngineLoading,
    [isChatLoading, gameEngineLoading],
  );

  const [list, setList] = useState<{ item: string; checked: boolean }[]>([]);
  const [routineList, setRoutineList] = useState<Routine[]>([]);
  const [routineListDateRange, setRoutineListDateRange] = useState<
    { date: string; routine: Routine[] }[]
  >([]);

  const routine = props.route?.params?.topic ?? '';

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
    const list = await fetchDietRecordByDate(date, routine);
    if (list.length !== 0) {
      setList(JSON.parse(list[0].routine_list));
    }
  };

  const fetchListDaily = async () => {
    const date = moment(props.route?.params?.date).format('YYYY-MM-DD');
    const list = await fetchDietRecordByDate(date);
    setRoutineList(routineStructurer(list));
  };

  const fetchListDateRange = async (start_date: string) => {
    const end_date = moment().format('YYYY-MM-DD');
    const list = await fetchDietRecordWithDateRange(start_date, end_date);
    setRoutineListDateRange(transformRecords(list));
  };

  useEffect(() => {
    fetchListRoutine();
    if (props.route?.params?.timeframe === 'day') {
      fetchListDaily();
    } else if (props.route?.params?.timeframe === 'week') {
      const date = moment(props.route?.params?.date).format('YYYY-MM-DD');
      fetchListDateRange(date);
    } else if (props.route?.params?.timeframe === 'month') {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      fetchListDateRange(moment(date).format('YYYY-MM-DD'));
    }
  }, []);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  // Gamification
  // const { quickFeedback, completeTask, dismissQuickFeedback } =
  //   useGamification();

  const handleNotification = async () => {
    props.navigation.navigate('Notifications');
  };

  const handleBulletChange = async (index: number) => {
    const updatedList = [...list];
    const date = moment().format('YYYY-MM-DD');
    if (updatedList[index]) {
      const wasUnchecked = !updatedList[index].checked;
      if (wasUnchecked) {
        setIsConfettiVisible(true);
        // completeDietTask(list[index]?.item, routine);
        // Award XP for completing the task
        // const currentHour = new Date().getHours();
        // await completeTask('diet', 'meal', {
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
    updateDietRecord(date, routine, JSON.stringify(updatedList));
  };

  const addItem = (item: string) => {
    const date = moment().format('YYYY-MM-DD');
    const updatedList = [...list, { item: item, checked: true }];
    setList(updatedList);
    updateDietRecord(date, routine, JSON.stringify(updatedList));
  };

  const updateItemList = async ({
    base64,
    imageType,
  }: {
    base64: string;
    imageType: 'image/png' | 'image/jpeg' | 'image/webp';
    path: string;
  }) => {
    try {
      setLoading(true);
      const items = list.map(({ item }) => item);
      const response = await claudeCheckItemHelper(
        base64,
        imageType,
        items,
        'food',
      );
      if (response.success) {
        if (response.present) {
          const index = items.indexOf(response.item);
          if (index >= 0) if (!list[index]?.checked) handleBulletChange(index);
        } else {
          addItem(response.item);
        }
      }
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedList, setSelectedList] = useState<any>([]);
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const handleLongPress = (message: string) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const pinToStatus = (message: string) => {
    addStatusRecord(message, 0, 'popup', '');
    setModalVisible(false);
  };

  const savePlan = async (selectedList: Routine[]) => {
    haptic(haptic_level);
    const date = moment().format('YYYY-MM-DD');
    await saveSuperfoodRoutine(selectedList, date);
    setEditModalVisible(false);
  };

  const renderFooter = () => {
    return (
      <View>
        <View style={[styles.card, { padding: 12 }]}>
          {list.map((item, index) => (
            <CustomCheckbox
              key={index}
              label={item.item}
              onChange={() => handleBulletChange(index)}
              checked={item.checked}
            />
          ))}

          {routineList.map((element, elementIndex) => (
            <View
              key={elementIndex}
              style={[styles.card, { padding: 12, marginVertical: 7 }]}
            >
              <Text style={styles.headerText}>{element.routine}</Text>
              {element.routine_items.map((item, itemIndex) => (
                <CustomCheckbox
                  key={itemIndex}
                  label={item.item}
                  checked={item.checked}
                />
              ))}
            </View>
          ))}

          {routineListDateRange.map((ele, dateIndex) => (
            <View key={dateIndex} style={[styles.card]}>
              <Text style={styles.headerText}>
                {new Date(ele.date).toDateString()}
              </Text>
              {ele.routine.map((element, routineIndex) => (
                <View
                  key={routineIndex}
                  style={[styles.card, { padding: 12, marginVertical: 7 }]}
                >
                  <Text style={styles.headerText}>{element.routine}</Text>
                  {element.routine_items.map((item, itemIndex) => (
                    <CustomCheckbox
                      key={itemIndex}
                      label={item.item}
                      checked={item.checked}
                    />
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        {!props.route?.params?.timeframe ? (
          <View style={[styles.card, styles.qrCode]}>
            <ProductScanner
              onCapture={updateItemList}
              setLoading={setLoading}
            />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={SuperFood}
        angle={126.57}
        gradientColors={['#4CAF50', '#8BC34A']} // Green gradient for superfoods
        title="Today's Diet"
        subtitle="Let's get started!"
        description=" Here's your diet plan for today. Track your food intake and scan items with the QR code."
        loading={loading}
        handleClearChat={handleClearChat}
        handleNotification={handleNotification}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        messages={[...superfoodMessages]}
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

      <ChatMessageModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={selectedMessage}
        onPinToStatus={() => pinToStatus(selectedMessage)}
      />

      <EditPlanModal
        isVisible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        savePlan={() => savePlan(selectedList)}
      />

      {/* Gamification Quick Feedback */}
      {/* {quickFeedback?.visible && quickFeedback.xpEarned !== undefined && (
        <QuickFeedbackToast
          visible={quickFeedback.visible}
          message={quickFeedback.message}
          xpEarned={quickFeedback.xpEarned}
          emoji={quickFeedback.emoji || '🍎'}
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
      marginBottom: 8,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      ...DEffect,
    },
    qrCode: {
      marginVertical: 10,
    },
  });
};

export default SuperfoodScreen;
